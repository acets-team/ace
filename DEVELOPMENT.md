## How to deploy a new version?
- Features:
    - ✅ An updated `CHANGELOG.md`
    - ✅ `GitHub` Release
    - ✅ An `NPM` Publish
1. Update `CHANGELOG.md`
    - Section explanation [from](https://keepachangelog.com/en/1.1.0/):
        - `✨ Added`: for new features.
        - `🧠 Improved`: for changes in existing functionality
        - `🚨 Deprecated`: for soon-to-be removed features
        - `🐛 Fixed`: for any bug fixes
        - `🗑️ Removed`: for now removed features
        - `👮 Security` in case of vulnerabilities
    1. Add the new version at the top, Example:
        ```
        ## [0.6.3] - 2025-11-07
        ### ✨ Added
        ### 🧠 Improved
        ### 🚨 Deprecated
        ### 🐛 Fixed
        ### 🗑️ Removed
        ### 👮 Security
        ```
    1. Append new link (above all other links) at the bottom of page
        ```
        [0.6.3]: https://github.com/acets-team/ace/compare/v0.6.2...v0.6.3 
        ```
1. Stage and commit changes
    ```bash
    git add .
    git commit -m "Release 0.6.3 – description of updates"
    ```
1. Bump the Package Version
    | Command             | When to Use                        | Example         |
    | ------------------- | ---------------------------------- | --------------- |
    | `npm version patch` | Bug fixes or minor improvements    | `0.6.0 → 0.6.1` |
    | `npm version minor` | New features (backward-compatible) | `0.6.0 → 0.7.0` |
    | `npm version major` | Breaking changes                   | `0.6.0 → 1.0.0` |
1. Publish `GitHub` Release
    1. Push to Github
        - 🚨 `git push origin main --follow-tags`
        - `npm version patch` (or `minor`/`major`) creates both a `commit` and a `git tag`
        - `git push` by itself only pushes commits, **not tags**.
        - `--follow-tags` pushes both the commit and the tag (so `GitHub` can create the release properly)
    1. Go to [GitHub → Releases](https://github.com/acets-team/ace/releases)
    1. Click `Draft a new release`
    1. Select new tag (match new version), example `0.6.3`
    1. Click `Auto-generate release notes`
    1. Click `Publish Release`
1. Publish to `NPM`
    - From project root directory:
        1. Login: `npm login`
        1. Publish: `npm publish`
1. Verify Release @:
    1. [Tags](https://github.com/acets-team/ace/tags)
    1. [Releases](https://github.com/acets-team/ace/releases)
    1. [npm Package](https://www.npmjs.com/package/@acets-team/ace)
    1. [`CHANGELOG.md`](https://github.com/acets-team/ace/blob/main/README.md)



## @ `package.json` why `"prepublishOnly": "npm run build",`:
- This `NPM` lifecycle hook ensures `npm publish` does an `npm run build` b4 `npm publish`



## Why is the `/dist` sent to `NPM`?
- This is the case @ `.npmignore` so all receive compiled code immediately with no extra steps required



## Why is `/dist` not sent to `Github`?
- This is the case @ `.gitignore` to simplify our git commits



## Why `&& (chmod +x cli.js || true)`
- Ensure cli.js is always executable right after you build it
- ALL get a ready-to-run executable CLI 
- The || true allows us to gracefully skip on windows
- Windows doesn’t care about executable (+x) permissions like Linux or Mac does



## Did an npm unlink @acets-team/ace but it's still linked in working directory
- `nvm use 24` in the ace directory
- `npm unlink @acets-team/ace` in the ace directory
- `npm unlink @acets-team/ace -g` in the ace directory
- `nvm use 24` in the working directory
- `npm unlink @acets-team/ace` in the working directory
- `npm unlink @acets-team/ace -g` in the working directory
- `which ace` to see what version still has it linked, `nvm` to that node version, do the same there, then come back to node version 24
