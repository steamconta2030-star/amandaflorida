import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Amanda Florida — Capacitor configuration for the native mobile shell.
 *
 * Local setup (run on a Mac, NOT inside Lovable):
 *   1. npm i -D @capacitor/cli
 *      npm i @capacitor/core @capacitor/ios
 *   2. npx cap init "Amanda Florida" "com.amandaflorida.mobile" --web-dir=dist
 *   3. npm run build      (produces the SPA in dist/)
 *   4. npx cap add ios
 *   5. npx cap sync
 *   6. npx cap open ios   # opens Xcode
 *
 * App Store submission:
 *   Xcode → Product → Archive → Distribute App → App Store Connect
 *   (requires an Apple Developer account — $99/year)
 */
const config: CapacitorConfig = {
  appId: "com.amandaflorida.mobile",
  appName: "Amanda Florida",
  webDir: "dist",
  backgroundColor: "#FAFAF7",
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#FAFAF7",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
