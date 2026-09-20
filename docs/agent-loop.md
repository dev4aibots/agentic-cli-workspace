# Agent Loop

1. **Observe**: Read current plan and errors.
2. **Reason**: LLM generates new plan and selects a tool.
3. **Act**: The Node harness parses the tool and executes the side-effect (read/write/shell).