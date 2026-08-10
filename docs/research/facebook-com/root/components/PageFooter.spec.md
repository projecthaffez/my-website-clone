# PageFooter Specification

## Overview
- **Target File:** `src/components/sites/facebook-com/root/PageFooter.tsx`
- **Screenshot:** `docs/design-references/facebook-com/root/desktop.png`
- **Interaction Model:** Interactive language selection & Meta product links.

## DOM Structure
- `footer` (Full-width background `#ffffff`, padding-top 20px, padding-bottom 20px)
  - `div` (Centered container, max-width 980px, margin 0 auto)
    - `ul` (Language links horizontal list)
      - `li` ("English (UK)")
      - `li` ("Bahasa Indonesia")
      - `li` ("Bahasa Melayu")
      - `li` ("中文(简体)")
      - `li` ("Tiếng Việt")
      - `li` ("Español")
      - `li` ("Português (Brasil)")
      - `li` ("Français (France)")
      - `li` ("Deutsch")
      - `li` ("Italiano")
      - `li` ("plus icon (+) button")
    - `div` (Divider line, border-bottom 1px solid `#dddfe2`, margin 8px 0)
    - `ul` (Meta product links grid/flex list)
      - `li` links: Sign Up, Log in, Messenger, Facebook Lite, Video, Places, Games, Marketplace, Meta Pay, Meta Store, Meta Quest, Ray-Ban Meta, Meta AI, Instagram, Threads, Fundraisers, Services, Voting Information Centre, Privacy Policy, Privacy Centre, Groups, About, Create ad, Create Page, Developers, Careers, Cookies, AdChoices, Terms, Help, Contact uploading and non-users
    - `div` (Copyright notice: "Meta © 2026", marginTop 20px, fontSize 11px, color `#737373`)

## Computed Styles
- backgroundColor: `#ffffff`
- color: `#737373`
- fontSize: 12px
- fontFamily: `Helvetica, Arial, sans-serif`
- lineHeights: 1.6
- Link color: `#8a8d91`
- Hover link color: `#8a8d91`, textDecoration underline
