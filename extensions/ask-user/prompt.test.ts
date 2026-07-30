import assert from "node:assert/strict";
import test from "node:test";
import { buildAskUserResultMessage } from "./prompt.ts";

test("describes single and custom answers", () => {
  assert.equal(
    buildAskUserResultMessage({
      kind: "selected",
      answer: "TypeScript",
      index: 2,
    }),
    "User selected option 2: TypeScript",
  );
  assert.equal(
    buildAskUserResultMessage({ kind: "custom", answer: "Something else" }),
    "User wrote their own answer: Something else",
  );
});

test("describes multi-select answers in option order", () => {
  assert.equal(
    buildAskUserResultMessage({
      kind: "multi-selected",
      answers: ["Tests", "Documentation"],
      indices: [1, 3],
    }),
    "User selected options 1, 3: Tests, Documentation",
  );
});

test("describes confirmation and text answers", () => {
  assert.equal(
    buildAskUserResultMessage({
      kind: "confirmed",
      answer: false,
      label: "Not yet",
    }),
    "User answered no: Not yet",
  );
  assert.equal(
    buildAskUserResultMessage({ kind: "text", answer: "Use SQLite" }),
    "User answered: Use SQLite",
  );
});

test("dismissal tells the model not to infer an answer", () => {
  assert.match(
    buildAskUserResultMessage({ kind: "dismissed" }),
    /Do not assume an answer/,
  );
});
