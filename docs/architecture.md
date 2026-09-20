# Architecture

The agent uses a standard ReAct (Reason-Act) loop, communicating with the LLM via structured JSON to enforce strict typing on filesystem and shell executions.