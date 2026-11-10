# Security notes

This is a prototype and has not received an exhaustive security audit.

The web AI provider editor currently stores provider configuration, including API keys, in browser localStorage (`frontend/src/ai/providers.ts`, `saveProviders`). These values are readable by code running in that origin and persist across browser restarts. The existence of Tauri keyring commands does not mean this web storage path uses the OS keyring. Avoid storing production credentials in the browser prototype; a future repair should connect a platform-backed credential store and a suitable web server-side secret boundary.

AI/music providers may receive text and requests when explicitly configured. The November 2026 local audit used no provider credentials or calls. Browser tests do not establish desktop keyring, CSP, IPC, filesystem allowlist, or installer security.

Keep secrets out of source, logs, bug reports, screenshots, and exported provider configuration. Use synthetic files when reporting import issues. Report suspected credential exposure privately to the repository maintainer; do not include the credential itself in a public issue.

Development expectations: label mock features, respect media rights and provider authorization, use parameterized database queries, and verify platform-specific permission boundaries with a real target build.
