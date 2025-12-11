/**
 * 🚨 This file is imported into build.ts so the imports must be as slim as possible
 */


import { pathname2Segments } from './pathname2Segments.js'


/**
 * - Receives an array of routes
 * - Route `pathname` will be used to build the tree
 * - The leaf node of each route will be a `key` that identifies this route
 * - Route search speed is dependent on the number of segments in the requested URL
 * @param routes - Routes to place into the tree
 */
export function treeCreate(routes: TreeCreateRoute[]): TreeCreateNode {
  const root: TreeCreateNode = {}

  for (const props of routes) {
    let node: TreeCreateNode = root
    const segments = pathname2Segments(props.pathname)

    if (segments.length === 0) { // IF path is root THEN assign the key directly to the root node and skip traversal
      root.key = props.key
      continue
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment) continue

      const segmentName = segment[0]
      const isLast = i === segments.length - 1

      // path segment
      if (segment.length === 2) {
        const isOptional = segment[1] === 'o'
        
        if (!node.param) { // ensure param node exists
          node.param = { name: segmentName, node: {} }
        }

        if (isOptional && isLast) { // optional param → leaf on the *parent*
          node.key = props.key
        }

        if (!isOptional && isLast) { // required param → leaf on the param node itself
          node.param.node.key = props.key
        }

        node = node.param.node
        continue
      }

      // static segment
      if (!node.static) node.static = {}
      if (!node.static[segmentName]) node.static[segmentName] = {}

      node = node.static[segmentName]

      if (isLast) { // static final segment
        node.key = props.key
      }
    }
  }

  return root
}


/** Used w/in our route trees */
export type TreeCreateNode = {
  /** Helps identify this route */
  key?: string

  /** Checked first during traversal, identifies static path segments */
  static?: Record<string, TreeCreateNode>

  /** Checked second during traversal, identifies a parameter transition (ex: ':id', ':question') */
  param?: {
    name: string // The name of the parameter (ex: 'id')
    node: TreeCreateNode
  }
}


export type TreeCreateRoute = { key: string, pathname: string }
