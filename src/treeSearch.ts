import { TreeCreateNode } from './treeCreate'
import type { BasePathParams, TreeApiSearchResult } from './fundamentals/types'


export function treeSearch(tree: TreeCreateNode, pathname: string): undefined | TreeApiSearchResult {
  let node = tree
  const params: BasePathParams = {}
  const segments = pathname.split('/').filter(Boolean)

  for (const segment of segments) {
    if (node.static && node.static[segment]) { // static match
      node = node.static[segment]
      continue
    }

    if (node.param) { // param match
      const parent = node
      const child = node.param.node

      params[node.param.name] = segment // store param value

      node = child // go into param node

      if (child.key === undefined && parent.key !== undefined) { // handle optional param leaf fallback
        node = { key: parent.key, static: child.static, param: child.param }
      }

      continue
    }

    return undefined // no match
  }

  if (!node.key) return

  return { key: node.key, params }
}
