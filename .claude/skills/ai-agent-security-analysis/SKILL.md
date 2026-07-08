---
name: ai-agent-security-analysis
description: >
  Analyze the security posture of AI agents: inventory agents in a codebase, classify
  autonomy, map data access / tools / privileged actions, detect toxic combinations
  (e.g., sensitive-data read + external send = exfiltration path), audit MCP governance,
  assess runtime guardrails, and produce a prioritized security report with an optional
  red-team test plan. Use this skill whenever the user asks to review, audit, harden, or
  assess an AI agent or agentic system — mentions "agent security", "segurança de agentes",
  "análise de segurança", "auditoria do agente", "prompt injection", "MCP security",
  "red teaming de agentes", "combinações tóxicas", or asks "what can this agent do if
  manipulated?". Also use when reviewing .mcp.json / MCP server configs, agent tool
  definitions, agent permissions, or multi-agent architectures — even if the user doesn't
  say "security" but wants an agent's tools, permissions, or risks reviewed before
  shipping. Works on real code (any framework: LangChain/LangGraph, CrewAI, OpenAI
  Agents SDK, Claude Agent SDK, MCP configs) and on architecture descriptions in prose.
---

# AI Agent Security Analysis

Analyze the security posture of AI agents — systems that don't just *answer*, but can
**decide, access data, call tools, and execute actions**. The framing question that drives
the whole analysis:

> **"What can this agent do if someone manages to manipulate it?"**

Not "does the agent respond correctly?". A chatbot that answers wrong is embarrassing; an
agent that gets manipulated can exfiltrate a CRM, drop a production table, or email your
internal docs to an attacker.

## Core model: the toxic combination

Agent risk emerges when these factors combine:

1. **A manipulable LLM** — every LLM is susceptible to jailbreak and prompt injection;
   assume the model can be steered by any content it reads (every token is attack surface).
2. **Access to sensitive data** — email, calendar, CRM, internal docs, databases, secrets.
3. **Privileged actions** — send email, call APIs, write data, run commands, delete things.
4. **Imperfect reasoning** — the model cannot be trusted to always notice it's being used.

Not all four are needed: privileged access alone can be enough (a coding agent with
permission to delete production volumes needs no sensitive data to cause damage). Your job
is to find where these factors combine **without an intercepting control**, and rank those
paths by severity.

## Input modes

- **Codebase / config**: the user points at a repo, an agent implementation, or MCP/agent
  config files. Do full discovery (Phase 1) on the actual files — every finding must cite
  file and line. Never report a risk you can't point to in the code or config.
- **Architecture description**: the user describes an agent in prose (no code yet). Skip
  file discovery; build the inventory from the description, ask about anything ambiguous
  that changes the risk picture (what data? which tools? who sees the output?), and mark
  assumptions explicitly in the report.

Write the report in the language the user is speaking (PT-BR user → PT-BR report).

## Workflow

### Phase 1 — Discovery: you can't secure what you can't see

Inventory every agent in scope. Organizations (and repos) routinely contain more agents
than anyone declared. Search for these signals:

```
1. LLM API usage (an app that calls an LLM API is an AI app):
   - imports/SDKs: anthropic, openai, google.generativeai, boto3 bedrock, vertexai,
     litellm, azure.ai
   - endpoints: api.anthropic.com, api.openai.com, *.openai.azure.com,
     bedrock-runtime, generativelanguage.googleapis.com
2. Agent frameworks (LLM API + planning/tools ≈ agent):
   - langchain / langgraph, crewai, autogen / ag2, openai-agents, pydantic-ai,
     claude-agent-sdk, semantic-kernel, smolagents
3. MCP usage (LLM API + MCP is a strong "this is an agent" signal):
   - .mcp.json, claude_desktop_config.json, mcpServers keys, mcp SDK imports
4. Tool/skill definitions:
   - @tool decorators, tools=[...] arrays, function-calling schemas, OpenAPI specs
     wired to the model, .claude/skills/, .claude/commands/
5. Agent instructions and memory:
   - system prompts, instruction files (CLAUDE.md, AGENTS.md, prompt templates),
     memory stores (vector DBs, files the agent writes and later re-reads)
6. Credentials and permissions the agent runs with:
   - .env, IAM roles, service accounts, API keys, DB connection strings,
     permission allowlists (.claude/settings.json)
7. Agent platforms referenced: Copilot Studio, Azure AI Foundry, AWS Agent Core
   (Bedrock Agents), Salesforce Agentforce
```

For each agent found, record: **entry points** (what content reaches the LLM), **data it
can read**, **tools/actions it can take**, **credentials/permissions it runs with**, and
**where its instructions and memory live**.

### Phase 2 — Classify autonomy and blast radius

Classify each agent — controls that work for one class fail for another:

- **Low autonomy**: fixed pipeline (step 1 → 2 → 3) that uses the LLM at specific points.
  Predictable, monitorable, easy to baseline. Example: reads calendar, prioritizes,
  returns a list.
- **High autonomy**: plans its own execution path at runtime — picks tools dynamically,
  reaches different data sources, can do the same task by different routes. Harder to
  predict; behavioral baselining is weak here.
- **Multi-agent**: several agents interacting. Riskiest and least mature: each agent's
  actions can look benign while the *combined* effect is dangerous, and the attack
  surface multiplies. Flag multi-agent systems as inherently elevated risk even when
  each individual agent looks fine.

