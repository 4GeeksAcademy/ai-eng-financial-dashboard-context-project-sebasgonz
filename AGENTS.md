# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

## Phase 3 Rule Candidates

The user selected `agents/rules` without a leading dot. The following project-specific guides are awaiting final approval of Phase 3; read their scope and validation criteria before using them. They do not authorize unrelated functional changes.

- [Architecture and naming](agents/rules/architecture-and-naming.md)
- [Financial data and dates](agents/rules/financial-data-and-dates.md)
- [Runtime and networking](agents/rules/runtime-and-networking.md)
- [Testing and evidence](agents/rules/testing-and-evidence.md)
- [Documentation and workflow](agents/rules/documentation-and-workflow.md)

The approved Phase 2 analysis remains in [.agents/rules/proposed-contributor-rules.md](.agents/rules/proposed-contributor-rules.md) as historical proposals, not a second active rules directory. Skills remain under `.agents/skills` when present; `memory-bank` is optional. This index provides explicit discovery, not a guarantee of automatic loading by every tool.
