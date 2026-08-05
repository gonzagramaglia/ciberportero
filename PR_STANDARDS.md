# Pull Request Standards

This document defines the standard PR format for every pull request in the Ciberportero project.
Follow this template exactly so every PR is consistent, professional, and easy to review.

---

## Title Format

Follows Conventional Commits. Must be under 50 characters to avoid GitHub truncation.

```text
<type>(<scope>): <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or page |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependencies |
| `refactor` | Code restructure without behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvements |

**Examples:**
- `feat(rooms): add message pinning`
- `fix(auth): resolve Google OAuth redirect loop`
- `ci(coverage): enforce 80% unit test threshold`
- `refactor(lib): extract validation logic`
- `docs(readme): update technology stack section`

---

## Description Template

Copy and paste this into the GitHub PR description box every time.

```markdown
## 🚀 What is this PR?

[One paragraph. State what it accomplishes at a high level.]

## 🛠️ Key Changes

- **[Area]:** [What was built or changed and why it matters.]
- **[Area]:** [What was built or changed and why it matters.]
- **[Area]:** [What was built or changed and why it matters.]

## 📸 Screenshot / Output

[Drag and drop a screenshot of the UI here. For non-UI changes (testing, config, backend), paste the terminal output or test results instead.]

## ✅ Checklist

- [ ] Build passes successfully (`yarn build`)
- [ ] Tests pass with ≥80% coverage (`yarn test:coverage`)
- [ ] Conventional Commits applied
- [ ] CodeRabbit review addressed (if applicable)
```

---

## Extended Description (Merge Commit)

When GitHub asks for the Extended Description during the merge, use this bullet format:

```text
- [Area]: [What was done — one line.]
- [Area]: [What was done — one line.]
- [Area]: [What was done — one line.]
```

**Example:**
```text
- CI: GitHub Actions workflow with lint, test, and coverage checks.
- CodeRabbit: Assertive auto-review config on PRs to main.
- Coverage: 80% threshold enforced with Vitest.
```

---

## Screenshot / Output Guidelines

- For **UI changes** (components, pages, layouts): screenshot of the actual screen running in the browser.
- For **backend/API changes**: relevant curl output or API response.
- For **non-UI changes** (testing, config, CI): paste the terminal output (e.g. test results, coverage report).
- Always drag the image directly into the GitHub description box — no external hosting needed.
- Delete the placeholder text `[Drag and drop...]` before submitting.

---

## Branch Naming

Branches follow the pattern:

```text
<type>/<short-kebab-description>
```

**Examples:**
- `feat/podcast-search`
- `fix/auth-token-refresh`
- `ci/coderabbit-and-coverage`
- `refactor/calendar-actions`
- `docs/agent-context-files`

---

## PR Draft Generation

Whenever a PR is prepared, the AI assistant must generate a local markdown file containing the **PR Title**, the **Description Template**, and the **Extended Description** for the user to review or copy.
- **Path:** `docs/prs/pr-[number]-[slug].md`
- **Note:** The `docs/prs/` directory is git-ignored, so these drafts won't be pushed.

---

## PR History Reference

| PR | Branch | Description | Status |
|----|--------|-------------|--------|
| #2 | `feat/coderabbit-coverage` | CodeRabbit config & 80% coverage enforcement | ✅ Merged |
| #3 | `docs/agent-context-files` | Agent docs, context files, PR standards | ✅ Merged |
| #4 | `refactor/modularize-actions` | Modularize actions.ts into domain-specific modules | ✅ Merged |
| #5 | `refactor/modularize-translations` | Modularize translations into per-language files | ✅ Merged |
| #6 | `feat/enhance-links-admin` | Link admin image uploads and compact UI | ✅ Merged |
| #7 | `feat/social-links-and-calendar` | Update social links (X, Discord, Twitch, YouTube) and fix calendar date timezone bugs | ✅ Merged |
| #8 | `style/posts-cards-and-images` | UI enhancements for posts, tree/messi images, and admin tweaks | ✅ Merged |
| #9 | `style/ui-enhancements` | Update footer spacing, English banners for posts, and /plan scrollbar | ✅ Merged |
| #10 | `feat/global-music-football-buttons` | Add global floating music and football buttons across pages | ✅ Merged |

*(Update this table every time a PR is opened or merged.)*
