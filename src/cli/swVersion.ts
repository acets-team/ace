import path from 'node:path'
import { cuteLog } from '../fundamentals/cuteLog.js'
import { readFile, writeFile } from 'node:fs/promises'


/**
 * - Keep `app` version & `cache` version **aligned**
 * - Reads the `version` from `package.json` and adds it into p`ublic/sw.js`
 * - Looks for a line in `sw.js` that starts w/ `const packageDotJsonVersion =` and adds the `version` there!
 * @param cwd The current working directory
 */
export async function swVersion(cwd: string) {
  // set paths
  const pdjPath = path.resolve(cwd, './package.json')
  const swPath = path.resolve(cwd, './public/sw.js')

  // read/parse package.json
  const pdjContent = await readFile(pdjPath, 'utf8')
  const pdj = JSON.parse(pdjContent)

  if (!pdj.version) throw new Error('Error: "version" field is missing in package.json')

  const version = String(pdj.version)

  // read sw.js
  let content = await readFile(swPath, 'utf8')

  // replace the line starting with 'const packageDotJsonVersion ='
  const newContent = content.replace(
    /^const packageDotJsonVersion = .*$/m,
    `const packageDotJsonVersion = '${version}'`
  )

  // write sw.js
  await writeFile(swPath, newContent, 'utf8')

  cuteLog('🎉 Wrote: /public/sw.js', 'bold', 'green')
}
