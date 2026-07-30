/** Model-facing schema descriptions for ask_user's supported question types. */
export const ASK_USER_PARAMETER_DESCRIPTIONS = {
  type: "Question type. Defaults to 'single' for backwards compatibility. Use 'single' for one option, 'multi' for several options, 'confirm' for yes/no, or 'text' for free-form input.",
  optionLabel: "Short display label for this option",
  optionDescription: "Optional one-line description shown below the label",
  question: "The single question to ask the user",
  options:
    "Answer options for single and multi questions (2-8). Omit for confirm and text questions.",
  allowCustom:
    "For single-choice questions, whether to append a free-form answer option. Defaults to true.",
  minSelections:
    "For multi-select questions, the minimum number of required selections. Defaults to 1.",
  maxSelections:
    "For multi-select questions, the maximum number of selections. Defaults to all options.",
  placeholder: "Optional placeholder for a text question",
  confirmLabel: "Affirmative label for a confirm question. Defaults to Yes.",
  cancelLabel: "Negative label for a confirm question. Defaults to No.",
};

/** Describes ask_user's four interactive question shapes. */
export const ASK_USER_TOOL_DESCRIPTION =
  "Ask the user one interactive question. Supports single-choice, multi-select, yes/no confirmation, and free-form text. Single-choice questions may include a custom-answer fallback. The user may dismiss any question without answering. Ask exactly one question per call.";

/** Adds ask_user's interactive question capability to the model prompt. */
export const ASK_USER_PROMPT_SNIPPET =
  "Ask one single-choice, multi-select, confirmation, or free-text question";

/** Guides the model to choose an appropriate question type. */
export const ASK_USER_PROMPT_GUIDELINES = [
  "Use ask_user when a decision or missing preference blocks progress instead of asking an interactive question in plain text.",
  "Use ask_user type 'single' for exactly one choice, 'multi' when several choices may apply, 'confirm' for a binary decision, and 'text' for an open-ended answer.",
  "Ask one question per ask_user call; ask follow-up questions in subsequent calls.",
];

/** Builds the behavioral tool-result message returned to the parent model. */
export function buildAskUserResultMessage(
  outcome:
    | { kind: "no-ui" }
    | { kind: "cancelled" }
    | { kind: "dismissed" }
    | { kind: "custom"; answer: string }
    | { kind: "selected"; answer: string; index: number | undefined }
    | { kind: "multi-selected"; answers: string[]; indices: number[] }
    | { kind: "confirmed"; answer: boolean; label: string }
    | { kind: "text"; answer: string },
) {
  switch (outcome.kind) {
    case "no-ui":
      return "No interactive UI is available, so the question could not be shown. Ask the user in plain text instead.";
    case "cancelled":
      return "Cancelled";
    case "dismissed":
      return "User dismissed the question without answering. Do not assume an answer; proceed accordingly or ask differently.";
    case "custom":
      return `User wrote their own answer: ${outcome.answer}`;
    case "selected":
      return `User selected option ${outcome.index}: ${outcome.answer}`;
    case "multi-selected":
      return `User selected options ${outcome.indices.join(", ")}: ${outcome.answers.join(", ")}`;
    case "confirmed":
      return `User answered ${outcome.answer ? "yes" : "no"}: ${outcome.label}`;
    case "text":
      return `User answered: ${outcome.answer}`;
  }
}
