// @ts-check 


/** @type {import('acets').AceConfig} */
export const config = {
  apiDir: './src/api',
  appDir: './src/app',
  logCaughtErrors: true,
  origins: {
    local: 'http://localhost:3000'
  },
  plugins: {
    solid: true,
    turso: true,
    valibot: true,
  }
}
