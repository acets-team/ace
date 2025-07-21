// @ts-check 


/** @type {import('acets').AceConfig} */
export const config = {
  apiDir: './src/api',
  appDir: './src/app',
  logCaughtErrors: true,
  plugins: {
    solid: true,
    turso: true,
    valibot: true,
  }
}
