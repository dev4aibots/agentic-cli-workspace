# Failure Analysis

- **Tool Signature Hallucination**: The LLM occasionally invents parameters. Addressed via strict Zod validation.
- **Stuck in loops**: Agent reruns failing tests without changing code. Addressed by budget limits.