# Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/code-standards.md
4. PR_STANDARDS.md

## Rules That Never Change

• If the same problem persists after one corrective prompt, stop immediately and rethink the approach.
• Always use `yarn` as the package manager.
• All PRs go through CodeRabbit review before merging to `main`.
• Never push directly to `main`.
• Conventional Commits enforced via commitlint + Husky commit-msg hook.
• Coverage threshold is 80% — never merge code that drops below it.
