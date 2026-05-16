# Agent Output Schema

Every Sub Agent returns only a structured summary to Main Agent.

```json
{
  "agent": "agent-name",
  "status": "completed | blocked | failed",
  "summary": "short implementation or verification summary",
  "changedFiles": [],
  "decisions": [],
  "tests": [],
  "risks": [],
  "needs": [],
  "blockedBy": []
}
```

## Required Fields
- `agent`
- `status`
- `summary`
- `changedFiles`
- `decisions`
- `tests`
- `risks`

## Optional Fields
- `needs`
- `blockedBy`
- `apiChanges`
- `dbChanges`
- `envChanges`
- `qaScenarios`
- `followUpTasks`

## Rules
- Do not include full internal work logs.
- Include only decisions that affect another agent, the user, or future maintenance.
- Use empty arrays instead of omitting required list fields.
