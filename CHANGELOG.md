# Changelog
- All notable changes to `@acets-team/ace` will be documented here
- The format of this file is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- `@acets-team/ace` adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)


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



[0.6.0]: https://github.com/acets-team/ace/releases/tag/v0.6.0
