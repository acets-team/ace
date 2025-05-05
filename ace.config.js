// @ts-check 


/** @type {import('acets').AceConfig} */
export const config = {
  apiDir: './src/api',
  appDir: './src/app',
  logCaughtErrors: true,
  cookieKey: 'ace_cookie',
  sessionDataTTL: 1000 * 60 * 60 * 24 * 3, // 3 days in ms
  envs: [
    { name: 'local', url: 'http://localhost:3000' },
  ],
  plugins: {
    solid: true,
    valibot: true,
    mongoose: true,
  }
}


/** 
 * @typedef {Object} SessionData
 * @property {string} userId
 * @property {string} sessionId
 */
