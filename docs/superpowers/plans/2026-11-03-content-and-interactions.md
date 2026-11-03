# Content and Interaction Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The user has authorized native autonomous execution without additional interim approvals.

**Goal:** Every expansion/navigation affordance has a meaningful action and useful content, with livelier professional interactions.

**Architecture:** Source-backed editorial data feeds reusable native disclosures and a progressively enhanced guide. A static affordance audit checks all rendered documents; the browser verifies keyboard and interaction behavior. Existing static generation and GitHub Pages publication stay intact.

**Tech Stack:** Node.js built-ins, HTML details/summary, CSS, JavaScript modules; no new dependencies.

**Spec:** `../specs/2026-11-03-content-and-interactions.md`

## Global Constraints

- Keep Portuguese European, original Q.CM identity, 46 routes, historical dates and labelled illustrative images.
- No invented project results, current accreditation, clients, prices or response-time guarantees.
- Keep all essential content in HTML; disclosures work without JavaScript; guide panels all readable if enhancement fails.
- Support keyboard, system/manual reduced motion, 320/390 px and the GitHub Pages repository path.
- Keep real direct contacts; do not simulate form submissions.

## Review Focus

- Plus/arrow icons outside actionable owners: inspect all 46 documents, not just a single service.
- Long scope labels, full text and open disclosures on narrow screens: no clipping/overflow.
- Guide keyboard selection: arrows/Home/End, selected state, panel visibility and focus remain consistent.
- Missing JavaScript and reduced motion: readable content and native disclosures remain useful.
- Context links under `/qcm-horizonte/`: right contact subject and visible interest, without arbitrary URL text injection.

### Task 1: Editorial content and native interactions

**Files:** create `src/data/experience.mjs`, `src/render/experience.mjs`, `tests/experience.test.mjs`; modify `src/render/pages.mjs`, `src/render/shell.mjs`, `scripts/check-build.mjs` and `tests/render.test.mjs`.

**Interfaces:** `areaExperience[service.slug]` exposes `scopes[{body,points}]`, `questions[{question,answer}]`, `guide{title,body,inputs}`. Render helpers consume service + this data. `findInertAffordances(html): string[]` rejects plus/navigation icons with no anchor/button/summary owner.

- [ ] Write tests for coverage of all 30 scopes, meaningful answers, native details, the real hero link, guide fallback and inert-affordance detection; run and observe RED.
- [ ] Add bounded editorial content tied to the six published areas; use native details for all scopes and questions, add contact/case preparation content and the home guide.
- [ ] Run all tests and the 46-page validator; expect PASS and no inert affordances. Commit.

### Task 2: Progressive guide and considered motion

**Files:** create `src/experience.mjs`, modify `src/app.mjs`, `scripts/build.mjs`, styles and build tests.

**Interfaces:** `[data-solution-guide]`, `[data-guide-nav]`, `[data-guide-tab]`, `[data-guide-panel]`; enhancement adds tab roles, keyboard selection and hidden panels. `[data-contact-interest]` shows the allowlisted selected area. Version copied module dependencies as well as the entry point so published updates load consistently.

- [ ] Verify new modules/assets are included in output and old versions cannot mask the interaction change; test dependency URL behavior before implementation.
- [ ] Enhance the guide only after checking its complete structure; on failure leave panels visible. Add short selection/disclosure/focus motion under existing reduced-motion controls.
- [ ] Browser-test all six choices, keyboard selection, native scope/FAQ expansion, selected contact interest, desktop and 320/390 px; run the full checks and commit.

### Task 3: Review, whole-site verification and publication

**Files:** documentation, output audit and screenshots.

- [ ] Request one fresh-context whole-change review against spec and Review Focus; fix Important/Critical findings with a failing regression check where applicable.
- [ ] Run full tests and artifact audit, update README and user-facing notes; commit and push the verified state.
- [ ] Wait for successful GitHub Pages deployment, verify actual public interactions and retain a screenshot of an expanded scope and guide. Export updated source under outputs.
