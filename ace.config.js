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
    mongoose: true,
  }
}


/** 
 * @typedef {Object} JWTPayload
 * @property {number} sessionId
 */


/** 
 * @typedef {Object} JWTResponse
 * @property {number} sessionId
 * @property {number} userId
 * @property {boolean} isAdmin
 * @property {string} name
 */
