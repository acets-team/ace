// https://www.npmjs.com/package/@highlightjs/cdn-assets?activeTab=code
// https://github.com/highlightjs/highlight.js/issues/4116
// https://raw.githubusercontent.com/highlightjs/highlight.js/refs/heads/main/types/index.d.ts

declare module '@highlightjs/cdn-assets/es/core.min.js' {
  import type { HLJSApi } from "highlight.js";
  const hljs: HLJSApi;
  export default hljs;
}

declare module '@highlightjs/cdn-assets/es/languages/bash.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/css.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/dart.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/dockerfile.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/go.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/graphql.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/http.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/java.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/javascript.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/json.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/php.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/scss.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/sql.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/swift.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/typescript.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/wasm.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/xml.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}

declare module '@highlightjs/cdn-assets/es/languages/yaml.min.js' {
  import type { LanguageFn } from 'highlight.js'
  const lang: LanguageFn; export default lang;
}
