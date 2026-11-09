# Desk Ready design system

The owner asked on 2026-11-09 that every screen inside Desk Ready be "revolutionized"
to match exactly how the course is sold. The landing (`/desk-ready`) is the reference:
the inside of the course now uses the same visual language.

## The idea: a dark desk, real apps on it

The learner sits at a dark, glowing workspace, and the tools they practise in
(Outlook, Excel, a Windows desktop, a Save As box) are light, realistic windows
floating on it. It is the landing hero, made usable: dark glass for the course,
light chrome for the apps.

## Tokens (`app/desk-ready/tokens.ts`)

| Set | Purpose |
|---|---|
| `D` | The course shell, dark: ground `#070b17`, glass panels, white ink, the blue action gradient, green/red/amber feedback, Inter + Geist Mono (the site fonts) |
| `W` | The practice apps, light: white page, Office ink and chrome, the Outlook/Excel title colours, paper |
| `PART_ACCENT` | One bright accent per course part, shared with the landing: amber, blue, green, teal, violet, pink |

A hex anywhere else under `app/desk-ready` is a bug. The landing and `PartPreview`
are the exceptions (they are built on the shared landing-v2 system).

## Surfaces

- **Ground:** `#070b17` with two soft radial glows and a faint 48px grid, masked to fade.
- **Glass card:** a navy gradient (`#111a33` to `#090e1c`), a 1px border tinted with the
  accent, a lit 2px top edge, a faint grid, and an optional ghost number in a corner.
- **Workspace:** where a practice task runs. A darker stage with a grid, inside which the
  light app window floats with a soft accent glow.
- **Feedback:** green glass for right, red glass for not yet, amber glass for "nearly".
  Always says what to do next.

## Type

Inter for everything people read: headings at weight 500 with tight tracking, reading
text at 17 to 19px with a line height of 1.6. Geist Mono, uppercase and spaced, for
labels only (part tags, step names, counts). Never smaller than 15px for anything a
learner must read.

## Controls

- Primary: the blue gradient pill (the landing's "Purchase" button), at least 52px tall.
- Secondary: a ghost glass pill.
- Answer options: glass rows with a letter badge, a glow on hover, green or red on pick.
- Inputs inside the course UI: dark glass fields with a blue focus glow. Inputs inside a
  practice app keep the app's own light look.

## Screens

1. **Sign in / sign up:** the dark ground, a glass panel, the DESK READY lockup.
2. **Your desk** (`/desk-ready/course`): progress ring and stats, a "pick up where you
   left off" card with the app it uses, then the six parts as the landing's bento cards,
   each module a tile with its own status (ready with lesson progress, finished, coming soon).
3. **Module:** a header band in the part's accent with the app window large, outcomes,
   module progress, then the lessons as a glowing timeline.
4. **Lesson:** a stage tracker (Learn, Try it, Check, Done) across the top; one idea per
   glass screen; the practice task in a workspace; questions as glass options; a finish
   screen with an animated tick, the takeaways and the next lesson.

## Rules kept from the learning design

Plain English, one idea per screen, one obvious button, no timers, nothing ever really
sent, the 80% soft gate, no answer tells (options shuffled once per mount), and the
page returns to the top on every step.
