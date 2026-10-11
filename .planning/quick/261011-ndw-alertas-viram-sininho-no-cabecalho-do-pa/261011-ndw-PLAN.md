---
phase: quick-261011-ndw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/ui/src/primitives/IconButton.tsx
  - packages/ui/tests/button.test.tsx
  - apps/web/components/dashboard/AlertsBell.tsx
  - apps/web/components/dashboard/AlertsBell.test.tsx
  - apps/web/components/dashboard/PanelHeader.tsx
  - apps/web/components/dashboard/TenantAdminPanel.tsx
  - apps/web/components/dashboard/PlatformOwnerPanel.tsx
  - apps/web/components/dashboard/PlatformAdminPanel.tsx
  - apps/web/messages/pt-BR/dashboard.json
  - apps/web/e2e-preview/painel-preview.spec.ts
autonomous: true
requirements: [V2-PLAT-04, PWA-03]
tags: [dashboard, preview, disclosure, client-component, a11y, next-intl, pt-BR]

estimate:
  tokens: 55000
  raw_tokens: 55000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On levels 1 (dono-da-plataforma), 2 (admin-da-plataforma) and 5 (admin-do-cliente) the alert list is no longer in the panel body: there is no 'Atenção…' or 'Pendências…' section heading, and each alert's text exists exactly once in the DOM, inside the bell's panel, hidden until the bell is opened (D-01)."
    - "Levels 1, 2 and 5 show a lucide Bell button in the header's top row, on the right beside the period pill, with a visible count badge and the accessible name 'Alertas, N' from the catalog (2, 4 and 3). The badge is danger-filled when any alert has the danger tone (levels 2 and 5) and brand-filled otherwise (level 1); the count is always text (D-02)."
    - "Clicking the bell opens a panel anchored under the header, titled 'Alertas (N)', listing all N alerts with the same content as before (tone label icon+text, title, detail). At 1440x900 it stays inside the phone screen's box and the screen gains no sideways scroll; at 390 px it is full width with no horizontal page scroll; past its max height it scrolls vertically on its own (D-03)."
    - "The bell carries aria-expanded and aria-controls; Escape closes the panel and returns focus to the bell with a visible focus ring; a press outside closes it; pressing the bell again closes it (D-04)."
    - "Levels 3, 4, 6 and 7 (suporte-da-plataforma, dono-do-cliente, equipe-do-cliente, membro) render no bell (D-04)."
    - "The removed sections' catalog keys (the three section titles and the level-2 'Ver todas' action) and the panels' list imports are gone; the KPIs, charts, tables and other sections are unchanged; pnpm lint, typecheck, test, boundaries, check:static-routes and the preview Playwright suite are green (D-05)."
  artifacts:
    - path: "apps/web/components/dashboard/AlertsBell.tsx"
      provides: "'use client' disclosure: IconButton trigger + absolutely positioned panel, Escape / outside press / toggle close"
      contains: "'use client'"
    - path: "apps/web/components/dashboard/AlertsBell.test.tsx"
      provides: "happy-dom unit test of open/close/Escape/outside press/toggle, aria wiring and badge tone"
    - path: "apps/web/components/dashboard/PanelHeader.tsx"
      provides: "async server header with an optional alerts prop; renders the bell with the server-rendered alert list as children"
      contains: "alerts"
    - path: "packages/ui/src/primitives/IconButton.tsx"
      provides: "typed ref passthrough and badgeClassName for the count badge"
      contains: "badgeClassName"
    - path: "apps/web/messages/pt-BR/dashboard.json"
      provides: "dashboard.alerts.button 'Alertas, {count}' and dashboard.alerts.title 'Alertas ({count})'"
      contains: "\"alerts\""
    - path: "apps/web/e2e-preview/painel-preview.spec.ts"
      provides: "bell e2e for levels 1, 2, 5 at 1440x900 and 390 px plus the no-bell levels"
      contains: "alerts bell"
  key_links:
    - from: "apps/web/components/dashboard/{TenantAdminPanel,PlatformOwnerPanel,PlatformAdminPanel}.tsx"
      to: "apps/web/components/dashboard/PanelHeader.tsx"
      via: "alerts={items.map(...)} prop (already-translated AttentionItem[])"
      pattern: "alerts=\\{"
    - from: "apps/web/components/dashboard/PanelHeader.tsx"
      to: "apps/web/components/dashboard/AlertsBell.tsx"
      via: "server-rendered title + module list passed as children of the client component"
      pattern: "<AlertsBell"
    - from: "apps/web/components/dashboard/AlertsBell.tsx"
      to: "packages/ui/src/primitives/IconButton.tsx"
      via: "ref for focus return on Escape, badgeClassName for the non-urgent tone"
      pattern: "badgeClassName"
    - from: "AlertsBell panel (position absolute)"
      to: "PanelHeader root (position relative)"
      via: "containing block: the panel spans the header's width and never leaves the panel's own box"
      pattern: "relative"
