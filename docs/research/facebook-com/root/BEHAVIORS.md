# Behavior Specification: Facebook Landing Page

## Interaction Model
- **Primary Model:** Static form layout with interactive focus, hover, and modal/link triggers.
- **Scroll Model:** Natural document flow. Background `#f0f2f5` (light grey wash).
- **Responsive Model:**
  - **Desktop (> 900px):** 2-column layout (left: Facebook logo & tagline; right: login card & "Create a Page" sub-text).
  - **Mobile (< 900px):** Single-column stacked layout (top: Facebook logo; center: login form; bottom: Create new account button & language footer).

## Component Interactive Behaviors

### 1. Form Inputs (Email/Phone & Password)
- **Default State:** White background, 1px solid `#dadde1` border, 6px border-radius, 14px padding.
- **Focus State:** 1px solid `#1877F2` border, blue outline / box-shadow (`0 0 0 2px #e7f3ff`).
- **Placeholder:** `#90949c` color text.

### 2. Primary "Log in" Button
- **Default State:** Background `#1877F2`, color `#ffffff`, font-weight 700, font-size 20px, height 48px, border-radius 6px, width 100%.
- **Hover State:** Background `#166fe5`, cursor pointer.
- **Active State:** Background `#1465d2`.

### 3. "Forgotten password?" Link
- **Default State:** Color `#1877F2`, font-size 14px, font-weight 500, text-align center.
- **Hover State:** Text decoration underline.

### 4. "Create new account" Button
- **Default State:** Background `#42b72a`, color `#ffffff`, font-weight 700, font-size 17px, height 48px, border-radius 6px, padding 0 16px.
- **Hover State:** Background `#36a420`.

### 5. Footer Links
- **Default State:** Color `#8a8d91`, font-size 12px, line-height 1.6.
- **Hover State:** Text decoration underline.
