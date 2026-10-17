# DESIGN.md: VaniDarpan

Put this file in the project root next to AGENTS.md / GEMINI.md. Follow it for every screen. Do not invent colours, fonts or components that are not listed here.

## Product context
- VaniDarpan (वाणीदर्पण, "voice mirror") is a private practice mirror for speaking. Students practise in front of the camera and see what they cannot see themselves (eye contact, posture, pace, filler words). Colleges' placement cells see how ready a batch is.
- Two audiences: students (calm, focused, encouraging) and TPO, HOD and faculty (dense, factual, trustworthy).
- Primary job of the product: show what the person cannot see, and tell them the next thing to do.

## Visual theme
Calm, precise, institutional. Think of a well-made instrument panel, not a startup landing template. Light by default for marketing pages and dashboards. The practice studio may use one quiet dark surface so the camera feed is the focus.
The one memorable element is the **mirror frame**: a rounded camera frame with fine gaze and posture marks. Use it in the hero, in empty states and in the logo mark. Everything else stays quiet.

## Colour
| Token | Hex | Use |
|---|---|---|
| --ink | #0E1726 | Headings, strong text |
| --text | #344054 | Body text |
| --muted | #667085 | Secondary text, table headers |
| --hairline | #E1E5EC | Borders, dividers |
| --surface | #F6F8FB | Page background, table hover |
| --paper | #FFFFFF | Cards, inputs |
| --darpan-blue | #1F4FBF | Primary buttons, links, focus, selected state |
| --darpan-blue-hover | #183F9C | Hover and pressed |
| --darpan-blue-tint | #EAF0FC | Selected rows, soft badges |
| --brass | #A8741A | Certificate seal and Pro badge only |
| --success / tint | #1E7B4F / #E6F4EC | Positive status |
| --caution / tint | #B26B00 / #FDF1DC | Needs attention |
| --risk / tint | #B42318 / #FDECEA | At risk, errors |
| --studio | #14171C | Practice studio background only |

Heatmap scale (readiness, low to high): #EAF0FC, #C5D6F6, #8FB0EC, #5280D8, #1F4FBF. Use white text on the two darkest steps.

Rules: no purple or violet anywhere. No gradients, glows or glass blur. Status is never shown by colour alone (always an icon or text too). Text contrast at least 4.5:1.

