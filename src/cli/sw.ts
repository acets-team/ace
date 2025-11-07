import path, { join } from 'node:path'
import { cuteLog } from '../fundamentals/cuteLog.js'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'


/**
 * - Copy sw files to /public so we may import them
 * - Keep `app` version & `cache` version **aligned**
 * - Reads the `version` from `package.json` and adds it into `public/sw.js`
 * - Looks for a line in `sw.js` that starts w/ `const packageDotJsonVersion =` and adds the `version` there!
 * @param cwd The current working directory
 */
export async function sw(cwd: string) {
  // set paths
  const pdjPath = path.resolve(cwd, './package.json')
  const swPath = path.resolve(cwd, './public/sw.js')

  // read/parse package.json
  const pdjContent = await readFile(pdjPath, 'utf8')
  const pdj = JSON.parse(pdjContent)

  if (!pdj.version) throw new Error('Error: "version" field is missing in package.json')

  const packageDotJsonVersion = String(pdj.version)

  // read sw.js
  let content = await readFile(swPath, 'utf8')

  if (!content.includes('const packageDotJsonVersion =')) throw new Error('Error: @ public/sw.js this line was not found "const packageDotJsonVersion =" this helps us keep the app version & cache version aligned')

  // replace the line starting with 'const packageDotJsonVersion ='
  const newContent = content.replace(
    /^const packageDotJsonVersion = .*$/m,
    `const packageDotJsonVersion = '${packageDotJsonVersion}'`
  )

  const dirPublicAce = join(cwd, 'public/.ace')
  const dirWriteFundamentals = join(cwd, '.ace/fundamentals')

  await Promise.all([
    writeFile(swPath, newContent, 'utf8'),  // write sw.js
    mkdir(dirPublicAce, { recursive: true }), // create public/.ace
  ])

  await copyFile(join(dirWriteFundamentals, 'swAddOffLineSupport.js'), join(dirPublicAce, 'swAddOffLineSupport.js'))

  cuteLog('🎉 Wrote: /public/sw.js', 'bold', 'green')
}