---

<objective>
Move the alert lists of levels 1, 2 and 5 out of the panel body into a bell in the panel header. The bell opens a dropdown that holds every alert, inside the panel's own box. The dropdown also stays inside the iPhone screen when the panel is framed (CONTEXT locked decisions 1-5, cited here as D-01..D-05 in order).

Purpose: the inline "Atenção" / "Pendências" sections between the header and the KPIs clutter the view (D-01). One bell pattern gives the same information on demand (D-02..D-04).

Output: a small `'use client'` disclosure component (`AlertsBell`) with a unit test. A header `alerts` prop. Two optional props on the shared `IconButton`. Catalog keys swapped. An extended preview e2e suite. Screenshots in this task's `screens/` folder, not committed.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/261011-ndw-CONTEXT.md
@.planning/quick/261011-l72-mockup-iphone-17-pro-max-na-pre-visualiz/261011-l72-SUMMARY.md
@apps/web/AGENTS.md
@apps/web/components/dashboard/PanelHeader.tsx
@apps/web/components/dashboard/TenantAdminPanel.tsx
@apps/web/components/dashboard/PhoneMockup.tsx
@packages/ui/src/primitives/IconButton.tsx
@packages/modules/dashboard/ui/AttentionList.tsx
@apps/web/e2e-preview/painel-preview.spec.ts

<interfaces>
Verified on branch `feat/painel-preview`, HEAD 0f6a0785.

**Shared primitive: IconButton** (`packages/ui/src/primitives/IconButton.tsx`)
- Already `'use client'`.
- Line 8: `IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`, with `icon: LucideIcon`, `label: string` (becomes `aria-label`), `size?: number` and `count?: number`.
- It destructures its own props and spreads the rest onto the `<button>`. Because React 19 passes `ref` as a plain prop, a `ref` already reaches the button at runtime, but the props type does not allow it.
- Line 44 renders the badge as `<Badge count={count} />` inside an absolutely positioned span, inside the button.
- The button keeps the 44x44 target and the `focus-visible:ring-2 ring-brand` focus ring.
- Precedents:
  - `data-*` hooks and `aria-expanded` passed through: `apps/web/components/admin/ProfileAdminTrigger.tsx:127`.
  - Existing IconButton tests: `packages/ui/tests/button.test.tsx:139-156`, happy-dom.

**Shared primitive: Badge** (`packages/ui/src/primitives/Badge.tsx:35`)
- Base classes: `bg-danger … text-white`; `className` is merged by `cn` (tailwind-merge 3.7.0).
- Checked with node: twMerge(base, 'bg-brand text-on-brand') keeps `bg-brand text-on-brand` and drops `bg-danger` and `text-white`.
- It renders nothing for a count of 0 or less.

**The list: AttentionList** (`packages/modules/dashboard/ui/AttentionList.tsx`, module `@rede-social/module-dashboard/ui`)
- `AttentionItem { id; tone: LabelTone ('success'|'warning'|'danger'|'neutral'|'brand'); tag; title; detail? }`.
- `AttentionList({ items })` renders a `Card` > `ul` of rows: ToneLabel (icon + text), title, detail.
- It is directive-less, so a server component can render it and hand the result to a client component as children.

**The header: PanelHeader** (`apps/web/components/dashboard/PanelHeader.tsx`)
- Currently sync, with props `{ title; subtitle?; period? }`.
- Root: `flex items-center justify-between gap-3`. On the right, `period` renders as `<StatusPill className="shrink-0">`.
- All 7 panels are async server components that render it.
- No file under `apps/web/components/dashboard` or `packages/modules/dashboard/ui` carries `'use client'` today (grep). AlertsBell is the first.

**Where the inline sections are today**
- Level 1, `PlatformOwnerPanel.tsx`:
  - `attentionItem()` mapper at lines 31-50.
  - Inline section at lines 116-118, with title key `platformOwner.attention` → `title` "Atenção".
- Level 2, `PlatformAdminPanel.tsx`:
  - `pendingItem()` mapper at lines 28-63.
  - Inline section with title (`platformAdmin.pending` → `title` "Pendências ({count})") and its disabled action (`platformAdmin.pending` → `action` "Ver todas") at lines ~87-92.
