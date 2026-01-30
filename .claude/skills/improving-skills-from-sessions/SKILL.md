---
name: improving-skills-from-sessions
description: Analyzes the current conversation to propose improvements to skills based on what worked, what failed, and edge cases discovered. Use when the user says "reflect", "improve skill", "learn from this", or at end of skill-heavy sessions.
---

# Improve Skill From Session

Analyze the current conversation and propose improvements to a skill based on corrections, successes, and edge cases.

## Trigger

Run after a session where a skill was used. Optionally pass a skill name: `/skill-improve-from-session [skill-name]`

## Workflow

Copy this checklist:

```
Skill Reflection Progress:
- [ ] Step 1: Identify the target skill
- [ ] Step 2: Analyze conversation signals
- [ ] Step 3: Propose changes
- [ ] Step 4: Apply or save observations
```

### Step 1: Identify the Skill

If skill name not provided, use AskUserQuestion to ask which skill to analyze. List skills found in `.claude/skills/`.

### Step 2: Analyze the Conversation

Scan the current conversation for these signals:

**Corrections** (HIGH confidence):
- User said "no", "not like that", "I meant..."
- User explicitly corrected output
- User requested changes immediately after generation

**Successes** (MEDIUM confidence):
- User said "perfect", "great", "yes", "exactly"
- User accepted output without modification
- User built on top of the output

**Edge Cases** (MEDIUM confidence):
- Questions the skill didn't anticipate
- Scenarios requiring workarounds
- Features user asked for that weren't covered

**Preferences** (accumulate over sessions):
- Repeated patterns in user choices
- Style or tool/framework preferences shown implicitly

### Step 3: Propose Changes

Present findings in a summary box:

```
┌─ Skill Reflection: [skill-name] ─────────────────────────┐
│                                                           │
│  Signals: X corrections, Y successes, Z edge cases       │
│                                                           │
│  Proposed changes:                                        │
│                                                           │
│  [HIGH] + Add constraint: "[specific constraint]"         │
│  [MED]  + Add preference: "[specific preference]"         │
│  [LOW]  ~ Note for review: "[observation]"                │
│                                                           │
│  Commit: "[skill]: [summary of changes]"                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Ask user: **Apply these changes? [Y/n] or describe tweaks**

### Step 4: Apply or Save

**If approved:**
1. Read the target skill file from `.claude/skills/[skill-name]/SKILL.md`
2. Apply changes using the Edit tool
3. Confirm: "Skill updated"

**If declined:**
Ask: "Save these observations for later review?"
If yes, append to `.claude/skills/[skill-name]/OBSERVATIONS.md`

## Example

User runs `/skill-improve-from-session frontend-design` after a UI session:

```
┌─ Skill Reflection: frontend-design ──────────────────────┐
│                                                           │
│  Signals: 2 corrections, 3 successes                      │
│                                                           │
│  [HIGH] + Constraints/NEVER:                              │
│          "Use gradients unless explicitly requested"       │
│                                                           │
│  [HIGH] + Color & Theme:                                  │
│          "Dark backgrounds: use #000, not #1a1a1a"        │
│                                                           │
│  [MED]  + Layout:                                         │
│          "Prefer CSS Grid for card layouts"                │
│                                                           │
│  Commit: "frontend-design: no gradients, #000 dark"       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Rules

- Always show exact changes before applying
- Never modify skills without explicit user approval
- Use relative paths (`.claude/skills/`) not absolute paths
