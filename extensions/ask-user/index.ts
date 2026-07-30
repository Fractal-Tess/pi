/**
 * ask_user - Lets the model ask one interactive question.
 *
 * Supported question types:
 * - single: choose one option, with an optional free-form fallback
 * - multi: toggle several options and submit within configured limits
 * - confirm: answer an explicit yes/no decision
 * - text: provide a free-form answer
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StringEnum } from "@earendil-works/pi-ai";
import {
  Editor,
  type EditorTheme,
  Key,
  matchesKey,
  Text,
  truncateToWidth,
} from "@earendil-works/pi-tui";
import { Type, type Static } from "typebox";
import {
  ASK_USER_PARAMETER_DESCRIPTIONS,
  ASK_USER_PROMPT_GUIDELINES,
  ASK_USER_PROMPT_SNIPPET,
  ASK_USER_TOOL_DESCRIPTION,
  buildAskUserResultMessage,
} from "./prompt.ts";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;
const QUESTION_TYPES = ["single", "multi", "confirm", "text"] as const;

type QuestionType = (typeof QUESTION_TYPES)[number];

const OptionSchema = Type.Object({
  label: Type.String({
    description: ASK_USER_PARAMETER_DESCRIPTIONS.optionLabel,
  }),
  description: Type.Optional(
    Type.String({
      description: ASK_USER_PARAMETER_DESCRIPTIONS.optionDescription,
    }),
  ),
});

const AskUserParams = Type.Object({
  type: Type.Optional(
    StringEnum(QUESTION_TYPES, {
      description: ASK_USER_PARAMETER_DESCRIPTIONS.type,
    }),
  ),
  question: Type.String({
    description: ASK_USER_PARAMETER_DESCRIPTIONS.question,
  }),
  options: Type.Optional(
    Type.Array(OptionSchema, {
      minItems: MIN_OPTIONS,
      maxItems: MAX_OPTIONS,
      description: ASK_USER_PARAMETER_DESCRIPTIONS.options,
    }),
  ),
  allowCustom: Type.Optional(
    Type.Boolean({
      description: ASK_USER_PARAMETER_DESCRIPTIONS.allowCustom,
    }),
  ),
  minSelections: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: MAX_OPTIONS,
      description: ASK_USER_PARAMETER_DESCRIPTIONS.minSelections,
    }),
  ),
  maxSelections: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: MAX_OPTIONS,
      description: ASK_USER_PARAMETER_DESCRIPTIONS.maxSelections,
    }),
  ),
  placeholder: Type.Optional(
    Type.String({
      description: ASK_USER_PARAMETER_DESCRIPTIONS.placeholder,
    }),
  ),
  confirmLabel: Type.Optional(
    Type.String({
      description: ASK_USER_PARAMETER_DESCRIPTIONS.confirmLabel,
    }),
  ),
  cancelLabel: Type.Optional(
    Type.String({
      description: ASK_USER_PARAMETER_DESCRIPTIONS.cancelLabel,
    }),
  ),
});

export type AskUserInput = Static<typeof AskUserParams>;

interface AskUserDetails {
  type: QuestionType;
  question: string;
  options: string[];
  answer: string | string[] | boolean | null;
  selectedIndices: number[];
  wasCustom: boolean;
  cancelled: boolean;
}

type SingleSelectionResult = {
  answer: string;
  wasCustom: boolean;
  index?: number;
} | null;

type MultiSelectionResult = {
  answers: string[];
  indices: number[];
} | null;

interface DisplayOption {
  label: string;
  description?: string;
  isOther?: boolean;
}

function wrapText(text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > width && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function validateSelectionQuestion(
  type: "single" | "multi",
  options: DisplayOption[],
) {
  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    throw new Error(
      `ask_user type '${type}' requires between ${MIN_OPTIONS} and ${MAX_OPTIONS} options (got ${options.length}).`,
    );
  }
}

export default function askUser(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user",
    label: "Ask User",
    description: ASK_USER_TOOL_DESCRIPTION,
    promptSnippet: ASK_USER_PROMPT_SNIPPET,
    promptGuidelines: ASK_USER_PROMPT_GUIDELINES,
    parameters: AskUserParams,
    executionMode: "sequential",

    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const type = params.type ?? "single";
      const options = params.options ?? [];
      const optionLabels = options.map((option) => option.label);

      const reply = (
        text: string,
        answer: AskUserDetails["answer"] = null,
        selectedIndices: number[] = [],
        wasCustom = false,
      ) => ({
        content: [{ type: "text" as const, text }],
        details: {
          type,
          question: params.question,
          options: optionLabels,
          answer,
          selectedIndices,
          wasCustom,
          cancelled: answer === null,
        } satisfies AskUserDetails,
      });

      if (type === "single" || type === "multi") {
        validateSelectionQuestion(type, options);
      } else if (options.length > 0) {
        throw new Error(
          `ask_user type '${type}' does not accept options. Omit the options field.`,
        );
      }

      const minSelections = params.minSelections ?? 1;
      const maxSelections = params.maxSelections ?? options.length;
      if (
        type === "multi" &&
        (minSelections > maxSelections || maxSelections > options.length)
      ) {
        throw new Error(
          `ask_user multi-select limits must satisfy 1 <= minSelections <= maxSelections <= ${options.length}.`,
        );
      }

      if (!ctx.hasUI) {
        return reply(buildAskUserResultMessage({ kind: "no-ui" }));
      }

      if (signal?.aborted) {
        return reply(buildAskUserResultMessage({ kind: "cancelled" }));
      }

      const dialogOptions = signal ? { signal } : undefined;

      try {
        if (type === "confirm") {
          const confirmLabel = params.confirmLabel?.trim() || "Yes";
          const cancelLabel = params.cancelLabel?.trim() || "No";
          const answer = await ctx.ui.select(
            params.question,
            [confirmLabel, cancelLabel],
            dialogOptions,
          );

          if (answer === undefined) {
            return reply(
              buildAskUserResultMessage({
                kind: signal?.aborted ? "cancelled" : "dismissed",
              }),
            );
          }

          const confirmed = answer === confirmLabel;
          return reply(
            buildAskUserResultMessage({
              kind: "confirmed",
              answer: confirmed,
              label: answer,
            }),
            confirmed,
            [confirmed ? 1 : 2],
          );
        }

        if (type === "text") {
          const answer = await ctx.ui.input(
            params.question,
            params.placeholder,
            dialogOptions,
          );
          const trimmed = answer?.trim();

          if (!trimmed) {
            return reply(
              buildAskUserResultMessage({
                kind: signal?.aborted ? "cancelled" : "dismissed",
              }),
            );
          }

          return reply(
            buildAskUserResultMessage({ kind: "text", answer: trimmed }),
            trimmed,
            [],
            true,
          );
        }

        if (type === "single" && ctx.mode !== "tui") {
          const allowCustom = params.allowCustom !== false;
          const customLabel = "Write my own answer…";
          const answer = await ctx.ui.select(
            params.question,
            allowCustom ? [...optionLabels, customLabel] : optionLabels,
            dialogOptions,
          );

          if (answer === undefined) {
            return reply(
              buildAskUserResultMessage({
                kind: signal?.aborted ? "cancelled" : "dismissed",
              }),
            );
          }

          if (answer === customLabel) {
            const customAnswer = await ctx.ui.input(
              params.question,
              params.placeholder ?? "Write your answer",
              dialogOptions,
            );
            const trimmed = customAnswer?.trim();
            if (!trimmed) {
              return reply(
                buildAskUserResultMessage({
                  kind: signal?.aborted ? "cancelled" : "dismissed",
                }),
              );
            }
            return reply(
              buildAskUserResultMessage({ kind: "custom", answer: trimmed }),
              trimmed,
              [],
              true,
            );
          }

          const index = optionLabels.indexOf(answer) + 1;
          return reply(
            buildAskUserResultMessage({
              kind: "selected",
              answer,
              index,
            }),
            answer,
            [index],
          );
        }

        if (type === "multi" && ctx.mode !== "tui") {
          return reply(buildAskUserResultMessage({ kind: "no-ui" }));
        }

        if (type === "single") {
          const allowCustom = params.allowCustom !== false;
          const allOptions: DisplayOption[] = allowCustom
            ? [...options, { label: "Write my own answer…", isOther: true }]
            : options;

          const result = await ctx.ui.custom<SingleSelectionResult>(
            (tui, theme, _kb, done) => {
              let optionIndex = 0;
              let editMode = false;
              let cachedLines: string[] | undefined;
              let settled = false;

              const finish = (result: SingleSelectionResult) => {
                if (settled) return;
                settled = true;
                signal?.removeEventListener("abort", cancel);
                done(result);
              };

              const cancel = () => finish(null);
              signal?.addEventListener("abort", cancel, { once: true });
              if (signal?.aborted) queueMicrotask(cancel);

              const editorTheme: EditorTheme = {
                borderColor: (text) => theme.fg("accent", text),
                selectList: {
                  selectedPrefix: (text) => theme.fg("accent", text),
                  selectedText: (text) => theme.fg("accent", text),
                  description: (text) => theme.fg("muted", text),
                  scrollInfo: (text) => theme.fg("dim", text),
                  noMatch: (text) => theme.fg("warning", text),
                },
              };
              const editor = new Editor(tui, editorTheme);

              const refresh = () => {
                cachedLines = undefined;
                tui.requestRender();
              };

              editor.onSubmit = (value) => {
                const trimmed = value.trim();
                if (trimmed) {
                  finish({ answer: trimmed, wasCustom: true });
                } else {
                  editMode = false;
                  editor.setText("");
                  refresh();
                }
              };

              const selectOption = (index: number) => {
                const selected = allOptions[index];
                if (!selected) return;
                if (selected.isOther) {
                  optionIndex = index;
                  editMode = true;
                  refresh();
                } else {
                  finish({
                    answer: selected.label,
                    wasCustom: false,
                    index: index + 1,
                  });
                }
              };

              const handleInput = (data: string) => {
                if (editMode) {
                  if (matchesKey(data, Key.escape)) {
                    editMode = false;
                    editor.setText("");
                    refresh();
                    return;
                  }
                  editor.handleInput(data);
                  refresh();
                  return;
                }

                if (matchesKey(data, Key.up)) {
                  optionIndex =
                    (optionIndex - 1 + allOptions.length) % allOptions.length;
                  refresh();
                  return;
                }
                if (matchesKey(data, Key.down)) {
                  optionIndex = (optionIndex + 1) % allOptions.length;
                  refresh();
                  return;
                }
                if (
                  data.length === 1 &&
                  data >= "1" &&
                  data <= String(allOptions.length)
                ) {
                  selectOption(Number(data) - 1);
                  return;
                }
                if (matchesKey(data, Key.enter)) {
                  selectOption(optionIndex);
                  return;
                }
                if (matchesKey(data, Key.escape)) {
                  finish(null);
                }
              };

              const render = (width: number) => {
                if (cachedLines) return cachedLines;

                const lines: string[] = [];
                const add = (text: string) =>
                  lines.push(truncateToWidth(text, width));
                const title = " Single choice ";
                add(
                  theme.fg(
                    "accent",
                    `─${title}${"─".repeat(Math.max(0, width - title.length - 1))}`,
                  ),
                );
                for (const line of wrapText(
                  params.question,
                  Math.max(10, width - 2),
                )) {
                  add(` ${theme.fg("text", theme.bold(line))}`);
                }
                lines.push("");

                for (let index = 0; index < allOptions.length; index++) {
                  const option = allOptions[index];
                  const selected = index === optionIndex;
                  const prefix = selected ? theme.fg("accent", " ❯ ") : "   ";
                  const marker = option.isOther ? "✎" : `${index + 1}.`;
                  const label = `${marker} ${option.label}`;
                  add(
                    prefix +
                      theme.fg(
                        selected || (option.isOther && editMode)
                          ? "accent"
                          : option.isOther
                            ? "muted"
                            : "text",
                        label,
                      ),
                  );
                  if (option.description) {
                    add(`      ${theme.fg("muted", option.description)}`);
                  }
                }

                if (editMode) {
                  lines.push("");
                  add(theme.fg("muted", " Your answer:"));
                  for (const line of editor.render(Math.max(1, width - 2))) {
                    add(` ${line}`);
                  }
                }

                lines.push("");
                add(
                  theme.fg(
                    "dim",
                    editMode
                      ? " Enter submit • Esc back to options"
                      : ` ↑↓ or 1-${allOptions.length} select • Enter confirm • Esc dismiss`,
                  ),
                );
                add(theme.fg("accent", "─".repeat(width)));
                cachedLines = lines;
                return lines;
              };

              return {
                get focused() {
                  return editor.focused;
                },
                set focused(value: boolean) {
                  editor.focused = value;
                },
                render,
                invalidate: () => {
                  cachedLines = undefined;
                  editor.invalidate();
                },
                handleInput,
                dispose: () => signal?.removeEventListener("abort", cancel),
              };
            },
          );

          if (!result) {
            return reply(
              buildAskUserResultMessage({
                kind: signal?.aborted ? "cancelled" : "dismissed",
              }),
            );
          }
          if (result.wasCustom) {
            return reply(
              buildAskUserResultMessage({
                kind: "custom",
                answer: result.answer,
              }),
              result.answer,
              [],
              true,
            );
          }

          return reply(
            buildAskUserResultMessage({
              kind: "selected",
              answer: result.answer,
              index: result.index,
            }),
            result.answer,
            result.index ? [result.index] : [],
          );
        }

        const result = await ctx.ui.custom<MultiSelectionResult>(
          (tui, theme, _kb, done) => {
            let rowIndex = 0;
            let cachedLines: string[] | undefined;
            let validationMessage = "";
            let settled = false;
            const selected = new Set<number>();
            const submitRow = options.length;

            const finish = (result: MultiSelectionResult) => {
              if (settled) return;
              settled = true;
              signal?.removeEventListener("abort", cancel);
              done(result);
            };

            const cancel = () => finish(null);
            signal?.addEventListener("abort", cancel, { once: true });
            if (signal?.aborted) queueMicrotask(cancel);

            const refresh = () => {
              cachedLines = undefined;
              tui.requestRender();
            };

            const toggle = (index: number) => {
              validationMessage = "";
              if (selected.has(index)) {
                selected.delete(index);
              } else if (selected.size >= maxSelections) {
                validationMessage = `Choose at most ${maxSelections}.`;
              } else {
                selected.add(index);
              }
              refresh();
            };

            const submit = () => {
              if (selected.size < minSelections) {
                validationMessage = `Choose at least ${minSelections}.`;
                refresh();
                return;
              }

              const indices = [...selected]
                .sort((left, right) => left - right)
                .map((index) => index + 1);
              finish({
                indices,
                answers: indices.map((index) => options[index - 1].label),
              });
            };

            const handleInput = (data: string) => {
              if (matchesKey(data, Key.up)) {
                rowIndex =
                  (rowIndex - 1 + options.length + 1) % (options.length + 1);
                validationMessage = "";
                refresh();
                return;
              }
              if (matchesKey(data, Key.down)) {
                rowIndex = (rowIndex + 1) % (options.length + 1);
                validationMessage = "";
                refresh();
                return;
              }
              if (
                data.length === 1 &&
                data >= "1" &&
                data <= String(options.length)
              ) {
                rowIndex = Number(data) - 1;
                toggle(rowIndex);
                return;
              }
              if (matchesKey(data, Key.space)) {
                if (rowIndex === submitRow) submit();
                else toggle(rowIndex);
                return;
              }
              if (matchesKey(data, Key.enter)) {
                if (rowIndex === submitRow) submit();
                else toggle(rowIndex);
                return;
              }
              if (matchesKey(data, Key.escape)) {
                finish(null);
              }
            };

            const render = (width: number) => {
              if (cachedLines) return cachedLines;

              const lines: string[] = [];
              const add = (text: string) =>
                lines.push(truncateToWidth(text, width));
              const title = " Multiple choice ";
              add(
                theme.fg(
                  "accent",
                  `─${title}${"─".repeat(Math.max(0, width - title.length - 1))}`,
                ),
              );
              for (const line of wrapText(
                params.question,
                Math.max(10, width - 2),
              )) {
                add(` ${theme.fg("text", theme.bold(line))}`);
              }
              lines.push("");

              for (let index = 0; index < options.length; index++) {
                const option = options[index];
                const active = index === rowIndex;
                const checked = selected.has(index);
                const prefix = active ? theme.fg("accent", " ❯ ") : "   ";
                const checkbox = checked ? theme.fg("success", "[✓]") : "[ ]";
                add(
                  `${prefix}${checkbox} ${theme.fg(active ? "accent" : "text", `${index + 1}. ${option.label}`)}`,
                );
                if (option.description) {
                  add(`       ${theme.fg("muted", option.description)}`);
                }
              }

              lines.push("");
              const submitActive = rowIndex === submitRow;
              add(
                `${submitActive ? theme.fg("accent", " ❯ ") : "   "}${theme.fg(submitActive ? "accent" : "success", `✓ Submit ${selected.size} selection${selected.size === 1 ? "" : "s"}`)}`,
              );
              if (validationMessage) {
                add(`   ${theme.fg("warning", validationMessage)}`);
              } else {
                add(
                  `   ${theme.fg("muted", `Choose ${minSelections === maxSelections ? minSelections : `${minSelections}-${maxSelections}`}.`)}`,
                );
              }

              lines.push("");
              add(
                theme.fg(
                  "dim",
                  ` ↑↓ navigate • Space/Enter toggle • 1-${options.length} quick toggle • Submit row confirms • Esc dismiss`,
                ),
              );
              add(theme.fg("accent", "─".repeat(width)));
              cachedLines = lines;
              return lines;
            };

            return {
              render,
              invalidate: () => {
                cachedLines = undefined;
              },
              handleInput,
              dispose: () => signal?.removeEventListener("abort", cancel),
            };
          },
        );

        if (!result) {
          return reply(
            buildAskUserResultMessage({
              kind: signal?.aborted ? "cancelled" : "dismissed",
            }),
          );
        }

        return reply(
          buildAskUserResultMessage({
            kind: "multi-selected",
            answers: result.answers,
            indices: result.indices,
          }),
          result.answers,
          result.indices,
        );
      } catch (error) {
        if (signal?.aborted) {
          return reply(buildAskUserResultMessage({ kind: "cancelled" }));
        }
        throw error;
      }
    },

    renderCall(args, theme, _context) {
      const type =
        typeof args.type === "string" ? args.type : ("single" as const);
      let text = theme.fg("toolTitle", theme.bold("ask_user "));
      text += theme.fg("accent", `[${type}] `);
      text += theme.fg(
        "muted",
        typeof args.question === "string" ? args.question : "",
      );
      const options = Array.isArray(args.options)
        ? (args.options as DisplayOption[])
        : [];
      if (options.length > 0) {
        const numbered = options.map(
          (option, index) => `${index + 1}. ${option.label}`,
        );
        text += `\n${theme.fg("dim", `  ${numbered.join("  ")}`)}`;
      }
      return new Text(text, 0, 0);
    },

    renderResult(result, _options, theme, _context) {
      const details = result.details as AskUserDetails | undefined;
      if (!details) {
        const first = result.content[0];
        return new Text(first?.type === "text" ? first.text : "", 0, 0);
      }

      if (details.cancelled || details.answer === null) {
        return new Text(theme.fg("warning", "✗ dismissed"), 0, 0);
      }

      if (details.type === "confirm" && typeof details.answer === "boolean") {
        return new Text(
          theme.fg("success", "✓ ") +
            theme.fg("accent", details.answer ? "Yes" : "No"),
          0,
          0,
        );
      }

      if (Array.isArray(details.answer)) {
        const display = details.answer
          .map((answer, index) => {
            const selectedIndex = details.selectedIndices[index];
            return selectedIndex ? `${selectedIndex}. ${answer}` : answer;
          })
          .join(", ");
        return new Text(
          theme.fg("success", "✓ ") + theme.fg("accent", display),
          0,
          0,
        );
      }

      if (details.wasCustom) {
        return new Text(
          theme.fg("success", "✓ ") +
            theme.fg("muted", "(wrote) ") +
            theme.fg("accent", String(details.answer)),
          0,
          0,
        );
      }

      const selectedIndex = details.selectedIndices[0];
      const display = selectedIndex
        ? `${selectedIndex}. ${String(details.answer)}`
        : String(details.answer);
      return new Text(
        theme.fg("success", "✓ ") + theme.fg("accent", display),
        0,
        0,
      );
    },
  });
}
