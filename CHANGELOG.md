# Changelog
- All notable changes to `@acets-team/ace` will be documented here
- The format of this file is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- & `@acets-team/ace` adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)



## [0.9.4] - 2025-11-11

### 🐛 Fixed
- Fixed: `Cannot set headers after they are sent to the client`



## [0.9.3] - 2025-11-11

### 🐛 Fixed
- Page flicker of unstyled page when using `ace sw`



## [0.9.2] - 2025-11-11

### 🧠 Improved
- Added important / missing items about `hljs` to `README.md`



## [0.9.1] - 2025-11-11

### 🐛 Fixed
- IF using the `hljs` plugin AND running `npm run typesafe` THEN typesafety errors



## [0.9.0] - 2025-11-11

### ✨ Added
- `<AceMarkdown />`

### 🧠 Improved
- `ScopeBE > resolve()` is no longer required to be an `async` function
- Renamed the `options` prop to `markdownItOptions` @ `MarkdownItStatic` & `MarkdownItDynamic`
- Added `--ace-toast-box-shadow` @ toast css variables

### 🗑️ Removed
- Removed `--ace-toast-border-color` & added `--ace-toast-border` @ toast css variables
- Removed `smoothFor.scrollParentToBottom()` & added `smoothFor.scrollParent('top' | 'bottom')`
- Removed `smoothFor.postSync({ scrollParentToBottom: boolean })` & added `smoothFor.postSync({ scrollParent: 'top' | 'bottom' })`



## [0.8.1] - 2025-11-08

### 🐛 Fixed
- IF in production, a `/subscribe` to `Ace Live Server` throws an error b/c `wss` is not enabled yet



## [0.8.0] - 2025-11-08

### 🗑️ Removed
- Removed `reQuery()` in favor of `Echo`

### 🐛 Fixed
- `npm error You cannot publish over the previously published versions:`
- IF sending `/event` to `Ace Live Server` on localhost THEN `fetch failed`



## [0.7.3] - 2025-11-07

### 🧠 Improved
- `README.md`, `DEVELOPMENT.md` & `JSDoc` comments

### 🐛 Fixed
- `Ace Live Server` crashes on init w/ the following error: `!build.fsEnv`



## [0.7.2] - 2025-11-07

### 🧠 Improved
- `README.md` docs



## [0.7.1] - 2025-11-06

### 🧠 Improved
- Inline `sw.styles.css` and `swRegister.js` @ `src/entry-server.tsx` for optimal Lighthouse score
- Now `@ace` import can have a `?raw` at the end and work to get the raw file string

### 🗑️ Removed
- Removed `sw.styles.css` AND `sw.styles.css` from `/public/.ace` b/c we can get then `?raw` from `@ace` now



## [0.7.0] - 2025-11-06

### 🧠 Improved
- Send `options={{ highlight: hljsMarkdownItOptions }}` to `MarkdownIt` components if highlight options are desired

### 🐛 Fixed
- IF `queryType` is `maySetCookies` THEN hydration error
- IF the `hljs plugin` is not `true` THEN `MarkdownIt` components error
- IF `<Loading />` is passed `style` options @ `$span` THEN we ignore them

### 🗑️ Removed
- `@ace/hljsMarkdownIt` is now @ `@ace/hljsMarkdownItOptions`



## [0.6.7] - 2025-11-06

### 🧠 Improved
- Improved `README.md` & `JSDoc` comments
- Added `ScopeComponent.liveUnsubscribe()`
- Add `createAsyncOptions` to `Api Functions` & merge whatever is provided w/ `defaultCreateAsyncOptions`



## [0.6.6] - 2025-11-06

### 🧠 Improved
- `README.md` docs



## [0.6.5] - 2025-11-05

### 🧠 Improved
- `README.md` docs



## [0.6.4] - 2025-11-05

### 🧠 Improved
- `README.md` docs



## [0.6.3] - 2025-11-05

