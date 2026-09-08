# Launchdarkly Changelog

## [Targeting display fixes] - {PR_MERGE_DATE}

- 📊 Rollout weights are now shown as percentages instead of raw thousandths-of-a-percent values
- 🎯 "Current Value" correctly reflects percentage rollouts when a flag is on
- 🌍 Environments display their LaunchDarkly name instead of a re-cased key
- 🔧 Dropped the unsupported `expand` query parameter and the redundant refetch when changing the state filter
- 👤 Fixed maintainer avatars sometimes rendering as an empty dashed box (caused by an invalid SVG data URI in the old `@raycast/utils`)
- ⬆️ Updated `@raycast/api`, `@raycast/utils`, ESLint (flat config), Prettier and TypeScript to current versions
- 🔍 Added search keywords so the extension is found by typing "ld" or "feature flags"

## [Small fixes] - 2025-02-08

- 👥 Avatar icons are now displayed better using the `getAvatarIcon` function from `@raycast/utils`
- 📋 Copy feature flag key to clipboard
- 🔗 Expand open in browser action in the feature flag details
- 📝 Updated readme

## [Initial Version] - 2025-01-10

- 🔍 Search through all your feature flags
- 🏷️ View flag details including variations, targeting rules, and prerequisites
- 🌍 Manage multiple environments
- 👥 See maintainer and team information
- 🔄 Quick toggle between flag names and keys
- 🏃 Fast navigation with keyboard shortcuts
