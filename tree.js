function _treeApiCreate(routes) {
  const root = {};

  for (const props of routes) {
    const segments = _pathnamename2Segments(props.pathname)
    // const segments = props.pathname.split('/').filter(Boolean);
    let node = root;

    if (segments.length === 0) { // IF path is root THEN assign the key directly to the root node and skip traversal
      root.key = props.key
      continue
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const segmentName = segment[0]

      // PARAM SEGMENT
      if (segment.length === 2) {
        const isOptional = segment[1] === 'o';
        // const name = isOptional ? segment.slice(1, -1) : segment.slice(1);

        // ensure param node exists
        if (!node.param) {
          node.param = { name: segmentName, node: {} };
        }

        // optional param → leaf on the *parent*
        if (isOptional && isLast) {
          node.key = props.key;
        }

        // required param → leaf on the param node itself
        if (!isOptional && isLast) {
          node.param.node.key = props.key;
        }

        node = node.param.node;
        continue;
      }

      // STATIC SEGMENT
      if (!node.static) node.static = {};
      if (!node.static[segmentName]) node.static[segmentName] = {};

      node = node.static[segmentName];

      // static final segment
      if (isLast) {
        node.key = props.key;
      }
    }
  }

  return root;
}


function _pathnamename2Segments(pathnamename) {
  const response = []
  const rawSegments = pathnamename.split('/').filter(Boolean)

  for (const rawSegment of rawSegments) {
    if (!rawSegment.startsWith(':')) response.push([rawSegment])
    else {
      const isOptional = rawSegment.endsWith('?')
      const paramName = isOptional ? rawSegment.slice(1, -1) : rawSegment.slice(1)
      const paramType = isOptional ? 'o' : 'r'

      response.push([paramName, paramType])
    }
  }

  return response
}



function _treeApiSearch(tree, pathnamename) {
  const parts = pathnamename.split('/').filter(Boolean);
  let node = tree;
  const params = {};

  for (const segment of parts) {
    // 1. STATIC MATCH
    if (node.static && node.static[segment]) {
      node = node.static[segment];
      continue;
    }

    // 2. PARAM MATCH
    if (node.param) {
      const parent = node;
      const child = node.param.node;

      // store param value
      params[node.param.name] = segment;

      // go into param node
      node = child;

      // handle optional param leaf fallback
      if (child.key === undefined && parent.key !== undefined) {
        node = { key: parent.key, static: child.static, param: child.param };
      }

      continue;
    }

    // 3. NO MATCH
    return undefined;
  }

  return { key: node.key, params };
}




const routes = [
  // { pathname: '/api/status/health', key: 'apiStatusHealth' },
  // { pathname: '/api/users/:id', key: 'apiUsersGet' },
  // { pathname: '/api/config/:key?', key: 'apiConfigGet' },
  // { pathname: '/api/posts/:id/comments/:commentId', key: 'apiPostCommentGet' },
  // { pathname: '/api/reports/:date/:format?', key: 'apiReportsGet' },
  // { pathname: '/api/admin/tools/:toolName/:action?', key: 'apiAdminTool' },
  // { pathname: '/api/a/:choice', key: 'apiPostA' },
  // { pathname: '/api/c/:mode?', key: 'apiPostC' },
  // { pathname: '/api/b/:mode', key: 'apiGetB' },

  { pathname: '/route/:id', key: '/route/:id' },
  { pathname: '/', key: '/' },
]

const tests = [
  ['/api/status/health', 'apiStatusHealth'],
  ['/api/users/123', 'apiUsersGet'],
  ['/api/config', 'apiConfigGet'],
  ['/api/config/theme', 'apiConfigGet'],
  ['/api/posts/55/comments/999', 'apiPostCommentGet'],
  ['/api/reports/2020-01-01', 'apiReportsGet'],
  ['/api/reports/2020-01-01/json', 'apiReportsGet'],
  ['/api/admin/tools/hydra', 'apiAdminTool'],
  ['/api/admin/tools/hydra/run', 'apiAdminTool'],
  ['/api/a/yes', 'apiPostA'],
  ['/api/c', 'apiPostC'],
  ['/api/c/auto', 'apiPostC'],
  ['/api/b/light', 'apiGetB'],
];

const tree = _treeApiCreate(routes)

console.log(
  JSON.stringify(tree, null, 2)
)

// for (const [pathname, expected] of tests) {
//   const result = _treeApiSearch(tree, pathname);
//   console.log(pathname, '→', result, result.key === expected ? '✓' : '❌ expected ' + expected);
// }