### 🧠 Improved
- Don't call API Function callbacks server side

### 🐛 Fixed
- `API Function` > `innerQuery()` throws undefined error when accessing `this`



## [0.6.2] - 2025-11-05

### 🧠 Improved
- Simplified + Optimized API Function logic

### 🐛 Fixed
- IF API Function is using `stream` > on first refresh, callbacks don't happen



## [0.6.1] - 2025-11-04

### 🧠 Improved
- Update the package.json versions @:
    - `@types/node` 
    - `ag-grid-community` 
    - `chart.js` 
    - `drizzle-orm` 
    - `solid-js` 
    - `wrangler` 
- Improve the `DEVELOPMENT.md` directions @:
    - How to deploy?
    - Unlink ace



## [0.6.0] - 2025-11-04

### ✨ Added
- `<MarkdownStatic />` for SEO friendly `Markdown`
- **Ace Live Server** + `ScopeBE.liveEvent()` + `ScopeComponent.liveSubscribe()`
- Option for `liveHosts` @ `ace.config.js`
- Added `@ace/vanilla` for types that are necessary for `vanilla` fundamentals like `jwtCreate()` b/c `@ace/types` is only available w/ the `solid` plugin
- Add `defaultError` support @ `ace.config.js`
- Add `defaultMessageName` support @ `ace.config.js`
- `@ace/createApiUrl`
- Add `@ace/hljs/[language]` for 19 languages
- Added `CHANGELOG.md`


### 🧠 Improved
- Add support for connecting to a local database @ `@ace/tursoConnect()`
- Add support for `<Pulse />` > `delay`
- Add support for a dot @ `<RadioCards />`
- For API functions: `onData()` & `onGood()` to `onSuccess()`
- Move `date`, `jwt`, `ms` & `hash` fundamentals to the `vanilla` plugin
- Default `useStore()` > `sync()` > `key` to `id`
- Default `useStore()` > `sync()` > `merge` to `true`
- Rename `--ace-radio-card-active-bg-color` to `--ace-radio-card-active-bg` & update the style from `background-color` to `background` to support more options like gradients
- Rename `ScopeBE` > `origin` to `requestUrlOrigin`
- Rename `@ace/env` > `origin` to `buildOrigin`
- Rename `@ace/env` > `origins` to `configOrigins`
- Rename `queryAgain()` to `reQuery()`
- Rename `feMessages` to `ScopeComponentMessages`
- Rename `highlightJs` plugin to `hljs`
- Renamed `README_DEV.md` to `DEVELOPMENT.md` and improved docs on how to deploy


### 🐛 Fixed
- `<Loading />` is not showing 2 colors when requested
- `onSuccess()` called twice during `queryType: stream`
- IF our component has a class & the `$div` prop has a class THEN the classes are not merged


### 🗑️ Removed
- Remove `fadeInOnMount()` fundamental b/c `sw` does this by default



---



[0.9.4]: https://github.com/acets-team/ace/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/acets-team/ace/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/acets-team/ace/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/acets-team/ace/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/acets-team/ace/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/acets-team/ace/compare/v0.8.0...v0.8.1
[0.8.1]: https://github.com/acets-team/ace/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/acets-team/ace/compare/v0.7.2...v0.8.0
[0.7.3]: https://github.com/acets-team/ace/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/acets-team/ace/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/acets-team/ace/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/acets-team/ace/compare/v0.6.7...v0.7.0
[0.6.7]: https://github.com/acets-team/ace/compare/v0.6.6...v0.6.7
[0.6.6]: https://github.com/acets-team/ace/compare/v0.6.5...v0.6.6
[0.6.5]: https://github.com/acets-team/ace/compare/v0.6.4...v0.6.5
[0.6.4]: https://github.com/acets-team/ace/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/acets-team/ace/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/acets-team/ace/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/acets-team/ace/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/acets-team/ace/releases/tag/v0.6.0
