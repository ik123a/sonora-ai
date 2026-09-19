# DEVELOPMENT

Prereqs: Node 24, Rust 1.96, (Android: Java 17 + NDK — missing on this host).
```sh
cd frontend && npm install && npm run dev
npm run build
cargo check --manifest-path ../src-tauri/Cargo.toml (after network for crates)
```
Conventions: strict TS, no `as any`, parameterized SQL, no secrets in logs, label mocks, verify `npm run build` per phase.
