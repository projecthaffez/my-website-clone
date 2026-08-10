# HeroHeader Specification

## Overview
- **Target File:** `src/components/sites/facebook-com/root/HeroHeader.tsx`
- **Screenshot:** `docs/design-references/facebook-com/root/desktop.png`
- **Interaction Model:** Static layout with responsive font sizing.

## DOM Structure
- `div` (Wrapper container, width ~580px on desktop)
  - `div` (Logo container, margin-bottom 16px, negative margin-left 8px)
    - `svg` / `img` (Facebook wordmark logo, height 106px, color `#1877F2`)
  - `h2` (Tagline text)

## Computed Styles

### Logo Image/SVG
- height: 106px
- margin-left: -28px (to align wordmark visual left edge with content)
- fill / color: `#1877F2`

### Tagline (`h2`)
- fontFamily: `SFProDisplay-Regular, Helvetica, Arial, sans-serif`
- fontSize: 28px
- fontWeight: 400 (normal)
- lineHeight: 32px
- color: `#1c1e21`
- width: 500px

## Text Content (verbatim)
- Tagline: "Facebook helps you connect and share with the people in your life."

## Responsive Behavior
- **Desktop (1440px):** Width 580px, padding-top 112px, text-align left.
- **Tablet (768px):** Text-align center, logo centered, tagline font-size 24px.
- **Mobile (390px):** Text-align center, logo height 60px, tagline font-size 20px, line-height 24px.
