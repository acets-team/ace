# Radix Tree

## What is it?
- A data structure
- Stores shared segments of a route only once
    ```pgsql
        api
        / \
     user  admin
    ```



## Nodes
- Tree (internal) node
    - A node that does NOT store an `apiName`
    - Has children nodes
    - Example: `/api`
- Leaf node
    - A node that DOES store an `apiName`
    - Represents a complete route
    - May or may not have children nodes
- Example: 
    - `/api/user` is a `leaf` node for the `first` route
    - `/api/user` is a `tree` for the `second` route
      ```bash
      /api/user
      /api/user/:id
      ```



## Time Complexity:
- `O(K)`
    - `K` -> Number of path segments
    - So routing speed is dependent on the number of segments in the requested URL



## Plan
1. `regexApiNames` is renamed to `radixMap`
1. `radixMap` drops `pattern` but keeps `{ api, info, resolver }`
    ```ts
    export type RadixMapEntry = {
      api: () => Promise<unknown>,
      info: () => Promise<ApiInfo>,
      resolver: () => Promise<ApiResolverFn<any, any, any>>,
    }

    export const radixMap: Record<string, RadixMapEntry> = {
      'apiPostA': {
        api: () => import('../api/a').then((m) => m.apiPostA),
        info: () => import('../api/a').then((m) => m.apiPostAInfo),
        resolver: () => import('../api/a').then((m) => m.apiPostAResolver),
      },
      'apiGetB': {
        api: () => import('../api/b').then((m) => m.apiGetB),
        info: () => import('../api/b').then((m) => m.apiGetBInfo),
        resolver: () => import('../api/b').then((m) => m.apiGetBResolver),
      },
    } as const;
    ```
1. Types:
    ```ts
    /** Stores an apiName */
    export type RadixLeafNode = keyof typeof radixMap


    /** Does NOT store an apiName */
    export type RadixTreeNode = {
      
      /**
      * Optional: Stores the RadixLeafNode (apiName) if this node 
      * represents a complete, valid route path (ex: for optional parameters case)
      */
      leafNode?: RadixLeafNode;

      /**
      * Maps static path segments (e.g., 'api', 'users') to the next node.
      * This is checked first during traversal.
      */
      static?: Record<string, RadixTreeNode>;

      /**
      * Defines a parameter transition rule (e.g., ':id', ':question').
      * This is checked second during traversal
      */
      param?: {
        name: string; // The name of the parameter (e.g., 'id')
        treeNode: RadixTreeNode;
      };
    }
    ```
1. Turn routes into static parameter segments
    - `/api/status/health`
    - `/api/users/:id`
    - `/api/config/:key?`
    - `/api/posts/:id/comments/:commentId`
    - `/api/reports/:date/:format?`
    - `/api/admin/tools/:toolName/:action?`
    - Ace will remove the `/api` prefix & pass only the remaining path
      ```ts
      import { RadixTreeNode, RadixLeafNode } from './radixTree';

      // The final radix tree for GET requests
      export const radixGET: RadixTreeNode = {
        static: {
          
          // 1. Static Only: /status/health
          'status': {
            static: {
              'health': {
                leafNode: 'apiStatusHealth', // <-- Terminal node (string)
              },
            },
          },
          
          // 2. Required Param: /users/:id
          'users': {
            param: {
              name: 'id',
              treeNode: {
                leafNode: 'apiUsersGet', // <-- Terminal node after /:id
              },
            },
          },
          
          // 3. Optional Param: /config/:key?
          'config': {
            // Path: /config (key is omitted)
            leafNode: 'apiConfigGet', 
            
            param: {
              name: 'key',
              treeNode: {
                // Path: /config/VALUE (key is present)
                leafNode: 'apiConfigGet', 
              },
            },
          },
          
          // 4. Required + Required: /posts/:id/comments/:commentId
          'posts': {
            param: {
              name: 'id',
              treeNode: {
                static: {
                  'comments': {
                    param: {
                      name: 'commentId',
                      treeNode: {
                        leafNode: 'apiPostCommentGet', // <-- Terminal node
                      },
                    },
                  },
                },
              },
            },
          },
          
          // 5. Required + Optional: /reports/:date/:format?
          'reports': {
            param: {
              name: 'date', // REQUIRED PARAM
              treeNode: {
                // Path: /reports/2023-12-01 (format is omitted)
                leafNode: 'apiReportsGet', 
                
                param: {
                  name: 'format', // OPTIONAL PARAM
                  treeNode: {
                    // Path: /reports/2023-12-01/json (format is present)
                    leafNode: 'apiReportsGet', // <-- Terminal node
                  },
                },
              },
            },
          },
          
          // 6. Static + Required + Optional: /admin/tools/:toolName/:action?
          'admin': {
            static: {
              'tools': {
                param: {
                  name: 'toolName', // REQUIRED PARAM
                  treeNode: {
                    // Path: /admin/tools/database (action is omitted)
                    leafNode: 'apiAdminTool', 
                    
                    param: {
                      name: 'action', // OPTIONAL PARAM
                      treeNode: {
                        // Path: /admin/tools/database/backup (action is present)
                        leafNode: 'apiAdminTool', // <-- Terminal node
                      },
                    },
                  },
                },
              },
            },
          },
          
        }
      }
      ```
1. Insert segments into 4 trees, one for each method
    - `radixGET`
    - `radixPOST`
    - `radixPUT`
    - `radixDELETE`
1. `[...api.].ts` still has a function for each method ex:
    ```ts
    export async function PUT(event: APIEvent) {
      'use server'
      return await onAPIEvent(event, radixPUT)
    }
    ```
1. `onAPIEvent` -> Walk the tree
    - When we know the apiName from the tree we get the `{ api, info, resolver }`
