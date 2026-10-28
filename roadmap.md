# Roadmap

- [ ] Repair Safari Google sign-in callback and registered iOS return-to-app link; verify callback states and handoff tests.

- [x] Returning-device sign-in opens the sign-in form without trial/pricing promotions; subscription choices stay on the Premium page.

- [x] Guided Rituals purchase flow: Explore Premium → choose annual/monthly plan → Apple confirmation → Guided Rituals; selected plan survives required sign-in, native auto-trial and preview bypass removed. Browser handoff and seven safeguard tests passed; actual Apple confirmation remains blocked on release configuration/device access below.

- [x] Resolve npm installation conflict: compatible packages pinned, npm lock synchronized, and clean npm ci passed without force flags.

- [x] Correct native launch configuration to load bundled dist, remove shell-worker registration, and verify fresh web launch plus launch safeguard tests.
- [ ] Verify rebuilt iOS archive on device before App Store resubmission — blocked on Mac/Xcode access; build web assets, sync iOS, inspect packaged assets/config, and test cold launch.

- [x] Logo for Burn & Shed — concept 2 selected and added to the header, favicon, and PWA icons
- [x] Softer shed effect — wash-away wave added as the new "Shed It" tab; shredder kept untouched as "Shred It" (words only)
- [x] Free/Premium split built: free = all release effects unlimited, 100 jokes, Ambient breathe sound, totals and badges. Premium = all 6 breathe sounds, guided rituals, and light/dark themes (no history)
- [x] Guided Rituals tab — vent → full Burn/Shred/Shed effect → one-minute breathing reset → check-in → laugh/breathe follow-up → final check-in and gentle support
- [x] Themes — light/dark appearance; purple app identity with calm green accents limited to Guided Rituals
- [ ] Complete Apple billing release configuration and native purchase test — blocked on real RevenueCat Apple SDK key, App Store product configuration, webhook secret, and Mac/iOS access; existing native integration is in place.
- [x] Top-left Profile button refined — soft violet icon badge on the white pill; done directly after the user skipped all prototype options
