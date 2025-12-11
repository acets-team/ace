/**
 * @typedef {Array<string | ('r' | 'o')>} SegmentConfigItem - [staticValue] or [paramName, 'r' | 'o']
 */

/**
 * @typedef {Object} UrlBuilder
 * @property {(util: Function, pathParams: Record<string, any>, searchParams: Record<string, any>) => string} buildFn - The executable path construction function (for testing).
 * @property {string} buildStr - The raw JavaScript function body string containing the path construction logic (for file writing).
 * @property {string[]} requiredParams - An array of parameter names that must be provided.
 */

/**
 * Common utility function to handle path segment replacement and search parameter appending.
 * This function is now highly optimized to iterate over a pre-parsed segment configuration array.
 *
 * @param {Object} props - Arguments object.
 * @param {string} props.path - The original Hono-style path string (used only for error messages).
 * @param {SegmentConfigItem[]} props.segments - The pre-parsed array of path segments in the new format.
 * @param {Record<string, any>} props.params - Path parameters object.
 * @param {Record<string, any>} props.search - Search parameters object.
 * @returns {string} The fully constructed URL.
 */
function _buildUrl(props) {
  let pathResult = "";

  for (const segment of props.segments) {
    const segmentName = segment[0];
    const segmentType = segment.length > 1 ? segment[1] : 's'; // 's' for static

    if (segmentType === 's') {
      // Static segment
      pathResult += '/' + segmentName;
    } else {
      // Parameter segment ('r' or 'o')
      const paramName = segmentName;
      const isOptional = segmentType === 'o';
      const paramValue = props.params[paramName];

      if (segmentType === 'r' && (paramValue === undefined || paramValue === null)) {
        // Required parameter validation
        throw new Error(`Missing required parameter: "${paramName}" for path: ${props.path}`);
      }

      // Append value only if it exists (handles optional missing params by skipping the segment)
      if (paramValue !== undefined && paramValue !== null) {
        pathResult += '/' + paramValue;
      }
    }
  }

  // Final path cleanup
  if (pathResult === '') pathResult = '/';

  // Append Search Parameters
  if (props.search && Object.keys(props.search).length > 0) {
    const urlSearchParams = new URLSearchParams();
    for (const key in props.search) {
      const value = props.search[key];
      // Only include if value is not null or undefined
      if (value !== undefined && value !== null) {
        urlSearchParams.append(key, String(value));
      }
    }
    const searchString = urlSearchParams.toString();
    if (searchString) {
      pathResult += '?' + searchString;
    }
  }

  return pathResult;
}

/**
 * Parses a Hono-style path string and generates the optimized components 
 * needed for high-speed URL construction.
 *
 * @param {string} path The Hono-style pathname (e.g., "/posts/:category/:id?").
 * @returns {UrlBuilder} An object containing the build function, its string representation, and required parameters.
 */
function createUrlBuilder(path) {
  const rawSegments = path.split('/').filter(Boolean);
  const requiredParams = [];
  const segmentConfig = [];

  for (const rawSegment of rawSegments) {
    if (rawSegment.startsWith(':')) {
      const isOptional = rawSegment.endsWith('?');
      const paramName = isOptional ? rawSegment.slice(1, -1) : rawSegment.slice(1);
      const paramType = isOptional ? 'o' : 'r';

      // New format: ['name', 'r'|'o']
      segmentConfig.push([paramName, paramType]);

      if (!isOptional) {
        requiredParams.push(paramName);
      }
    } else {
      // New format: ['staticValue']
      segmentConfig.push([rawSegment]);
    }
  }

  // --- 1. Create the lean buildStr (for file writing) ---
  // The generated function assumes the utility function is passed as the first argument, named __urlFormatUtil.
  const serializedSegmentConfig = JSON.stringify(segmentConfig);

  // The generated function passes arguments inside a single object (matching the new buildUrl signature)
  const buildStr = `return __urlFormatUtil({ path: "${path}", segments: ${serializedSegmentConfig}, params: pathParams, search: searchParams });`;

  // --- 2. Create buildFn (for testing) ---
  // The signature must explicitly include the utility function as the first argument.
  const buildFn = new Function('__urlFormatUtil', 'pathParams', 'searchParams', buildStr);

  return {
    buildFn,
    buildStr,
    requiredParams
  };
}

// ------------------------------------
// --- Test Cases ---
// ------------------------------------

const pathsToTest = [
  // 1. Required only
  '/users/:id/profile',
  // 2. Optional only
  '/assets/:type?',
  // 3. Mixed, optional at the end
  '/api/v1/:resource/:id?',
  // 4. Mixed, optional in the middle (most complex cleanup scenario)
  '/docs/:lang?/guide/:version',
  // 5. Root path with optional segment
  '/:page?',

  '/api/a/:choice',
  '/api/b/:mode',
  '/api/c/:mode?',
  '/a:id',
  '/posts/:category/:id?',
];

console.log('--- URL Builder Factory Tests ---');

for (const path of pathsToTest) {
  console.log(`\nPath: ${path}`);
  const result = createUrlBuilder(path);

  console.log(`  Required Params: [${result.requiredParams.join(', ')}]`);

  // Log the generated function body string for verification
  console.log(`\n  --- Generated buildStr (Optimized) ---`);
  console.log(`
function buildUrl(__urlFormatUtil, pathParams, searchParams) {
  ${result.buildStr}
}
  `);

  // Test the executable function (buildFn)

  let testParams = {};
  let testSearchParams = { token: 'xyz', count: 10 };

  // NOTE: We pass the actual buildUrl function as the utility argument to the generated function.

  if (path === '/users/:id/profile') {
    testParams = { id: 123 };
    console.log(`  Test (Required + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /users/123/profile?token=xyz&count=10
    try {
      // Missing pathParams
      result.buildFn(buildUrl, {}, {});
    } catch (e) {
      // FIX: Logging the full error message for clarity
      console.log(`  Test (Missing Required): Error caught: ${e.message}`);
    }
  }

  // NEW TEST CASE ADDED FOR COVERAGE
  if (path === '/assets/:type?') {
    testParams = { type: 'images' };
    console.log(`  Test (Optional Present + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /assets/images?token=xyz&count=10
    testParams = {};
    console.log(`  Test (Optional Missing + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /assets?token=xyz&count=10
  }

  if (path === '/api/v1/:resource/:id?') {
    testParams = { resource: 'products', id: 456 };
    console.log(`  Test (All Params + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /api/v1/products/456?token=xyz&count=10
    testParams = { resource: 'products' };
    console.log(`  Test (Missing Optional + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /api/v1/products?token=xyz&count=10

    // NEW TEST CASE ADDED FOR COVERAGE
    try {
      // Missing required 'resource'
      result.buildFn(buildUrl, {}, {});
    } catch (e) {
      console.log(`  Test (Missing Required): Error caught: ${e.message}`);
    }
  }

  if (path === '/docs/:lang?/guide/:version') {
    testParams = { lang: 'en', version: 'v2' };
    console.log(`  Test (All Params + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /docs/en/guide/v2?token=xyz&count=10
    testParams = { version: 'v2' };
    console.log(`  Test (Missing Optional + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /docs/guide/v2?token=xyz&count=10
  }

  if (path === '/:page?') {
    testParams = {};
    console.log(`  Test (Optional Missing + Search): ${result.buildFn(buildUrl, testParams, testSearchParams)}`);
    // Expected: /?token=xyz&count=10
  }
}