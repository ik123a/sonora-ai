# ANDROID — APK path (Tauri v2 mobile)

Status: architecture-ready, not yet built on this host.
Host: Android SDK at D:\Android\Sdk (platform-tools OK), Java MISSING, NDK MISSING. Identifier com.sonora.ai, minSdk 24 already in src-tauri/tauri.conf.json.
Steps:
1. Install Java 17 (Temurin) and set JAVA_HOME.
2. Install NDK + Android targets: `rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android`.
3. `npm install -g @tauri-apps/cli` or `cargo install tauri-cli --version ^2`.
4. `npm run tauri android init` then `npm run tauri android build` (or `tauri android dev` with adb device).
APK appears under src-tauri/gen/android/app/build/outputs. No Java = no APK; desktop `npm run dev/build` works now.
