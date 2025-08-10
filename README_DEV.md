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



## Readme purpose
- Descriptive code snippets
- Error dictionary
- FAQ



## What is the purpose of `"prepublishOnly": "npm run build",` in the package.json?
- NPM lifecycle hook ensures `npm publish` does an `npm run build` first automatically


## Why is the `/dist` sent to NPM?
- This is the case @ `.npmignore` so all receive compiled code immediately with no extra steps required


## Why is `/dist` not sent to Github?
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


# Redirects:
- Why Status code `200`?
    - If we use a 3xx response then `feFetch()` tries to do redirects so then it'll do a `fetch(`) for the next page which is wrong so this fools that
- Why Header name `Location`?
    - By using `Location` as the header name, `query()` actually handles server side redirects which is helpful
    - By putting the url in the header no json parsing is necessary
- `load()` flow w/ `spa` => `falsy` & url navigate
    - `query()` does the redirect server side
- `load()` flow w/ `spa` => `falsy` & link navigate ***OR*** `load()` flow w/ `spa` => `truthy` ***OR*** `onClick` => `apiX()`
    - `throw window.location.href` @ `feFetch()`
