# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`
- Look for available agent skills in the directory:
  `./agents/skills`
- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

## Project Rules

The project-specific guides below were approved after Phase 3 validation. Read the relevant scope and validation criteria before using them; they do not authorize unrelated functional changes.

- [Architecture and naming](.agents/rules/architecture-and-naming.md)
- [Financial data and dates](.agents/rules/financial-data-and-dates.md)
- [Runtime and networking](.agents/rules/runtime-and-networking.md)
- [Testing and evidence](.agents/rules/testing-and-evidence.md)
- [Documentation and workflow](.agents/rules/documentation-and-workflow.md)

The Phase 2 analysis is retained in [proposed-contributor-rules.md](.agents/rules/proposed-contributor-rules.md) as historical context in the same rules directory. Optional skills belong in `agents/skills`; `memory-bank` contains project context. This index provides explicit discovery, not a guarantee of automatic loading by every tool.
