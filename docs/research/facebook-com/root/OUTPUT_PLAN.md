# Output Plan: Facebook Landing Page Clone

## Target Details
- **Target URL:** `https://www.facebook.com/`
- **Normalized Origin:** `https://www.facebook.com`
- **Normalized Pathname:** `/`
- **`<site-key>`:** `facebook-com`
- **`<page-key>`:** `root`
- **App Root (`<app-root>`):** Workspace Root (`.`)

## Artifact Roots
- **Research Artifacts:** `docs/research/facebook-com/root/`
- **Design References (Screenshots):** `docs/design-references/facebook-com/root/`
  - Desktop: `desktop.png` (1440px)
  - Tablet: `tablet.png` (768px)
  - Mobile: `mobile.png` (390px)
- **Component Root:** `src/components/sites/facebook-com/root/`
- **Shared Component Root:** `src/components/sites/facebook-com/shared/`
- **Asset Root:** `public/sites/facebook-com/root/`
- **Shared Asset Root:** `public/sites/facebook-com/shared/`
- **Destination Route:** `src/app/page.tsx`

## Per-Component Plan
1. `FacebookLogoHeader`: Renders Facebook wordmark / Meta logo and tagline.
2. `LoginFormCard`: Card container with email/phone input, password input with show/hide toggle, "Log in" primary button, "Forgotten password?" link, divider, and "Create new account" secondary green button.
3. `Footer`: Multi-column/row language selector links, copyright notice, and Meta product/policy links.