For each agent also record the **blast radius**: worst realistic outcome if fully
manipulated (data exfiltrated? emails sent as the user? production data destroyed?).

### Phase 3 — Assess

Run four assessment lenses. Each has a dedicated reference — read it when you reach
that lens:

**a. Toxic combinations** — read `references/toxic-combinations.md`. Risk lives in
*combinations*, not isolated permissions: CRM read + email send = exfiltration path;
internal data + web fetch = exfiltration path; read-only intent + write permission =
excess privilege. Map every (data access × action) pair the agent holds and check it
against the catalog.

**b. Intent vs. permission alignment** — compare four intents and flag misalignment:

1. *Organizational intent*: what risk is acceptable here?
2. *Developer intent*: what was this agent built to do? (read its instructions)
3. *User intent*: what does a request actually need?
4. *Runtime intent*: what can the agent actually do right now?

The classic finding: instructions say "prioritize the calendar" but the token grants
calendar **write**. Permissions the stated purpose doesn't need are findings, always —
"broad access to make things easier" is how exfiltration paths get built. Ideal state to
recommend: intent-based access — only the permission needed, only when needed, only for
the current intent.

**c. MCP governance** — read `references/mcp-security.md`. MCP is the agent's power link
to tools, APIs, and data — a capability accelerator and a risk accelerator. Check:
allowlist (not denylist), official/verified servers, HTTPS, version pinning, scanning,
gateway, and — critically — whether **MCP responses are treated as untrusted input**.

**d. Guardrails & runtime defense** — build-time review is necessary but insufficient,
because agents *change during use* (memory, skills, MCPs, the APIs behind MCPs, tools,
data). Check what exists at runtime:

- **Coverage**: guardrails must apply to *every* token stream reaching the LLM — user
  prompt, emails, documents, web pages, memory, skills, MCP/tool responses. Filtering
  only the initial user prompt is a finding (the most common one).
- **High-risk action blocking**: are irreversible/dangerous actions (delete all, `DROP
  TABLE`, mass send, config changes, external upload) blocked or gated on human approval?
- **Interception points**: where can a control actually say "stop"? Before the prompt
  reaches the LLM, before an MCP call, before a tool executes, before a skill installs,
  before an email sends, before data is written or sent out. No interception point =
  detection-only posture.
- **Toxic-combination detection at runtime**: does anything watch for the *path* (read
  sensitive → send external) rather than isolated actions?
- **Behavioral anomaly**: any baseline/deviation detection? (Works for low-autonomy
  agents; expect it to be weak for high-autonomy and multi-agent — say so rather than
  recommending it as a fix there.)

### Phase 4 — Report

Read `references/report-template.md` and produce the report in exactly that structure.
Severity is defined by **path completeness**, not by individual scary permissions:

| Severity | Criteria |
|----------|----------|
| **Critical** | Complete attack path: untrusted content reaches the LLM **and** the agent holds the data access **and** the outbound/privileged action to complete exfiltration or destruction — with no intercepting control. |
| **High** | Complete path with partial mitigation (e.g., guardrail on prompt only), **or** a destructive privileged action reachable from untrusted input even without sensitive data. |
| **Medium** | Excess privilege vs. intent; missing MCP governance controls; guardrails covering only the user prompt; one-time (non-continuous) posture review. |
| **Low** | Hygiene gaps: no agent inventory/registry, missing logging/telemetry, no documented risk acceptance. |

Every finding needs: the combination or gap, evidence (file:line or the user's own
description), a concrete failure scenario ("attacker emails X → agent summarizing inbox
reads it → ..."), and a specific fix. Prefer fixes that *remove* the path (drop the write
permission, split the agent) over fixes that *filter* the path (add a guardrail) —
guardrails are useful but imperfect; there will always be a new jailbreak.

### Phase 5 — Red-team test plan (on request, or for Critical/High findings)

Read `references/red-teaming.md`. Agent red teaming is not chatbot red teaming: the goal
is not to make the model say something bad, but to **manipulate the tools, data,
permissions, and MCP calls behind the agent**. Generate concrete test cases — direct
injection, indirect injection through each ingestion channel the agent actually has, and
exfiltration tests derived from the toxic combinations you found in Phase 3.

## Common mistakes to check for (fast heuristic list)

Each of these, if present, is a finding:

- Treating the agent like a chatbot (only response-quality testing, no action testing).
- Guardrails on the user prompt only — nothing on emails, docs, memory, MCP responses.
- No inventory of agents (shadow agents in the codebase).
- Deny list as the primary MCP control (allowlist is the recommendation — e.g., 300+
  GitHub MCP servers existed, one official).
- Permissions reviewed in isolation, never as combinations.
- Posture reviewed once before go-live, never again — while memory, skills, and MCPs
  keep changing.
- Indirect prompt injection not considered (only direct).
- Believing red teaming eliminates risk (it samples it).

## References

| File | When to read |
|------|--------------|
| `references/toxic-combinations.md` | Phase 3a — catalog of dangerous data×action pairs with detection heuristics |
| `references/mcp-security.md` | Phase 3c — MCP governance checklist and config review guide |
| `references/report-template.md` | Phase 4 — exact report structure and a worked finding example |
| `references/red-teaming.md` | Phase 5 — how to generate an agent red-team test plan |
