# 💖 DEV FAQ



## How may I deploy a new version?
1. 💬 Commit all changes!
1. ⬆️ Increase version in `package.json`: `MAJOR.MINOR.PATCH`
    - Potential prerequisites:
        - `npm login`
    - `npm version patch`
        - Update includes backward compatible:
            - Bug fixes
            - Super small features
    - `npm version minor`
        - Update includes new features added in a backward-compatible way
    - `npm version major`
        - Update includes new features added in a not backward-compatible way
1. 🚀 Push to GitHub, do GitHub `auto release notes`
1. 📦 Push  to NPM
    - Bash: `npm run publish`



## When to minor?
- `npm create solid` example for:
    - Basic
    - Mongoose
    - D1
    - Postgresql
    - SQLite
- Docs for
    - tailwind
    - node deploy
- Fundamental for
    - markdown create
    - markdown view


## When to 1.0?
- 100% test code coverage
- all component fundamentals are aria compliant
- No Github bugs exist that we'd love completed b4 1.0



## Readme purpose
- [ How to / Quick links to ] all possible



## What is the purpose of `"prepublishOnly": "npm run build",` in the package.json?
- NPM lifecycle hook ensures `npm publish` does an `npm run build` first automatically



## Why `"postbuild": "chmod +x dist/src/cli/cli.js || true",` in package.json?
- NPM lifecycle hook ensures windows quietly fails quietly & mac/linux runs chmod which adds the executable bit to the generated cli.js 


## Why is the `/dist` sent to NPM?
- This is the case @ `.npmignore` so all receive compiled code immediately with no extra steps required



## Why is `/dist` not sent to Github?
- This is the case @ `.gitignore` to simplify our git commits



## How to do fancy text in the terminal?
- [ANSI escape code generator](https://ansi.gabebanks.net/)


## Why `&& (chmod +x cli.js || true)`
- Ensure cli.js is always executable right after you build it
- ALL get a ready-to-run executable CLI 
- The || true allows us to gracefully skip on windows
- Windows doesn’t care about executable (+x) permissions like Linux or Mac does
