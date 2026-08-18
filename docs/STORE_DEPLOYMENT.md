# Tidly — App Store & Play Store deployment guide

Two ways to get Tidly into the app stores. Do **both** for maximum coverage.

---

## Path A — PWABuilder (fastest, free, no Mac needed)

Best for **Google Play** and **Microsoft Store**. iOS package is generated but review success is uneven — use Path B for Apple.

1. Publish the site (it already is: `https://amandaflorida.com`)
2. Open <https://pwabuilder.com>
3. Paste the URL → it audits the manifest / icons / service worker
4. Click **Package for Stores**
5. Download the `.aab` for Android or `.msixbundle` for Windows
6. Upload:
   - **Google Play** → <https://play.google.com/console> ($25 one-time)
   - **Microsoft Store** → <https://partner.microsoft.com> ($19 individual)

Whenever you update the site, the app updates automatically — no re-upload needed for content changes.

---

## Path B — Capacitor (required for iOS, more control)

Prerequisite: a **Mac** with Xcode installed (or MacinCloud ~$30/mo).

```bash
# 1. Install Capacitor
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios @capacitor/android

# 2. Build the web bundle
npm run build

# 3. Add platforms (config in capacitor.config.ts is already set up)
npx cap add ios
npx cap add android

# 4. Sync web assets into the native projects
npx cap sync

# 5. Open in the native IDEs
npx cap open ios       # → Xcode → Archive → Upload
npx cap open android   # → Android Studio → Generate Signed Bundle
```

### Apple App Store

- Apple Developer account: **$99/year** — <https://developer.apple.com>
- In Xcode: set bundle id `app.tidly.mobile`, sign with your team, archive, upload to App Store Connect
- Review: usually 2–7 days
- **Watch out** for Guideline 4.2 ("minimum functionality"). We already add native features via the Capacitor shell (splash screen, deep links). If rejected, add push notifications with `@capacitor/push-notifications` to strengthen the native surface.

### Google Play

- Google Play Console: **$25 one-time**
- Upload the signed `.aab` from Android Studio
- Review: 1–3 days

---

## Store listing checklist

Prepare before submitting:

- **App name:** Tidly
- **Subtitle / short description (30 chars):** Book cleaning by chat
- **Full description:** copy from `/about` and `/services`
- **Privacy policy URL:** `https://amandaflorida.com/privacy`
- **Terms of service URL:** `https://amandaflorida.com/terms`
- **Support URL:** `https://amandaflorida.com/contact`
- **Support email:** `support@amandaflorida.com`
- **Category:** Lifestyle
- **Age rating:** 4+ (no restricted content)
- **Screenshots:** at least 3 per device size — capture from Preview at 6.5" iPhone (1284×2778) and 5.5" iPhone (1242×2208) sizes
- **App icon:** the 512×512 in `public/icon-512.png` (Xcode / Android Studio will resize)

---

## Content updates after launch

Because `capacitor.config.ts` points `server.url` at the live PWA, updating the website updates the app instantly on every user's device — no store re-submission for content, pricing, or copy changes.

Only submit a new build when you change **native** behavior (permissions, plugins, icons, splash).
