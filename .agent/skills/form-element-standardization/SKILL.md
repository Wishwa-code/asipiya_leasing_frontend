---
name: form-element-standardization
description: >-
  Ensures all new or modified forms in the Asipiya Leasing frontend use the
  custom Shadcn Select and Input components rather than native HTML elements,
  maintaining consistent heights (42px) and dark mode overrides.
---

# Form Element Standardization Guide

## Overview
This instruction rule ensures that all text inputs and select dropdowns inside the Asipiya Leasing frontend are unified using the custom Shadcn UI Select and Input components. It defines design tokens, component structure, standard sizing, and theme colors to avoid layout and style mismatches.

## Standard Component Specifications

### 1. Shadcn Input Component
* **Path:** `src/components/ui/input.tsx`
* **Import:** `import { Input } from "@/components/ui/input";`
* **Default Styles:**
  * **Height:** Naturally matches `42px` (`py-2.5 px-4 text-sm`).
  * **Colors:** `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white`.
  * **Overrides:** Pass `className="px-3 py-2 dark:bg-gray-800"` for compact forms or grids.

### 2. Shadcn Select Component
* **Path:** `src/components/ui/select.tsx`
* **Import:**
  ```tsx
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  ```
* **Default Styles:**
  * **Height:** Programmatically set to `42px` via `data-[size=default]:h-[42px]` in `SelectTrigger`.
  * **Compact Height:** Pass `className="h-9 data-[size=default]:h-9"` to set height to `36px` (`h-9`) for compact inline/table forms.
  * **Dropdown List Width:** Defaults to `position="popper"` with `w-[var(--radix-select-trigger-width)]` on `SelectContent` to match the exact size of the input trigger.
  * **Dark Mode Contrast:** Dark mode values in `index.css` map `--color-popover` to `var(--color-gray-dark)` and `--color-popover-foreground` to `var(--color-gray-100)`.

---

## Agent Instructions (Workflow)

Whenever you are tasked with **creating a new form** or **modifying an existing form** page:

### 1. Audit Phase
* Search the target file for any native `<select>` or `<input>` tags.
* *Note: Ignore checkbox/radio input types unless a custom Shadcn equivalent has been created.*

### 2. Suggestion & Migration Phase
* Suggest replacing native `<select>` and `<input>` tags with `<Select>` and `<Input>`.
* Proactively rewrite them using the custom Shadcn imports:
  * Replace native `<select>` dropdowns using the nested Shadcn primitives (e.g. `<SelectTrigger>`, `<SelectValue>`, `<SelectContent>`, `<SelectItem>`).
  * Replace native `<input>` tags with `<Input />`.

### 3. Sizing & Layout Verification
* Verify that inputs and select dropdown triggers on the same row have matching heights:
  * Standard forms: both must be exactly `42px` high.
  * Compact forms: both must be exactly `36px` (`h-9`) high.
* Ensure option containers have the `w-[var(--radix-select-trigger-width)]` class so their dropdown width matches the input field.

### 4. Build Check
* Always run `npm run build` after modifications to ensure there are no compilation errors or unused variables that block deployment.

---

## Common Pitfalls
* **Self-Contained Heights:** Hardcoding random heights like `h-10` or `h-11` on select components instead of letting them default to `42px` or overriding with `h-9` (`36px`).
* **Misaligned Dropdowns:** Forgetting `position="popper"` or the trigger-width mapping, causing dropdown lists to render at arbitrary auto-widths.
* **Contrast Bugs:** Overriding background colors inside forms without ensuring contrast compatibility with dark mode text properties.
