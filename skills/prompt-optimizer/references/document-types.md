# What each document type should carry

Per-type guidance for the audit in [`SKILL.md`](../SKILL.md). Read the section for the target's type; the six shifts still apply on top.

## System prompt

Product context: what product the agent operates in and what it is doing there. This is where harness builders spend most of their effort. It should not carry tool usage instructions (those live in each tool's description — shift 4) or task-specific procedures (those live in skills — shift 3). For Claude Code itself the system prompt is not editable; if the user is auditing one, they are building their own agent harness.

## CLAUDE.md / AGENTS.md

Lightweight: a brief statement of what the repo is for, then spend the remaining tokens on gotchas — the unwritten convention ("types live only in this monolithic file"), the reason behind a choice, the trap no config file confesses. Delete anything visible from the filesystem or derivable from the repo (shift 5). Detailed procedures (how to verify work, how to run a review) become skills referenced from here with a one-line pointer (shift 3).

## Skills (SKILL.md)

A lightweight guide that lets Claude find information when needed — best when it encodes opinions, knowledge, or practices particular to the user, their team, or their product. Avoid over-constraining except where a mistake is irreversible (shift 1). Long skills split into a main file plus `references/` files loaded on demand (shift 3). The `description` frontmatter is an always-loaded pointer: front-load the trigger word, list the distinct cases that should fire it, and cut anything the body already says.

## Tool and agent descriptions

The description is the single home for how to use the tool — nothing about it belongs in the system prompt (shift 4). Replace worked examples with an expressive interface: enums whose values hint at usage, parameter names that carry meaning, one-line constraints on behavior (shift 2). The old ~9,100-character TodoWrite description became a two-line summary plus `pending | in_progress | completed` and "only one task in_progress at a time".

## Specs and plan files

Prefer code over prose: a detailed test suite, a function in another codebase to port, an HTML mockup instead of a description or screenshot (shift 6). Rubrics are specs too — written so a verifier agent can apply them to check taste (e.g. what good API design looks like). Plans can live as rich artifacts rather than flat markdown when the structure helps.