- Level 5, `TenantAdminPanel.tsx`:
  - `attentionItem()` mapper at lines 28-60.
  - Inline section at lines 85-87 (`tenantAdmin.attention` → `title` "Atenção ({count})").
- Every per-item key (tags, titles, details) stays: the mappers still produce the items.

**Fixture counts** (`packages/modules/dashboard/fixtures`)

| Level | Fixture | Alerts | Tones |
|---|---|---|---|
| 1 | `platformOwnerPanel.attention` | 2 | both warning |
| 2 | `platformAdminPanel.pending` | 4 | `domain_expired` = danger |
| 5 | `tenantAdminPanel.attention` | 3 | `a-support` severity danger |

**Inside the phone screen** (`PhoneMockup.tsx`)
- From lg up, the screen `section[data-phone-screen]` is 440x956: `lg:relative lg:overflow-x-hidden lg:overflow-y-auto`.
- Its sticky status bar is `z-10`.
- The panel sits in a `@container` wrapper with `lg:px-4`, so content is 408 px wide.
- The bezel is scaled with a CSS transform. That is why the dropdown must not be a portal, a top-layer element or viewport-positioned (D-03). An absolutely positioned child of the header scrolls and scales with the panel.

**Precedents and platform facts**
- Outside-press precedent: `apps/web/components/forms/SelectMenu.tsx:379-391` registers a capture-phase document `pointerdown` listener while open and closes when the target is outside the trigger/list. Reuse that shape.
- Tailwind v4 preflight (installed tailwindcss 4.x `preflight.css:396`): `[hidden]:where(:not([hidden='until-found'])) { display: none !important; }`. A `hidden` attribute always hides an element, even one with a display utility.
- Tailwind v4 accepts bare integers for z-index (`z-5`).

**Web tests and lint**
- Web unit tests run under node. Component tests opt in with a first-line `// @vitest-environment happy-dom` docblock (precedent `apps/web/components/platform/WizardStep.test.tsx`).
- `@testing-library/react` 16.3.3 and happy-dom 20.14.5 are web devDependencies.
- Biome `noJsxLiterals` and `scripts/check-ui-literals.sh` both skip `*.test.tsx`.

**Preview e2e run**
- Config: `apps/web/playwright.preview.config.ts`, Google Chrome, `next dev` on :3000, `reuseExistingServer: true`.
- `loadMessages()` memoises the catalog per process, so any server already on :3000 must be stopped before a run that follows a catalog change.
- Dark theme comes from the `rede_theme=dark` cookie (`packages/contracts/src/branding.ts:255`).
- The preview h1 (`PreviewChrome.tsx:31`) sits outside the panel at every width. Tests use it as a safe "outside" click target.

**PREVIEW_ENV** (placeholder env every gate below needs; nothing listens on these):
API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder
</interfaces>

## Multi-source coverage audit

| Source | Item | Covered by |
|---|---|---|
| GOAL | Alerts become a header bell with a list on click | Tasks 1-3 |
| CONTEXT D-01 | Remove the inline Atenção (L1, L5) and Pendências (L2) sections | Task 1 (L5), Task 2 (L1, L2); e2e Task 1/3 |
| CONTEXT D-02 | Bell beside the period pill in PanelHeader top row on L1/L2/L5, existing IconButton/Badge, catalog name "Alertas, N", danger badge if any danger else brand, count as text | Task 1 (IconButton props, PanelHeader, AlertsBell), Task 2 (unit test of tone), Task 3 (e2e count on all three) |
| CONTEXT D-03 | Dropdown under the bell inside the panel box, same row content via AttentionList, one title pattern "Alertas (N)", inside the iPhone screen (absolute, no portal / top layer / viewport positioning), full width below lg, max height + own vertical scroll, fits 408 px | Task 1 (AlertsBell + PanelHeader), Task 3 (e2e bounds on L1/L2/L5 at 1440 and 390) |
| CONTEXT D-04 | aria-expanded/aria-controls, Escape closes + focus to bell, outside press closes, toggle closes, focus visible, small 'use client' component in components/dashboard, server passes translated data, no bell on L3/L4/L6/L7 | Task 1 (component), Task 2 (unit test), Task 3 (e2e no-bell levels) |
| CONTEXT D-05 | Remove unused keys/props/code; everything else unchanged | Task 1 (L5 key), Task 2 (L1/L2 keys, "Ver todas", imports; catalog script), Task 3 (full suite unchanged-elsewhere) |
| CONTEXT Verification | lint (+literals), typecheck, test, boundaries with placeholder env; preview Playwright updated (L1/L2/L5 at 1440x900 and 390: no inline list, right count, open with all items, Escape + focus, outside close, within phone bounds, no horizontal scroll; no bell on 3/4/6/7); unit test; screenshots (L1/L2/L5 framed open light, L5 open dark, L5 closed 390) uncommitted | Task 2 (unit), Task 3 (all gates, e2e, screenshots) |
| REQ | V2-PLAT-04 (tenant analytics dashboard, preview of), PWA-03 (all UI text in the pt-BR catalog) | Tasks 1-3 |
| RESEARCH | none (quick task, no research phase) | n/a |

