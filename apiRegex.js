// run: node script.js

const test = `import { exampleB4, testB4 } from './b4'
import { vParser, vNum, vDate, vBool, optional } from '../fundamentals/vParser'
import { createApi, ApiResolver, ApiInfo, ApiInfo2Req } from '../fundamentals/api'


export const info = new ApiInfo({ 
  method: 'POST',
  path: '/api/a/:choice',
  parser: vParser.api({
    body: { id: vNum() },
    searchParams: { sd: vDate() },
    pathParams: { choice: vBool() },
  })
})


export async function resolver(req: ApiInfo2Req<typeof info>) {
  'use server'

  return new ApiResolver(req)
    .b4([exampleB4, testB4])
    .res(async (scope) => {
      return scope.success({
        id: scope.body.id,
        sd: scope.searchParams.sd,
        locals: scope.event.locals,
        choice: scope.pathParams.choice,
      })
    })
}

export default createApi('apiPostA', info, resolver)
`;


function extractApiParts(source) {
  //
  // -------- Step 1: extract createApi(...) --------
  //
  const createApiRe =
    /export\s+default\s+createApi\s*\(\s*(?:(['"`])([^'"`]+)\1|([A-Za-z0-9_$\.]+))\s*,\s*([A-Za-z0-9_$\.]+)\s*,\s*([A-Za-z0-9_$\.]+)\s*\)/;

  const m = createApiRe.exec(source);
  if (!m) return null;

  const apiName = m[2] || m[3]; // string or identifier
  const infoName = m[4];
  const resolverName = m[5];

  //
  // -------- Step 2: extract method + path from ApiInfo(...) --------
  //
  // We capture:
  //   method: 'POST'
  //   path: '/api/...'
  //
  const infoRe = new RegExp(
    String.raw`export\s+const\s+` +
    infoName +
    String.raw`\s*=\s*new\s+ApiInfo\s*\(\s*\{\s*([^]*?)\}\s*\)`,
    "m"
  );

  const infoMatch = infoRe.exec(source);
  if (!infoMatch) return null;

  const objBlock = infoMatch[1]; // contents of { ... }

  // method: '<val>'
  const methodRe = /method\s*:\s*(['"`])([^'"`]+)\1/;
  const methodMatch = methodRe.exec(objBlock);
  if (!methodMatch) return null;
  const method = methodMatch[2];

  // path: '<val>'
  const pathRe = /path\s*:\s*(['"`])([^'"`]+)\1/;
  const pathMatch = pathRe.exec(objBlock);
  if (!pathMatch) return null;
  const pathname = pathMatch[2];

  return { apiName, infoName, resolverName, method, pathname };
}


// ------------------- TEST -------------------
console.log(extractApiParts(test));
