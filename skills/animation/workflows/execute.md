# Executing an animation plan

Implementation is allowed only for an explicit `execute <plan-path>` request. That request counts as approval unless the plan or user states otherwise.

## Preconditions

1. Read the entire plan and `references/standards.md` from the skill root.
2. Verify the plan path exists and matches current code. Stop on material drift rather than improvising.
3. Identify repository checks and capture `git status --short`. Do not overwrite unrelated work.
4. Prefer an isolated Git worktree for delegated execution. The parent creates it and reports its path; a subagent working directory does not create isolation by itself.

## Execution

1. Implement only the plan’s declared scope and preserve repository conventions.
2. If `subagent_spawn` exists, delegation is optional. Give the executor the full plan path, worktree path, boundaries, and required checks. Otherwise execute sequentially in the parent session.
3. Run the repository’s relevant format, lint, typecheck, test, and build commands.
4. Review the exact resulting diff using `workflows/review.md`.
5. Perform or request the plan’s runtime feel checks, including reduced motion and relevant input methods.

## Finish

Report:

- files changed and checks run;
- review verdict and unresolved feel checks;
- worktree path, branch, and integration status when isolation was used;
- any unrelated pre-existing changes.

Do not merge, commit, delete a worktree, or discard changes unless the user explicitly requests it.
