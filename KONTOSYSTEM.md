# Kartlegg Konto – implementation and release review

Scope: implementation in **aasen700/Kartlegg-test**, followed by the owner-authorized first rollout to **aasen700/Kartlegg main / kartlegg.com** on 19 Oct 2026. The original instruction to keep production unchanged was superseded by the owner in the same session. Firebase remains on Spark; no billing or paid services were enabled. Public web config was read from project `kartlegg` in Firebase Console. No administrative credentials are in the repository.

## Release state

The owner requested the first production rollout with `accountEnabled = true` in `assets/account/config.mjs`. The same flag can disable the account feature without disabling local tools. The server rules were tested in emulators and published in the `(default)` Firestore database; the database location observed in Console is `europe-north2`. Email/password and Google are enabled, both production hostnames and localhost are authorized, and one-account-per-email linking is enabled. Firebase password enforcement is set to require 12–128 characters. Full real-device/provider acceptance remains a separate verification item; emulator and synthetic browser results must not be described as live OAuth/email delivery tests.

## Architecture and data boundary

Plain HTML/CSS/JS, no new framework/build step. `entry.mjs` mounts the existing profile dialog; `firebase.mjs` dynamically loads pinned modular Firebase SDK 13.0.0 (Auth + Firestore only). No Analytics, Storage, Functions, App Check provider, or paid services initialized. Developer dependencies are test-only; package-lock pins them.

Existing owners remain responsible for values/UI:

- `KartleggSenderProfile.read/apply` wraps the four existing sender fields and refreshes ISBAR locally.
- `KartleggToolNavigation.applyFavorites` updates the same favorites list/cards.
- `KartleggThemeLayers.apply` updates the same normalized theme state and existing controls.
- The three original storage keys are retained. `kartlegg:settings-changed` is emitted by explicit profile save/clear, favorite toggles and appearance changes. Profile editing uses the existing save button.
- `adapter.mjs` reads only these three APIs. `model.mjs` constructs an explicit allowlisted payload. No form serialization, arbitrary storage scanning or clinical DOM observation occurs.

Firestore path: `/users/{firebaseAuthUID}` (one document). Active document:

```json
{
  "schemaVersion": 1,
  "state": "active",
  "revision": 1,
  "settings": {
    "profile": {"name":"", "role":"", "work":"", "department":""},
    "favorites": ["news2"],
    "appearance": {"mode":"system", "accent":"blue", "service":"custom", "base":"standard", "season":"off", "surface":"solid"}
  },
  "updatedAt": "Firestore server timestamp"
}
```

Profile strings: max 120 characters. Favorite IDs: unique exact IDs from the tool registry (max 18). Appearance: six strict enums. Every nested map rejects additional fields. No password/email/token/measurement/history/ISBAR field is allowed in Firestore. Email and passwords are handled by Firebase Auth.

**Limits of schema validation:** rules cannot determine whether a person deliberately types patient information into their own name/work field. The UI prohibits this and there is no clinical-to-account data path. Do not claim semantic detection or prevention of arbitrary text in a name field.

## Auth and OAuth

Email registration, email/password login, Google popup, verification resend/refresh (refreshes ID token), password reset with generic result, sign-out, reauthentication, Google linking, adding a password to a Google account via an email reset link, account deletion, and settings export. Password policy in registration UI is minimum 12 characters. Password setup/reset is handled on Firebase's own email action page. Firebase Console must enforce that policy too; a client check alone is bypassable. Auth errors are mapped to Norwegian; raw SDK messages are not shown or logged by the app.

Same-email handling: Firebase's one-account-per-email setting must remain enabled. Login first with the original method, then link Google using `linkWithPopup`; an authenticated Google user can request a password setup/reset email for the same account. No blind merge of two UIDs or credential persistence. Wrong credentials/reset responses do not disclose registered methods using `fetchSignInMethodsForEmail` (which is incompatible with email enumeration protection). Actual Google trusted-provider behavior and linking must still be tested against the configured project.

Google uses `signInWithPopup` / `reauthenticateWithPopup`, directly from a user click after SDK initialization, with `authDomain: kartlegg.firebaseapp.com`. **Do not change authDomain to kartlegg.com on GitHub Pages:** Pages does not serve Firebase's reserved `/__/auth/*` handlers. No automatic redirect fallback. Popup blockers receive Norwegian instructions and email login remains available. Test Safari/iOS, Chrome/Android and desktop on the intended HTTPS origin before release. Popup remains dependent on browser privacy settings and extensions.

Authentication uses browser-session persistence with in-memory fallback. Firestore uses memory-only cache; no persistent Firestore IndexedDB cache. Tokens are managed only by the Firebase SDK.

## Sync and conflict handling