## Typography
- Family: **IBM Plex Sans** for Latin and **IBM Plex Sans Devanagari** for Hindi text and the wordmark. One family only. No monospace anywhere.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`), right-aligned in tables.
- Scale (px): 12, 14, 16, 20, 24, 32, 44. Body 16, table text 14.
- Weights: 400, 500, 600 only. Headings 600, sentence case, letter-spacing -0.01em from 24px up.
- Line length at most 70 characters.
- Do not use: ALL-CAPS labels, letter-spaced eyebrow labels above headings, one coloured word inside a headline, middle-dot strings ("A · B · C"), arrows appended to button text.

## Layout and spacing
- 8px grid (4px for tight spots). Content width 1200px; dashboard width 1360px.
- Landing sections 80 to 96px apart. Dashboard card padding 20 to 24px.
- Left-aligned by default. Centre only short empty states and the sign-in form.
- Radius: 6px for buttons and inputs, 10px for cards, full round only for avatars.
- Borders: 1px hairline. Shadow only on menus and modals (0 8px 24px rgba(14,23,38,0.12)).

## Navigation
- Student bar: logo | Practice, Scenarios, Progress, Learn, Plans | account menu. FAQ, Contact, Privacy, Terms and "For colleges" live in the footer.
- "TPO Portal" is not in the student bar. Colleges enter through "For colleges" and sign in to a separate portal with a left sidebar: Overview, Batches, Students, Drives, Reports, Settings.
- "Sign in" uses the primary button style.

## Components
- **Buttons:** primary (blue fill, white text, 40px high), secondary (white, hairline border), ghost. Label is verb + object: "Start practice", "Create account", "Download report". No arrows, no gradient.
- **Inputs:** 40px high, hairline border, 2px blue focus ring with 2px offset.
- **Cards:** white, 1px hairline, 10px radius, no shadow. Do not wrap everything in cards; use spacing and dividers for lists. At most one badge per card.
- **Tables:** 14px, row height 48px, headers in sentence case (500, muted), sticky header, hover uses --surface, no zebra stripes. Filters and sort sit above the table.
- **KPI strip:** number 32/600 in ink, label 14 muted, change shown as plain success or caution text. No coloured icon circles.
- **Heatmap:** branch by skill grid, single blue scale, value printed in each cell, legend with five steps, tooltip with sample size.
- **Badges:** neutral tint with text; semantic tints only for status, always with an icon.
- **Charts:** one blue series, comparison series in ink, hairline gridlines, direct labels instead of legends where possible.
- **Loading, empty, error:** skeletons, not spinners. Empty states say what to do ("No sessions yet. Start your first practice."). Errors say what happened and how to fix it.
- **Certificate:** white page, ink text, brass seal, student name large, "Issued by VaniDarpan", verification ID and QR.

## Page blueprints
**Landing:** header; hero with headline (sentence case, two lines at most), one-line subtext, "Start practice" and "See a sample report" on the left, and the mirror frame with three metric chips (Eye contact, Pace, Fillers) on the right; "How a session works" (a real sequence: choose a scenario, speak to the camera, read your report); report preview rows with real screenshots; "For colleges" band with a heatmap preview and "Request a pilot"; plans in three columns; FAQ accordion; footer.

**Sign in:** two columns. Left: brand panel with the mirror frame and one-line promise. Right: Continue with Google, "or" divider, email, password, "Sign in", "Create account" link. The wordmark must be readable.

**Practice studio:** quiet dark surface (--studio), camera feed centred, metrics rail on the right, one coaching hint at a time at the bottom.

**Report:** score at the top, four metric blocks each with a one-line plain explanation, transcript with highlighted fillers, one "Next step" recommendation.

**College overview:** left sidebar, top bar with the college name and date range, KPI strip (4 numbers), readiness heatmap by branch and skill, list "Students who need support" with an "Assign practice" action, "Download report" and "Export CSV". Show a visible "Sample data" tag until real data exists.

**Scenarios:** keep the current grid; use one neutral icon style and one selected state.

## Copy rules
- Plain words. "Eye contact", not "gaze stability telemetry". "Readiness", not "readiness index telemetry". "Students who need support", not "targeted remedial pool".
- Sentence case everywhere. Buttons start with a verb.
- Do not claim anything that is not true or not yet built: no "Verified", "NAAC compliant", "100% private". Say exactly what happens, for example "Your video is analysed on your device and is not uploaded."
- Demo content must be labelled "Sample data". Do not use real institution or company names unless they have agreed.
- Product name is VaniDarpan (वाणीदर्पण). Remove every remaining "MIRAL" string.

## Motion and accessibility
- Motion only to answer an action (button press, drawer open, score count-up once on the report). No scroll-triggered fade-ins or hover animations on every card.
- Respect prefers-reduced-motion. Visible keyboard focus everywhere. Touch targets at least 44px on mobile. Works at 360px width.

## Implementation notes (Tailwind + shadcn/ui)
- Define the tokens above as CSS variables in globals.css and map them to the Tailwind theme and shadcn variables. No hard-coded colours inside components.
- Use shadcn/ui primitives, override radius to 6px and 10px, remove default gradients and shadows.
- Load IBM Plex Sans and IBM Plex Sans Devanagari (weights 400, 500, 600).
- Icons: Lucide, 16px or 20px, stroke 1.75, one colour (muted or ink).
- Build order: tokens, app shell and nav, landing, sign in, practice studio, report, college overview. Change only the UI; do not touch API calls, state or business logic.
