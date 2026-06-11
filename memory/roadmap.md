# DevOS Progression Roadmap

## Completed so far
1. Added persisted workspace/file state so the IDE keeps file edits across reloads.
2. Added real save and rename support for files in the explorer and editor.
3. Added a real terminal execution endpoint in the backend.
4. Wired the runner to use the terminal execution path instead of mock-only simulation.
5. Added a marketplace/install path for extension-style packages.
6. Added tests for marketplace install-name/path logic.

## Still to complete
1. Add real workspace open/clone/import support instead of only in-memory demo files.
2. Add a proper terminal UI with shell session history and streaming output.
3. Add real git integration (status, diff, commit, push, pull).
4. Add Monaco LSP support for autocomplete, diagnostics, definitions, references, and rename.
5. Add inline AI editing and diff/accept-reject workflows.
6. Add agent mode with context-aware file reads, edits, terminal execution, and error feedback.
7. Add approval gates, rollback/snapshot support, and multi-agent orchestration.
8. Improve the marketplace to download real packages from a hosted catalog.