- Every sign-in requires an explicit choice between local/pending and cloud settings, with a text-safe preview of both. A first-time empty cloud document never silently absorbs the device's profile.
- A user can import device settings or use account settings. Both actions explain replacement. No silent profile/theme merge. Favorities are included in the chosen version.
- Local edits debounce for 900 ms. Each write is a server transaction comparing the expected integer revision. Concurrent edits produce a conflict choice rather than last-write-wins overwrites.
- A server-only document listener receives changes on another device. Unchanged local settings may accept a newer cloud version; concurrent local edits stay intact and require a decision.
- Pending sanitized settings are stored under `kartlegg.account.pending.v1.{uid}` for failed network/storage writes. A new login for that UID may explicitly recover them. No unbounded retries: online event and manual retry are supported. Auth initialization/read failure leaves local tools intact.
- During an active session a guest backup (`kartlegg.account.guest.v1`) and owner marker (`kartlegg.account.owner.v1`) protect the guest workspace. The durable guest backup omits the guest profile unless the original remember-profile checkbox was selected; a memory-only guest profile is restored only within the current page, consistent with its original persistence choice. Logout restores guest settings and removes that account's pending changes after warning about unsynced data. On reload, the guest workspace is restored before sign-in selection. A different account never silently uploads the previous account's profile.
- All storage is ordinary browser storage, not encrypted. Use trusted devices and explicit logout on shared equipment. Other tabs/devices may retain their own locally cached settings; remote deletion cannot erase a disconnected browser's storage.
- Closing a browser session is not a substitute for explicit logout on shared equipment; session restore behavior varies by browser.

## Deletion lifecycle (free-plan constraint)

Client-only Auth/Firestore cannot perform a cross-service atomic delete. First, a Firestore transaction replaces the whole profile with exactly `{schemaVersion:1,state:'deleting',updatedAt:serverTimestamp()}`. Rules require recent sign-in (five minutes) and permanently block writes that could resurrect the profile from another session. Then `deleteUser` removes Firebase Auth identity. A failed Auth delete leaves a recoverable deletion workflow: reauthenticate and press delete again. The UI suspends background saves during deletion.

Only a minimal technical tombstone remains (UID path + deletion timestamp + schema/state), with no name, role, work, favorites or theme. **This is a known operational dependency, not a claim of total automatic deletion.** The operator must adopt and disclose a deletion retention schedule before launch. Recommended policy to evaluate: daily manual cleanup, maximum seven days. Only remove a tombstone after confirming in Authentication that that UID no longer exists. An admin can delete it in Console without adding Functions/Blaze. If fully automatic, zero-residual cleanup is mandatory, this client-only solution does not meet that requirement and needs a separately authorized trusted backend.

## Security rules

Owner-only `get`, no collection lists or subcollections. Active writes require verified email, exact schema/keys/types/enums, server timestamp and monotonic revision. All other paths default deny. Deletion tombstones require recent authentication, have no settings, and cannot be removed/reversed by clients. Auth service manages credentials. Keep administrative access restricted and MFA enabled for project admins.

## Deployment and acceptance checklist

1. Review this branch and `firestore.rules`; run all tests below.
2. In Firebase Console → Firestore → `(default)` → Rules, replace the temporary deny-all rules with this reviewed rules file and publish. This changes live project access. The first rollout published the reviewed rules in Console. Alternatively, a trusted operator can run `firebase deploy --only firestore:rules --project kartlegg` locally. Never deploy against a guessed project.
3. Authentication → Settings: confirm one account per email, email enumeration protection, password policy enforced (minimum 12), and Google + Email/Password providers. Review email sender/templates, support address and verification/reset link destinations.
4. Authorize only the exact HTTPS test origin needed for private acceptance testing. GitHub Pages is not available for the private test repository on the current setup (`has_pages=false`); production remains hosted from the existing public Kartlegg repository. Use a private staging origin or local test environment. Transfer reviewed source changes to the public production repository when the owner authorizes release; do not deploy the private test repository to the production custom domain/CNAME. This repository retains its original CNAME but it must never be activated for test hosting.
5. Complete the privacy notice items below, then enable `accountEnabled` in the private acceptance-test build. Do not turn it on for general users merely because unit tests pass.
6. Execute the manual matrix. Production-domain verification remains necessary before an eventual separately authorized launch; the owner explicitly authorized this production rollout after reviewing the private preview.

## Privacy requirements still requiring the owner's decisions

The production notice identifies Philip Aasen as responsible for Kartlegg Konto and uses the Firebase-configured support contact aasen700@gmail.com. It explains the requested account/sync service under GDPR art. 6(1)(b), optional profile fields, categories, providers, local storage, rights, and the manual deletion-marker process. The following remain operational responsibilities as use expands:

- Confirm the legal controller (Philip Aasen personally, or a named organization) and a dedicated reachable contact for privacy requests.
- Record the legal basis for each purpose. Necessary account/sync processing may be based on GDPR art. 6(1)(b) if its conditions actually apply; optional profile fields should remain optional. A checkbox acknowledging the notice is **not** by itself a GDPR consent/legal basis.
- Review and record Firebase/GCP applicable data processing terms, subprocessors, international transfer basis and safeguards. Firestore region is not the location of every Auth/security operation. No assertion that all data stays in Europe.
- Confirm actual Firestore region in Console; establish account/tombstone, security-log and backup retention information and deletion procedure. Define how access/export/rectification/erasure requests are handled (normally within one month, with lawful exceptions).
- Assess necessary storage under Norwegian electronic communications rules; no Analytics/marketing tracking is initialized by this account module. Avoid claiming a universal cookie-consent exemption without evaluating actual site behavior.
- Maintain a proportionate risk assessment, processing inventory, access/incident process and administrator permissions. Evaluate whether any DPIA trigger applies; this feature is not designed for patient data.

Primary references checked 19 Oct 2026:
- https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/informasjon-og-apenhet/
- https://firebase.google.com/support/privacy
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/web/redirect-best-practices
- https://firebase.google.com/docs/firestore/manage-data/transactions
- https://firebase.google.com/docs/firestore/quotas

## Cost and quotas

Keep Spark; do not enable Blaze, billing, Cloud Functions, paid exports or scheduled TTL. This implementation uses email/password + Google Auth and one small Firestore document per account, with debounced writes and one listener while authenticated. Free-plan quotas and authentication abuse limits still apply; exhaustion can interrupt sync. Current Firestore free allotments documented by Google: 1 GiB stored, 50,000 reads/day, 20,000 writes/day, 20,000 deletes/day and 10 GiB outbound/month for one database. Security rules deny invalid paths but do not guarantee bot resistance or unlimited capacity. The error UI preserves pending settings at quota exhaustion. Regularly inspect Console usage; code alone cannot guarantee free service at arbitrary scale.

## Reproducible checks

```sh
npm ci --ignore-scripts
npm test
# Requires Java >= 21; demo project only, no credentials/billing/network to live Firebase
npm run test:rules
python3 tests/browser-smoke.py
python3 tests/account/browser-smoke.py
```

The account UI browser test serves localhost, uses real app HTML/JS/adapters and a synthetic backend. It does **not** validate live Firebase, Google OAuth, verification/reset email delivery or password/provider linking. CI runs the existing browser suite and the account suite with Chrome on Ubuntu.

Manual acceptance matrix (pending):

| Scenario | Required result |
| --- | --- |
| Email registration, weak password, duplicate email | Norwegian feedback; verified email required before cloud write |
| Real verification and reset emails | Correct sender/links, expired links fail safely, login after reset works |
| Google desktop/Android/iOS | Popup, blocked popup and cancelled popup handled; correct UID |
| Email + Google same address | Original login + linking retains same UID/settings; collision is explained |
| Google account uses emailed password setup/reset | Same UID works with both methods |
| New device, local profile + existing account | Preview/choice, no silent upload |
| Two devices edit concurrently | Revision conflict; both versions remain reviewable |
| Offline → edits → reconnect/reload | Pending retained, retry succeeds without overwriting newer remote data |
| Logout and another user's login; browser session restore | Guest restoration and no previous-account data import |
| Storage blocked; Firebase CDN blocked | Account degrades, tools continue working |
| Delete with stale login, failure, retry, another open tab | Reauthenticate; no profile resurrection; Auth removed; operator cleanup |
| Mobile sizes, dark/service/season themes, keyboard/screen reader | Controls visible, named, reachable; dialog focus and status usable |
| Quota/permission denial | Clear message and pending settings retained |

## Verification record

Executed locally on 19 Oct 2026:

- 236 unit/contract tests passed (217 existing + 19 new model/sync tests).
- 20 emulator integration tests passed: 14 security-rule scenarios and 6 Auth SDK lifecycle scenarios (registration/verification, reset, duplicate email, Google-to-password setup, deletion, password-to-Google linking). The synthetic Google credential verifies provider/UID behavior in the emulator, not a Google browser OAuth exchange.
- `node --check` for all account modules, `git diff --check` and production-dependency audit passed.
- Chrome cannot start locally because this execution environment blocks required sockets. The first GitHub Actions run passed both the existing full browser smoke suite and the account browser test. The updated final commit is checked again by CI; see the PR checks for its exact status.

Account browser tests use actual app HTML/JS and synthetic backend data to check the existing profile dialog, explicit import, profile/favorites/theme adapters, personal theme, clinical text exclusion, logout, guest profile restoration and persistence choices. They also check the disabled account gate. Mobile visual review, real-domain OAuth, actual email delivery and the manual acceptance matrix remain outstanding and are not represented as passing.
