// https://www.npmjs.com/package/@highlightjs/cdn-assets?activeTab=code
// https://github.com/highlightjs/highlight.js/issues/4116
// https://github.com/highlightjs/highlight.js/issues/3295

declare module '@highlightjs/cdn-assets/es/core.min.js' {
  import type { HLJSApi, LanguageFn } from 'highlight.js'
  const hljs: HLJSApi; export default hljs;
}

declare module '@highlightjs/cdn-assets/es/languages/go.min.js' {
  const go: LanguageFn; export default go;
}

declare module '@highlightjs/cdn-assets/es/languages/css.min.js' {
  const css: LanguageFn; export default css;
}

declare module '@highlightjs/cdn-assets/es/languages/php.min.js' {
  const php: LanguageFn; export default php;
}

declare module '@highlightjs/cdn-assets/es/languages/sql.min.js' {
  const sql: LanguageFn; export default sql;
}

declare module '@highlightjs/cdn-assets/es/languages/xml.min.js' {
  const xml: LanguageFn; export default xml;
}

declare module '@highlightjs/cdn-assets/es/languages/bash.min.js' {
  const bash: LanguageFn; export default bash;
}

declare module '@highlightjs/cdn-assets/es/languages/dart.min.js' {
  const dart: LanguageFn; export default dart;
}

declare module '@highlightjs/cdn-assets/es/languages/java.min.js' {
  const java: LanguageFn; export default java;
}

declare module '@highlightjs/cdn-assets/es/languages/http.min.js' {
  const http: LanguageFn; export default http;
}

declare module '@highlightjs/cdn-assets/es/languages/json.min.js' {
  const json: LanguageFn; export default json;
}

declare module '@highlightjs/cdn-assets/es/languages/scss.min.js' {
  const scss: LanguageFn; export default scss;
}

declare module '@highlightjs/cdn-assets/es/languages/wasm.min.js' {
  const wasm: LanguageFn; export default wasm;
}

declare module '@highlightjs/cdn-assets/es/languages/yaml.min.js' {
  const yaml: LanguageFn; export default yaml;
}

declare module '@highlightjs/cdn-assets/es/languages/swift.min.js' {
  const swift: LanguageFn; export default swift;
}

declare module '@highlightjs/cdn-assets/es/languages/graphql.min.js' {
  const graphql: LanguageFn; export default graphql;
}

declare module '@highlightjs/cdn-assets/es/languages/dockerfile.min.js' {
  const dockerfile: LanguageFn; export default dockerfile;
}

declare module '@highlightjs/cdn-assets/es/languages/javascript.min.js' {
  const javascript: LanguageFn; export default javascript;
}

declare module '@highlightjs/cdn-assets/es/languages/typescript.min.js' {
  const typescript: LanguageFn; export default typescript;
}
