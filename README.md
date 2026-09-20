# Agentic CLI Workspace

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

![Terminal Demo](demo.gif)

> **A lightweight, autonomous Python coding agent that lives entirely in the terminal. Handles complex multi-step reasoning to debug and write code directly in your local workspace.**

## Key Features
- **Autonomous file editing and codebase refactoring**
- **Terminal-native execution with real-time feedback**
- **Local filesystem AST context extraction**

## Architecture

```mermaid
flowchart TD
    A[Developer Terminal] -->|CLI Command| B(Agent Workspace)
    B --> C{Context Analyzer}
    C -->|Read Code| D[Local Filesystem]
    C -->|Construct Prompt| E[LLM Inference]
    E -->|Structured JSON| F(Action Executor)
    F -->|Write Edits| D
```

## Live API Endpoint (Vercel)

This project is deployed serverless via Vercel Edge Functions. You can test the interaction directly from your terminal.

```bash
# Example Request
curl -X GET https://agentic-cli-workspace-eb1sw2lhr-dev4aibots.vercel.app/api/health
```

## Developer Quickstart

### Prerequisites
- Python 3.11+
- Node.js (for Vercel CLI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dev4aibots/agentic-cli-workspace.git
   cd agentic-cli-workspace
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Project Structure
```
.
├── api/                  # Vercel serverless endpoints
├── src/                  # Core Python modules & agent logic
├── tests/                # Unit and integration tests
├── public/               # Static assets
├── requirements.txt      # Python dependencies
└── vercel.json           # Vercel routing configuration
```

## License
This project is licensed under the MIT License.
