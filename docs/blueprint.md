# **App Name**: Smartsheet

## Core Features:

- Create Custom Tests: Input exam name and number of questions to generate a virtual OMR sheet with 4 options (A/B/C/D) per question. Allows users to choose timer, stopwatch, or no timer, and set a custom marking scheme (default: +4, -1).
- Take Tests in Exam Mode: Allows users to take tests in an exam mode with one question per screen or a scrollable list. Displays a timer/stopwatch during the test and provides quick navigation between questions.
- Self-Evaluation After Submission: Enables self-evaluation after submission by marking each question as correct/incorrect manually. Automatically calculates the score based on the selected marking scheme.
- Result Summary: Presents a result summary including total questions, correct, incorrect, unattempted, final score, percentage, and an optional chart (pie/bar).
- History Tab (Performance Archive): Tracks all previous tests in a history tab, allowing users to filter/search by date, exam, or score. Enables viewing detailed breakdowns and graphs, reattempting tests, or exporting results.
- Settings: Provides settings to change the theme, scoring rules, and timer preferences, as well as enable dark mode control.

## Style Guidelines:

- Primary Color: #1A73E8 (Blue) - Calm, educational feel, widely used in productivity apps
- Secondary Color: #F9AB00 (Amber) - For highlights like "Correct Answers", active tabs
- Accent Color: #34A853 (Green) - Success/Correct indicators
- Error Color: #EA4335 (Red) - For wrong answers, errors
- Background: #F5F6FA - Very light gray/white for minimal eye strain
- Card Background: #FFFFFF - Clean white cards with shadows
- Text (Primary): #202124 - High contrast, deep gray text
- Text (Secondary): #5F6368 - Slightly muted for labels and subtitles
- Primary (Dark Mode): #8AB4F8 - Muted blue, eye-friendly on dark
- Secondary (Dark Mode): #FDD663 - Soft amber
- Background (Dark Mode): #202124 - Google’s material dark theme background
- Card Background (Dark Mode): #303134 - Slightly elevated card color
- Text (Primary) (Dark Mode): #E8EAED - Light grayish white
- Correct Indicator (Dark Mode): #81C995 - Soft green
- Incorrect Indicator (Dark Mode): #F28B82 - Soft red
- Headlines: Poppins or Roboto Slab
- Body Text: Inter or Roboto
- Design System: Material Design 3 / Tailwind-based for clean spacing
- Button Style: Rounded corners (radius: 12–16px), elevation, shadow on hover
- Cards: Shadow depth, soft hover effect, subtle gradient background optional
- Use progress rings or circular timers with color change on time running out.
- Highlight the selected option in a question with a shaded background.
- Use icons (like Lucide, Feather, or Material Icons) for intuitive buttons.