# Native build scaffold (Capacitor) - free, local only

This folder only describes how to wrap the existing web app as an Android/iOS shell later.
Nothing here is built, signed or published. No store account, no paid service, no extra permissions.

Steps (run on your own computer, all free):
1. Install Node.js, then in this folder run `npm install`.
2. `npx cap add android` (Android Studio is free). iOS needs a Mac and Xcode (free); publishing to a store needs a developer account and is NOT part of this scaffold.
3. `npm run sync` copies the web files from the parent folder into `www/` and syncs the shell.

Permissions: the shell requests none beyond internet access. Notifications, camera, storage and location are NOT requested.
The web app remains the source of truth; the native shell loads the same files offline.

Verified locally (headless/emulated, 2026-11-26): `npm install`, `npm run sync` and `npx cap add android` run and generate an Android project whose only permission is INTERNET. NOT tested: an Android build (no Android SDK here), any iOS build (needs a Mac and Xcode), running on a device, the default Capacitor launcher icon is still in place (custom icons are not set), and nothing here is store-ready.
