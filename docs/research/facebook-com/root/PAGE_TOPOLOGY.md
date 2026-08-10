# Page Topology: Facebook Landing Page

## Visual Layout Overview

```
+-----------------------------------------------------------------------+
| Body Background: #F0F2F5 (Light Grey)                                 |
|                                                                       |
| Container: max-width 980px, padding-top 92px, padding-bottom 132px    |
|                                                                       |
| [ Desktop 2-Column Flex / Grid ]                                      |
|                                                                       |
| +-----------------------------+  +----------------------------------+ |
| | Left Column (Hero Header)   |  | Right Column (Login Area)        | |
| |                             |  |                                  | |
| | - Facebook Wordmark Logo    |  |  +----------------------------+  | |
| |   (SVG, Blue #1877F2)       |  |  | Card: white, rounded-xl   |  | |
| | - Tagline:                  |  |  | shadow: 0 2px 4px rgba... |  | |
| |   "Facebook helps you      |  |  |                            |  | |
| |    connect and share with   |  |  | - Email/Phone Input       |  | |
| |    the people in your life."|  |  | - Password Input          |  | |
| |                             |  |  | - Log In Button (Blue)    |  | |
| |                             |  |  | - Forgotten password?     |  | |
| |                             |  |  | - Horizontal Divider      |  | |
| |                             |  |  | - Create new account (Grn)|  | |
| |                             |  |  +----------------------------+  | |
| |                             |  |                                  | |
| |                             |  |  "Create a Page for a celebrity, | |
| |                             |  |   brand or business."            | |
| +-----------------------------+  +----------------------------------+ |
|                                                                       |
| +-------------------------------------------------------------------+ |
| | Footer Container (Full width, white background at bottom)         | |
| | - Top row: Language links (English (UK), Bahasa Indonesia, etc.)  | |
| | - Divider line                                                    | |
| | - Bottom grid: Meta product & policy links                        | |
| | - Copyright notice: Meta © 2026                                   | |
| +-------------------------------------------------------------------+ |
+-----------------------------------------------------------------------+
```

## Component Breakdown
1. **HeroHeader Component**: `src/components/sites/facebook-com/root/HeroHeader.tsx`
2. **LoginFormCard Component**: `src/components/sites/facebook-com/root/LoginFormCard.tsx`
3. **PageFooter Component**: `src/components/sites/facebook-com/root/PageFooter.tsx`
