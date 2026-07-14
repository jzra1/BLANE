# Changelog: BLANE

All notable changes to the BLANE project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-07-15

### Added
- Git repository initialized at the vault root.
- Scaffolded Vite + Vanilla JS frontend in `Projects/blane/app/`.
- Designed the database schema migration `20260715000000_init.sql` containing profiles, daily metrics, recipes, markets, and inventory.
- Created local Supabase configuration file (`config.toml`) and Deno Edge Function skeleton.
- Applied responsive UI styling sheets based on the `ui-ux-pro-max` design token system.
- Parsed and integrated all 1,542 PhilFCT food items from DOST-FNRI, enabling full-library search capability.
- Implemented dynamic market pricing on recommendations tab synced to the selected GeoMarket.
- Added mock Admin Portal for simulating system management and global markups (CP2 Form 12).
- Documented Gemini 2.5 Flash-Lite vs. OpenAI GPT-4o-mini trade-off in `DECISIONS.md`.
- Implemented Login card and a 4-Step Onboarding Wizard to capture user demographics, biometrics (for MSJ formula inputs), daily budget, and dietary preferences (allergies and diets).

## [0.0.1] - 2026-07-14

### Added
- Seeded project vault directories using capstone proposal: `README.md`, `OVERVIEW.md`, `SESSION_LOG.md`, `CHANGELOG.md`, `DECISIONS.md`, and dated logs.