Planner's calls (discretion named in CONTEXT):
- **One title pattern.** Level 2 drops "Pendências", so all three levels use "Alertas (N)". This matches the bell's own name ("Alertas, N"), so the button and its panel say the same word.
- **Non-urgent badge tone is brand** (`bg-brand text-on-brand`). The tenant's contrast-checked on-brand pair keeps the numeral legible in both themes, and danger stays reserved for "something is red".
- **The dropdown spans the header's full width** (`inset-x-0` against the header's `relative` root). That is 408 px framed and full width unframed, so there is no separate width rule and no horizontal overflow.
- **PanelHeader becomes async and owns the bell copy.** It calls `getTranslations('dashboard.alerts')`, so the three panels only pass their items and cannot drift apart.
- **IconButton gets a typed `ref` and a `badgeClassName`.** Rendering the badge outside the button would duplicate its positioning. A hand-rolled button would duplicate its 44 px target and focus ring.
- **No bell for an empty or absent list.** The fixtures always have alerts. An empty state for real data ("nenhum alerta") is the same follow-up the jqy flow-critic already recorded for the real panels' lists, and it is out of scope here.

<tasks>

<task type="tracer">
  <name>Task 1: Level 5's alerts move into a header bell, end-to-end on one level</name>
  <files>packages/ui/src/primitives/IconButton.tsx, apps/web/components/dashboard/AlertsBell.tsx, apps/web/components/dashboard/PanelHeader.tsx, apps/web/components/dashboard/TenantAdminPanel.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - apps/web/components/dashboard/PanelHeader.tsx (whole file, 32 lines)
    - apps/web/components/dashboard/TenantAdminPanel.tsx lines 1-100 (imports, mapper, header, inline section)
    - packages/ui/src/primitives/IconButton.tsx (whole file)
    - apps/web/components/forms/SelectMenu.tsx lines 379-391 (outside-press listener shape)
    - apps/web/components/dashboard/PhoneMockup.tsx (screen box, z-10 status bar, @container wrapper)
    - apps/web/e2e-preview/painel-preview.spec.ts lines 1-80 (constants and helpers to reuse)
  </read_first>
  <action>
**1. IconButton (`packages/ui/src/primitives/IconButton.tsx`, shared primitive, per D-02).** Add two optional props to `IconButtonProps`:
- `ref?: Ref<HTMLButtonElement>` (type import from react). This is a type-only change: React 19 already passes `ref` as a prop and the existing rest-spread forwards it to the button. Add a one-line WHY comment.
- `badgeClassName?: string`, forwarded as `className` to the existing count `Badge`. Doc comment: it overrides the badge fill/text tone, merged by `cn`.

Change nothing else in the primitive: no new default, same markup, same classes.

