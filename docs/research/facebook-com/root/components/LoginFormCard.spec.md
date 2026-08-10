# LoginFormCard Specification

## Overview
- **Target File:** `src/components/sites/facebook-com/root/LoginFormCard.tsx`
- **Screenshot:** `docs/design-references/facebook-com/root/desktop.png`
- **Interaction Model:** Form input focus states, button hovers, modal / link navigation.

## DOM Structure
- `div` (Wrapper column, width 396px)
  - `div` (Card container)
    - `form`
      - `div` (Email field container)
        - `input` (type="text", placeholder="Email address or phone number")
      - `div` (Password field container)
        - `input` (type="password", placeholder="Password")
      - `button` (type="submit", text="Log in")
      - `div` (Forgot link container)
        - `a` (href="#", text="Forgotten password?")
      - `div` (Divider line)
      - `div` (Create account container)
        - `button` / `a` (text="Create new account")
  - `div` (Sub-text below card)
    - `span` ("Create a Page ") + `a` ("for a celebrity, brand or business.")

## Computed Styles

### Card Container
- width: 396px
- backgroundColor: `#ffffff`
- borderRadius: 8px
- boxShadow: `0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)`
- padding: 16px 16px 24px 16px
- textAlign: center

### Inputs (Email & Password)
- width: 100%
- height: 52px
- fontSize: 17px
- fontFamily: `Helvetica, Arial, sans-serif`
- padding: 14px 16px
- borderRadius: 6px
- border: 1px solid `#dddfe2`
- color: `#1d2129`
- margin-bottom: 12px
- outline: none
- Focus state border: 1px solid `#1877f2`, boxShadow: `0 0 0 2px #e7f3ff`

### "Log in" Button
- width: 100%
- height: 48px
- backgroundColor: `#1877f2`
- color: `#ffffff`
- fontSize: 20px
- fontWeight: 700 (bold)
- borderRadius: 6px
- border: none
- margin-bottom: 16px
- cursor: pointer
- Hover state backgroundColor: `#166fe5`

### "Forgotten password?" Link
- color: `#1877f2`
- fontSize: 14px
- fontWeight: 500
- display: inline-block
- margin-bottom: 20px
- textDecoration: none
- Hover state textDecoration: underline

### Divider
- borderBottom: 1px solid `#dadde1`
- margin: 0 0 20px 0

### "Create new account" Button
- height: 48px
- backgroundColor: `#42b72a`
- color: `#ffffff`
- fontSize: 17px
- fontWeight: 700
- borderRadius: 6px
- border: none
- padding: 0 16px
- display: inline-block
- cursor: pointer
- Hover state backgroundColor: `#36a420`

### Sub-text below Card
- marginTop: 28px
- fontSize: 14px
- color: `#1c1e21`
- textAlign: center
- Link bold text: fontWeight 600, color `#1c1e21`, hover textDecoration underline

## Text Content (verbatim)
- Email placeholder: "Email address or phone number"
- Password placeholder: "Password"
- Log in button: "Log in"
- Forgot link: "Forgotten password?"
- Create button: "Create new account"
- Sub-text: "Create a Page for a celebrity, brand or business."
