---
name: ux-ui-heuristic-auditor
description: Audits code files, UI layouts, forms, and front-end components for user interface (UI) and user experience (UX) flaws. Use this skill whenever the user asks to review a specific screen, evaluate a form layout, or scan for user experience bottlenecks.
---

# Goal
Provide an automated, rigorous, and highly actionable UX/UI assessment of a specific screen's front-end source code, identifying exact lines of friction and outputting targeted refactoring code suggestions.

# Instructions & Evaluation Rules
When this skill is triggered on a file, execute an explicit, deep-layer analysis against these 5 design necessities:
1. Interaction Flow & Form Fatigue: Check field groupings, layout density, and the placement of primary vs. secondary actions.
2. Visual Hierarchy & Spatial Rhythm: Inspect grid structures, typography scaling, padding, alignment, and modern Soft UI styling metrics (spacious card layouts, elegant borders, proper whitespace separation).
3. Fitts's Law Alignment: Evaluate click targets, input field hitboxes, and dropdown interactive surface areas.
4. Accessibility & Focus States: Check color contrast rules, focus rings, and input field label visibility.
5. Error Prevention & Inline Feedback: Verify how real-time validation text, helper text, and error alert nodes are structured in the layout.

# Output Format
The agent must present findings to the user using the following clean, scannable layout:
- **🔍 1. Layout & Spatial Rhythm Violations:** Clear bullet points detailing spacing, grid misalignment, or visual clutter.
- **🧠 2. Cognitive Friction Points:** Highlighting fields or flows that degrade user interaction.
- **🎯 3. Interactive Target & Accessibility Flaws:** Specific notes on hitboxes, text contrast, or missing focus states.
- **🚨 4. Edge-Case & State Failures:** Analysis of validation errors or empty states.
- **💡 5. Recommended Code Refactor:** Provide a clean, elegant, memory-safe code block showing the precise markup/styling changes needed to solve the issue with minimal disruption to the existing logic.

# Constraints
- Do NOT rewrite unchanged foundational logic; focus changes tightly on UI/UX components.
- Always use emojis 🚀✨🎨 to highlight key visual takeaways and keep the summary highly scannable.