**2. New `apps/web/components/dashboard/AlertsBell.tsx` (per D-04).**
- First line `'use client'`. Export only the component `AlertsBell` and its props type `AlertsBellProps`: `{ label: string; count: number; urgent: boolean; children: ReactNode }`.
- It holds `open` state (default false), `panelId` from `useId()`, a `rootRef` on its root div and a `buttonRef` for the bell.
- Render a root `div` with ref `rootRef` and NO position class. The panel must anchor to PanelHeader's root, not to this div.
- Inside it, render `IconButton`:
  - `icon` = lucide `Bell`, `label` = `label`, `count` = `count`, `ref` = `buttonRef`.
  - `badgeClassName`: `'bg-brand text-on-brand'` when `urgent` is false, undefined when true (danger stays the primitive's default) (D-02).
  - `aria-expanded={open}`, `aria-controls={panelId}`, `data-alerts-bell`, `onClick` toggling `open` (D-04 toggle close).
- Then render the panel `div`:
  - `id={panelId}`, `data-alerts-panel`, `hidden={!open}`.
  - Classes: `absolute inset-x-0 top-full z-5 mt-2 max-h-96 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-bg-secondary p-3 shadow-lg`. These are positioning and surface only, no display utility. The preflight `[hidden]` rule keeps it hidden either way.
  - It renders `children`.
  - `z-5` keeps it above the panel content and below the phone's `z-10` sticky status bar when the screen scrolls.
  - It must never leave the panel's own box: no portal, no top layer, no viewport positioning (D-03). The bezel transform would misplace any of those.
- A `useEffect` keyed on `open` registers two document listeners while open and removes both in its cleanup:
  - Capture-phase `pointerdown` (the SelectMenu shape): if the event target is a Node outside `rootRef`, set `open` false. Do not move focus, because the user pointed elsewhere.
  - `keydown`: on `event.key === 'Escape'`, set `open` false and call `buttonRef.current?.focus()` (D-04).
- No other behaviour: no focus trap and no focus move on open. This is a disclosure; the rows are not interactive.
- Comment only the non-obvious WHY (anchored to the header's relative root; why not a portal or the top layer).

**3. PanelHeader (`apps/web/components/dashboard/PanelHeader.tsx`, per D-02/D-03).**
- Make it an `async` function and add an optional prop `alerts?: readonly AttentionItem[]`, typed from `@rede-social/module-dashboard/ui`.
- Add `relative` to the root div's classes. It becomes the dropdown's containing block.
- Replace the lone right-side pill with a right cluster `div` (`flex shrink-0 items-center gap-1`). It holds the existing period `StatusPill` (unchanged when `period` is set), then, only when `alerts` has at least one item, `AlertsBell` with:
  - `label` = `t('button', { count })`.
  - `count` = `alerts.length`.
  - `urgent` = whether any item's tone is `'danger'`.
  - As children, one `div` (`flex flex-col gap-3`) holding a `SectionTitle` (`as="h3"`, `variant="group"`) with `t('title', { count })`, followed by the module's list component rendering `alerts`.
- `t` comes from `getTranslations('dashboard.alerts')`.
- Update the doc comment: the bell sits on the right next to the period, and its list opens under the header.

**4. Catalog (`apps/web/messages/pt-BR/dashboard.json`, per D-02/D-03/D-05).**
- Add a top-level `alerts` object under `dashboard` with `button` = `Alertas, {count}` and `title` = `Alertas ({count})`.
- Delete the `title` key inside `tenantAdmin.attention`. Keep its per-item keys.

**5. TenantAdminPanel (`apps/web/components/dashboard/TenantAdminPanel.tsx`, per D-01).**
- Pass `alerts={attention.map((item) => attentionItem(t, item))}` to `PanelHeader`.
- Delete the inline PanelSection that rendered the list, and drop the now-unused list import (keep the `AttentionItem` type import).
- Update the docstring: the alerts sit behind the header bell, and the KPIs come first.

**6. e2e (`apps/web/e2e-preview/painel-preview.spec.ts`, per D-01..D-04).** Add a data-driven block.
- `ALERT_LEVELS`, an array of `{ level, count, onlyOnce }`. This task adds only `{ level: 'admin-do-cliente', count: 3, onlyOnce: 'Fixe nos destaques se quiser manter' }`. Before relying on that detail, confirm it occurs once in the level's DOM.
- `ALERT_VIEWPORTS`: `{ name: '1440x900', width: 1440, height: 900, framed: true }` and `{ name: '390px', width: 390, height: 844, framed: false }`.
- One test per pair, named `alerts bell: <level> at <name>`, that:
  - (a) Finds the bell by role button and name `Alertas, <count>`. It has `aria-expanded="false"` and shows the count text.
  - (b) Asserts no heading matching `/^(Atenção|Pendências)/` exists, and that `getByText(onlyOnce, { exact: true })` has count 1 and is hidden.
  - (c) Reads `aria-controls` and locates the panel with an attribute selector, because useId ids contain colons.
  - (d) Clicks the bell and checks:
    - `aria-expanded` is `true`.
    - The panel is visible and has a heading `Alertas (<count>)`.
    - The panel holds `count` listitems.
    - The onlyOnce text is visible.
  - (e) Checks the panel's bounds:
    - Framed: its bounding box is inside the `[data-phone-screen]` box (±1 px), and the screen's `scrollWidth <= clientWidth`.
    - Unframed: `x >= 0` and `x + width <= viewport width`.
    - Both: the existing `horizontalOverflow` helper shows no page scroll.
  - (f) Presses Escape and checks:
    - `aria-expanded` is `false` and the panel is hidden.
    - The bell is focused and matches `:focus-visible`.
  - (g) Presses Enter (the bell is still focused) to open it again, clicks the page h1, and expects it closed.
  - (h) Clicks the bell twice and expects it closed.

Keep every existing test untouched.
  </action>
  <verify>
    <automated>export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; pnpm --filter @rede-social/ui typecheck && pnpm --filter @rede-social/web typecheck && head -1 apps/web/components/dashboard/AlertsBell.tsx | grep -q "use client" && ! grep -nE "createPortal|popover|position: ?fixed" apps/web/components/dashboard/AlertsBell.tsx && ! grep -n "<AttentionList" apps/web/components/dashboard/TenantAdminPanel.tsx && PIDS=$(lsof -ti tcp:3000); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts -g "alerts bell|admin-do-cliente"</automated>
  </verify>
  <done>Level 5 (`/painel-preview/admin-do-cliente`) shows no inline "Atenção (3)" section. The header has a bell named "Alertas, 3" with a danger badge "3". Clicking it opens "Alertas (3)" with the three alerts inside the phone screen at 1440x900 and full width at 390 px. Escape closes it and focuses the bell, and an outside press and a second press close it too. The two new e2e cases and every existing admin-do-cliente case pass, and both typechecks exit 0.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Levels 1 and 2 use the bell too; dead keys go; the bell's behaviour is pinned by unit tests</name>
  <files>apps/web/components/dashboard/PlatformOwnerPanel.tsx, apps/web/components/dashboard/PlatformAdminPanel.tsx, apps/web/messages/pt-BR/dashboard.json, apps/web/components/dashboard/AlertsBell.test.tsx, packages/ui/tests/button.test.tsx</files>
  <read_first>
    - apps/web/components/dashboard/PlatformOwnerPanel.tsx lines 1-120 (imports, mapper, header, inline section)
    - apps/web/components/dashboard/PlatformAdminPanel.tsx lines 1-95 (imports, mapper, header, inline section with its action)
    - apps/web/components/platform/WizardStep.test.tsx lines 1-30 (happy-dom docblock, cleanup pattern)
    - packages/ui/tests/button.test.tsx lines 139-156 (IconButton describe block)
  </read_first>
  <behavior>
    AlertsBell (rendered with label "Alertas, 3", count 3, a child paragraph):
    - Closed by default: button `aria-expanded="false"`, and `aria-controls` names an element in the document that carries the `hidden` attribute.
    - A click opens it: `aria-expanded="true"`, the panel has no `hidden`, and the child is in it.
    - Escape (keydown on document) closes it, and `document.activeElement` is the button.
    - A pointerdown on document.body closes it; a pointerdown on the child keeps it open.
    - A second click on the button closes it (toggle).
    - urgent=false: the badge "3" has `bg-brand` and neither `bg-danger` nor `text-white`. urgent=true: the badge has `bg-danger`.
    - After closing, an Escape on the document does not move focus. The listeners are gone: focus a different element first, press Escape, and focus stays put.
    IconButton:
    - A `ref` receives the rendered button element.
    - `badgeClassName="bg-brand text-on-brand"` replaces the badge's danger fill (`bg-brand` present, `bg-danger` absent).
  </behavior>
  <action>
**1. Unit test `apps/web/components/dashboard/AlertsBell.test.tsx` (per D-04).**
- First line `// @vitest-environment happy-dom`. Use `@testing-library/react` (render, screen, fireEvent, cleanup in afterEach) and plain DOM assertions (`getAttribute`, `hasAttribute`, `document.activeElement`, `classList`), as `components/platform/WizardStep.test.tsx` does.
- Strings are literal props here; test files are outside the literal guard.
- Cover every `<behavior>` case. If a case exposes a defect in `AlertsBell.tsx`, fix the component (it was built in Task 1); never weaken the test.

**2. Shared primitive test (`packages/ui/tests/button.test.tsx`).** In the existing `IconButton` describe block, add the two `<behavior>` IconButton cases: `createRef` for the ref, and `getByText('2')` for the badge class.

**3. PlatformOwnerPanel (level 1, per D-01).**
- Pass `alerts={attention.map((item) => attentionItem(t, item))}` to `PanelHeader`.
- Delete the inline section that rendered the list, and drop the list import (keep the `AttentionItem` type).
- Update the docstring: its alerts sit behind the header bell.

**4. PlatformAdminPanel (level 2, per D-01/D-03).**
- Pass `alerts={pending.map((item) => pendingItem(t, item))}` to `PanelHeader`.
- Delete the inline section, including its disabled "Ver todas" action: the bell lists every item, so "see all" has nothing left to do. Drop the list import.
- Update the docstring, which says the deadlines come first: they now sit behind the header bell.

**5. Catalog (`apps/web/messages/pt-BR/dashboard.json`, per D-05).**
- Delete the `title` key inside `platformOwner.attention`.
- Delete the `title` and `action` keys inside `platformAdmin.pending`.
- Keep every per-item key: the mappers still use them.

Change nothing else in the two panels: KPIs, charts, tables and other sections are untouched (D-05).
  </action>
  <verify>
    <automated>export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; node -e "const d=require('./apps/web/messages/pt-BR/dashboard.json').dashboard; const gone=[d.platformOwner.attention.title,d.platformAdmin.pending.title,d.platformAdmin.pending.action,d.tenantAdmin.attention.title]; if(gone.some(v=>v!==undefined)) throw new Error('dead key left'); if(d.alerts.button!=='Alertas, {count}'||d.alerts.title!=='Alertas ({count})') throw new Error('alerts keys'); if(!d.platformAdmin.pending.domain_expired||!d.platformOwner.attention.storage||!d.tenantAdmin.attention.support_waiting) throw new Error('item keys lost'); console.log('catalog OK')" && ! grep -n "<AttentionList" apps/web/components/dashboard/*Panel.tsx && ! grep -rnE "attention\.title|pending\.(title|action)" apps/web/components/dashboard && grep -c "alerts={" apps/web/components/dashboard/*Panel.tsx | grep -v ":0" | wc -l | grep -q 3 && pnpm --filter @rede-social/web exec vitest run components/dashboard/AlertsBell.test.tsx && pnpm --filter @rede-social/ui test && pnpm --filter @rede-social/web typecheck</automated>
  </verify>
  <done>
- The catalog script prints "catalog OK".
- No panel file renders the list inline, and exactly three panels pass `alerts=`.
- AlertsBell.test.tsx and the ui suite (including the two new IconButton cases) pass, and the web typecheck exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 3: The bell e2e covers levels 1, 2, 5 and the no-bell levels; full gates and screenshots</name>
  <files>apps/web/e2e-preview/painel-preview.spec.ts</files>
  <read_first>
    - apps/web/e2e-preview/painel-preview.spec.ts (the ALERT_LEVELS block written in Task 1, and the stale comment on cardOfClient around line 73)
  </read_first>
  <action>
**1. Extend the e2e matrix (per D-01..D-04).**
- Add two entries to `ALERT_LEVELS`:
  - `{ level: 'dono-da-plataforma', count: 2, onlyOnce: 'Armazenamento perto do limite do plano' }`
  - `{ level: 'admin-da-plataforma', count: 4, onlyOnce: 'Escola Horizonte: domínio' }`
  
  Confirm each onlyOnce string occurs once per level DOM. If not, pick another alert title or detail from the same fixture that does.
- Add one test, `levels without alerts show no bell`. It loops over `suporte-da-plataforma`, `dono-do-cliente`, `equipe-do-cliente` and `membro` and asserts that `[data-alerts-bell]` has count 0 and that no button's name matches `/^Alertas/`.
- Update the stale `cardOfClient` doc comment so it no longer refers to an inline "Atenção" row. The alert row now lives in the bell's hidden panel, and role queries skip it while it is closed.
- Do not weaken any existing assertion.

**2. Screenshots (CONTEXT Verification), not committed.**
- Create a temporary spec `apps/web/e2e-preview/zz-screens.tmp.spec.ts` (the l72 precedent). It writes PNGs to `.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/`:
  - `dono-da-plataforma-1440-open-light.png`, `admin-da-plataforma-1440-open-light.png` and `admin-do-cliente-1440-open-light.png`. Each is a 1440x900 viewport screenshot after clicking the bell.
  - `admin-do-cliente-1440-open-dark.png`, after adding the `rede_theme=dark` cookie for `http://localhost:3000`.
  - `admin-do-cliente-390-closed-light.png`, at 390x844 with the bell closed.
- Run it once with the preview config, then delete the temporary spec. Afterwards, `git status --porcelain apps/web/e2e-preview` lists only `painel-preview.spec.ts`.

**3. Full gates (CONTEXT Verification, D-05).** Run them with PREVIEW_ENV exported, after stopping any server on :3000:
- `pnpm lint` (Biome + check-ui-literals)
- `pnpm typecheck`
- `pnpm test`
- `pnpm boundaries`
- `pnpm check:static-routes`
- The whole preview Playwright suite

Fix any failure at its cause in the files of this plan. Record each command's real result for the SUMMARY.
  </action>
  <verify>
    <automated>export API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=preview-local-placeholder; PIDS=$(lsof -ti tcp:3000); if [ -n "$PIDS" ]; then kill $PIDS; fi; pnpm lint && pnpm typecheck && pnpm test && pnpm boundaries && pnpm check:static-routes && pnpm --filter @rede-social/web exec playwright test --config playwright.preview.config.ts && test ! -e apps/web/e2e-preview/zz-screens.tmp.spec.ts && ls .planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/screens/*.png | wc -l | grep -q 5 && git diff --quiet 0f6a0785 -- apps/web/proxy.ts apps/web/app/painel-preview</automated>
    <human-check>Open http://localhost:3000/painel-preview/admin-do-cliente at 1440x900 and at 390 px, in light and dark. The bell sits next to "7 dias", and its badge reads as urgent (red) here and on admin-da-plataforma, but brand blue on dono-da-plataforma. The open list looks like the old section, fits inside the phone screen, and the status bar covers it when the screen scrolls. The panel no longer has a list between the header and the KPIs.</human-check>
  </verify>
  <done>
- The preview suite passes, including 6 bell cases (levels 1, 2, 5 × 1440x900 and 390 px) and the no-bell test.
- pnpm lint, typecheck, test, boundaries and check:static-routes all exit 0.
- Five PNGs are in this task's `screens/` folder, uncommitted, and the temporary spec is gone.
- `proxy.ts` and `app/painel-preview/**` are unchanged.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| browser → Next dev server (`/painel-preview/*`) | Untouched by this plan: no routing, query parsing or proxy change. The gate (proxy 307 + `connection()`/`notFound()`) stays as it is |
| server component → client component (AlertsBell) | Only catalog strings, a number, a boolean and server-rendered React children cross; no user input enters |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ndw-01 | Information disclosure | dev-only preview gate (`proxy.ts`, `app/painel-preview/**`) | medium | mitigate | Neither path is in `files_modified`. Task 3's verify asserts `git diff --quiet 0f6a0785 -- apps/web/proxy.ts apps/web/app/painel-preview`, and `pnpm test` re-runs proxy.test.ts and dashboard-preview.test.ts |
| T-ndw-02 | Tampering (markup injection) | AlertsBell / PanelHeader rendering alert text | low | mitigate | Alert text renders as React text nodes through the unchanged module list; no raw-HTML API is introduced (Task 1 verify greps AlertsBell for escape hatches); copy comes from the catalog and fixture data only |
| T-ndw-03 | Denial of service (listener leak) | document pointerdown/keydown listeners in AlertsBell | low | mitigate | The listeners are registered only while open and removed in the effect cleanup. The Task 2 unit test proves that an Escape after closing does not move focus |
| T-ndw-04 | Spoofing (misleading content) | fictional alerts read as real | low | accept | Unchanged: the single "Dados de exemplo" tag stays on every level, and its existing e2e assertions still run |
</threat_model>

<verification>
- Task 1: the tracer. Level 5 works end-to-end in the real browser (framed and 390 px), both typechecks pass, and there is no portal or top-layer code.
- Task 2: the catalog script proves D-05 key removal and that the per-item keys survive. The unit tests pin the D-04 behaviour and the D-02 badge tone. The shared IconButton props are covered in packages/ui.
- Task 3: the D-01..D-04 e2e matrix on all three levels plus the no-bell levels, the full repo gates (lint incl. check-ui-literals, typecheck, test, boundaries, static routes, preview Playwright) and the 5 screenshots.
- DoD for the orchestrator after execution: the `critic` and `flow-critic` reviews on this plan's commit range, which the executor cannot launch. The SUMMARY's NÃO FEITO block must name them if they were not run.
</verification>

<success_criteria>
- The inline Atenção/Pendências sections are gone from levels 1, 2 and 5. Each level's header shows a bell with the right count (2, 4, 3) and tone (brand, danger, danger), and it opens "Alertas (N)" with every alert inside the panel's box and the phone screen.
- The bell closes on Escape (focus back on the bell, visible ring), on an outside press and on a second press. Levels 3, 4, 6 and 7 have no bell.
- No dead catalog keys or imports remain. Everything else on the panels is unchanged.
- pnpm lint, typecheck, test, boundaries, check:static-routes and the preview suite are green. 5 screenshots are captured and not committed.
</success_criteria>

<output>
Create `.planning/quick/261011-ndw-alertas-viram-sininho-no-cabecalho-do-pa/261011-ndw-SUMMARY.md` when done (do not commit the `screens/` folder).
</output>
