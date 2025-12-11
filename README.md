![Ace Website Framework](https://i.imgur.com/cNfquMD.png)



## Table of Contents
1. [What is Ace?](#what-is-ace)
1. [Ace Mission Statement](#ace-mission-statement)
1. [Create Ace App](#create-ace-app)
1. [Save state to indexdb](#save-state-to-indexdb)
1. [Create API Route](#create-api-route)
1. [Create Middleware](#create-api-route)
1. [Path and Search Params](#path-and-search-params)
1. [Parser](#parser)
1. [Create a Layout](#create-a-layout)
1. [Create a Route](#create-a-route)
1. [Call APIs](#call-apis)
1. [🙌 VS Code Extension](#vs-code-extension)
1. [Echo](#echo)
1. [Breakpoints](#breakpoints)
1. [Scope](#scope)
1. [Create a 404 Route](#create-a-404-route)
1. [Create a Typesafe Anchor](#create-a-typesafe-anchor)
1. [Typesafe Redirects](#typesafe-redirects)
1. [Add Offline Support](#add-offline-support)
1. [Network Status Hook](#network-status-hook)
1. [👩‍💻 Create Desktop Application](#create-desktop-application)
1. [Enums](#enums)
1. [Markdown](#markdown)
1. [Code Highlight Markdown](#code-highlight-markdown)
1. [Bits](#bits)
1. [Modal Demo](#modal-demo)
1. [🛠️ Bind DOM Elements](#bind-dom-elements)
1. [Form Demo](#form-demo)
1. [Magic Link Demo](#magic-link-demo)
1. [Create Password Hash](#create-password-hash)
1. [🟢 Live Data without Browser Refresh](#live-data-without-browser-refresh)
1. [Open Graph Demo](#open-graph-demo)
1. [SVG Demo](#svg-demo)
1. [Add Custom Fonts](#add-custom-fonts)
1. [Loading Spinner Component](#loading-spinner-component)
1. [Show Toast Notifications](#show-toast-notifications)
1. [Tabs Component](#tabs-component)
1. [Radio Cards Component](#radio-cards-component)
1. [Slidshow Component](#tabs-component)
1. [Ace Config](#ace-config)
1. [Ace Plugins](#ace-plugins)
1. [🚨 When to restart dev?](#when-to-restart-dev)
1. [IF developing multiple Ace projects simultaneously](#if-developing-multiple-ace-projects-simultaneously)
1. [Environment Variables](#environment-variables)
1. [Environment Information](#environment-information)
1. [Origin Information](#origin-information)
1. [Add Tailwind](#add-tailwind)
1. [Turso Demo](#turso-demo)
1. [AgGrid Demo](#aggrid-demo)
1. [Chart.js Demo](#chartjs-demo)
1. [Send Brevo Emails](#send-brevo-emails)
1. [🚀 Deploy](#deploy)
1. [Add a custom domain](#add-a-custom-domain)
1. [Resolve www DNS](#resolve-www-dns)
1. [View Production Logs](#view-production-logs)
1. [VS Code Helpful Info](#vs-code-helpful-info)
1. [Error Dictionary](#error-dictionary)



## What is Ace?
- Ace is a set of functions, classes, and types (**fundamentals**) to aid web developers. We’ve grouped these fundamentals into **plugins**. To use a plugins fundamentals, set that plugin to **true** in your [`ace.config.js`](#ace-config)! 🙏
- [**Ace plugins:**](#ace-plugins)
  1. **[Solid](https://docs.solidjs.com/)** (optimal DOM updates)
  1. **[Drizzle](https://orm.drizzle.team/)** (type-safe db updates)
  1. **[Turso](https://turso.tech/)** (Fast SQL DB)
  1. **[Cloudflare](https://www.cloudflare.com/)** (Region: Earth)
  1. **[AgGrid](https://www.ag-grid.com/)** (Scrollable, filterable & sortable tables)
  1. **[Charts.js](https://www.chartjs.org/)** (Evergreen charting library)
  1. **[Valibot](https://valibot.dev/guides/comparison/)** (Small bundle Zod)
  1. **[Brevo](https://www.brevo.com/)** (300 emails a day for free)
  1. **[Markdown-It](https://markdown-it.github.io/markdown-it/)** (Markdown to HTML)
  1. **[Highlight.js](https://github.com/highlightjs/highlight.js)** (Highlight code in Markdown)



## Ace Mission Statement
**🌎 Unite industry leaders, to provide optimal web fundamentals, in a performant, type-safe and beautifully documented library! 🙏**



## Create Ace App!
- Bash:
    ```bash
    npx create-ace-app@latest
    ```
- 🚨 When opening `Create Ace App` **locally** for the first time after an `npm run dev`, it will take 10-15 seconds to load 😡 b/c Vite is altering code to optimize [`HMR`](https://vite.dev/guide/features#hot-module-replacement) (so subsequent loads are instant 🤓) BUT this slow initial load is **no factor** in production. To prove this, here's [Create Ace App In Production](https://create-ace-app.jquery-ssr.workers.dev)! 🚀 Deployed to Cloudflare Workers via `git push`, deploy directions [here](#deploy)!
    ![Create Ace App in Production](https://i.imgur.com/UcfHhXh.jpeg)



## Save state to indexdb
- ✅ With Ace each piece of state is called an `Atom`
- ✅ Atoms are saved @ `memory`, `session storage`, `local storage` (5mb + sync) or `indexdb` (100's of mb's + async)
- ✅ An Atom's `is` prop helps us know how to serialize to and deserialze from the save location
- ✅ Setting custom `onSerialize` / `onDeserialze` @ `new Atom()` is avaialble!

1. Define atoms: `src/store/atoms.ts`
    ```ts
    // Create Ace App's atoms

    
    import { Atom } from '@ace/atom'
    import type { ApiName2Data, ChartJsMap } from '@ace/types'
    import type { FinanceSummary, Transaction, ChatMessage } from '@src/lib/types'


    export const atoms = {
      count: new Atom({ save: 'idb', is: 'number', init: 0 }),
      chatMessage: new Atom({ save: 'idb', is: 'string', init: '' }),
      chatMessages: new Atom<ChatMessage[]>({ save: 'idb', is: 'json', init: [] }),
      transactions: new Atom<Transaction[]>({ save: 'idb', is: 'json', init: [] }),
      financeCategories: new Atom<ChartJsMap[]>({ save: 'idb', is: 'json', init: [] }),
      financeSummary: new Atom<undefined | FinanceSummary>({ save: 'idb', is: 'json' }),
      fortunes: new Atom<ApiName2Data<'apiGetFortune'>[]>({ save: 'idb', is: 'json', init: [] }),
    }
    ```
1. Create a Store: `src/store/store.ts`
    ```ts
    // To work w/ atoms we put them into a store via createStore() and then get back a useStore() function that can be used in component, route or layout
    // Multiple stores is simple but probably not necessary


    import { atoms } from './atoms'
    import { createMemo } from 'solid-js'
    import { Atoms2Store } from '@ace/types'
    import { createStore } from '@ace/createStore'


    export const { useStore, StoreProvider } = createStore({ atoms })
    ```
1. Wrap `<App/>` with `<StoreProvider/>` @ `src/app.tsx`
    ```ts
    // createApp() will generate all our <Route />'s for us and wrap them w/ the providers in the provided array :)
  
    import './app.css'
    import '@ace/tabs.styles.css'
    import '@ace/toast.styles.css'
    import '@ace/pulse.styles.css'
    import '@ace/loading.styles.css'
    import '@ace/tooltip.styles.css'
    import { createApp } from '@ace/createApp'
    import { StoreProvider } from '@src/store/store'

    export default createApp([StoreProvider])
    ```
1. `useStore()` has lots of lovely goodies including:
    - `store`
        - [Solid's store](https://docs.solidjs.com/concepts/stores) is the accessor to all our store values
        - Each `Atom` is added into the store and is accessible via it's `key`. So based on the example atoms above, we can access:
            - `store.count`
            - `store.newsletterForm.name`
    - `setStore()`
        - [Solid's setStore()](https://docs.solidjs.com/concepts/stores) helps us to assign store value, examples:
          - `setStore('count', 1)`
          - `setStore('count', c => c + 1)`
          - `setStore('newsletterForm', 'name', 'Chris')`
          - `setStore('newsletterForm', {name: 'Chris', email: 'chris@gmail.com'})`
    - `save()`
        - Accepts a store key, and will `save` to the Atom's save location, example:
            - `save('count')`
            - `save('newsletterForm')`
    - `set()`
        - Calls [Solid setStore()](https://docs.solidjs.com/concepts/stores) and then calls `save()`, examples:
            - `set('count', 1)`
            - `set('count', c => c + 1)`
            - `set('newsletterForm', 'name', 'Chris')`
            - `set('newsletterForm', {name: 'Chris', email: 'chris@gmail.com'})`
    - `copy()`
        - Calls [Solid's produce()](https://docs.solidjs.com/concepts/stores) which lets us mutate a copy/draft of the data inside a single callback and then calls `save()`, examples:
          ```ts
          copy('user', u => {
            u.settings.theme = 'dark'
            u.todos.push('Improve Ace!')
          })
          ```
        - 🚨 The entire root object `user` gets a new reference
        - All nested objects/arrays inside it also get new references
        - This means every reactive computation that depends on any part of `user` will re-run
        - To avoid this please use `sync()`

    - `sync()`
        - Calls [Solid's reconcile()](https://docs.solidjs.com/concepts/stores) which efficiently diffs and merges entire objects or arrays and then calls `save()`, examples:
          ```ts
          // array example:

          store.users = [ // current users
            { _id: '1', name: 'Chris', active: true },
            { _id: '2', name: 'Alex', active: false },
          ]

          const newUsers = [ // updated api users
            { _id: '1', name: 'Chris', active: false }, // changed
            { _id: '2', name: 'Alex', active: false },  // identical
          ]

          // Only Chris's active property triggers reactive updates
          // key is optional, if undefined the key is 'id'
          sync('users', newUsers, { key: '_id' })


          // object example:

          store.user = {
            _id: '123',
            profile: {
              name: 'Chris',
              stats: { posts: 9, followers: 27 },
            },
          }

          const newUser = {
            profile: { stats: { followers: 30 } },
          }

          sync('user', newUser)
          ```



## Create API Route
1. Example: `src/api/apiUpdateEmail.ts`
    ```ts
    // to the API constructor, the first arg is the path param and the 2nd is the api function name which can be called on the FE or BE


    import { API } from '@ace/api'
    import { eq } from 'drizzle-orm'
    import { db, users } from '@src/lib/db'
    import { sessionB4 } from '@src/auth/authB4'
    import { updateEmailParser } from '@src/parsers/updateEmailParser'


    export const POST = new API('/api/update-email', 'apiUpdateEmail')
      .b4([sessionB4])
      .body(updateEmailParser)
      .resolve(async (scope) => {
        await db
          .update(users)
          .set({ email: scope.body.email }) // type-safe b/c updateEmailParser
          .where(eq(users.id, scope.event.locals.session.userId)) // type-safe b/c sessionB4

        return scope.success('Updated!')
      })
    ```
1. Create middleware functions: `src/auth/authB4.ts`
    ```ts
    // Ace middleware is different then express middleware and for that reason we use a different name we call them b4 (before) functions b/c they run before your API resolve function
    // If a b4 returns anything that response is given as the Response
    // To persist data from one b4 to the next or from a b4 to the resolve, place data into `event.locals` and update the functions generic type 🚨 By setting the generic type this lets downstream b4's or resolves know the type of your persisted data, so then in the resolve for example we'd have type-safety for `scope.event.locals.session` as seen in the api example above


    import type { B4 } from '@ace/types'
    import { getSession } from './getSession'
    import type { Session } from '@src/lib/types'


    export const sessionB4: B4<{ session: Session }> = async (scope) => {
      scope.event.locals.session = await getSession(scope)
    }

    export const adminB4: B4<{ session: Session }> = async (scope) => {
      if (!scope.event.locals.session.isAdmin) throw new Error('Unauthorized') // ❌
    }
    ```
1. Create a [parser](#parser): `src/parsers/updateEmailParser.ts`
      ```ts
      import { object } from 'valibot'
      import { vParse } from '@ace/vParse'
      import { vEmail } from '@ace/vEmail'


      export const updateEmailParser = vParse(
        object({
          email: vEmail('Please provide a valid email'),
        })
      )
      ```



## Path and Search Params

#### 🚨 Important
- `.pathParams()` & `.searchParams()` @ `new Route()` & `new API()` work the same way!
- IF params are valid THEN `scope.pathParams` and/or `scope.searchParams` will be set w/ their type-safe parsed values!
- And when working w/ `new API()` you may also pass a parser to `.body()` which if valid will be available @ `scope.body`

#### ✅ Examples:
1. Optional path params:
    ```ts
    import { vString } from '@ace/vString'
    import { object, optional } from 'valibot'

    export default new Route('/unsubscribe/:email?')
      .pathParams(vParse(object({ email: optional(vString()) })))
    ```
1. Required path params:
    ```ts
    export default new Route('/magic-link/:token')
      .pathParams(vParse(object({ token: vString('Please provide a token') })))
    ```
1. Optional search params:
    ```ts
    export const GET = new API('/api/test', 'apiTest')
      .searchParams(vParse(object({ amount: optional(vNum()) })))
      .resolve(async (scope) => {
        return scope.success(scope.searchParams)
      })
    ```
1. Required search & body params:
    ```ts
    export const POST = new API('/api/test', 'apiTest')
      .body(vParse(object({ when: vDate() })))
      .searchParams(vParse(object({ allGood: vBool() })))
      .resolve(async ({ success, body, searchParams }) => {
        return success({ body, searchParams })
      })
    ```
1. [All valibot helpers that can be used w/in `vParse(object(())`](#parsers)



## Parser
- In `Ace` a `Parser` is a `function` that `validates` & also optionally `parses` data
- This function accepts an `input`, will `throw` if invalid, and `return` data if valid that's potentially but not required to be parsed (your call) (all `vParse` helpers below validate + parse)
- Within a `Parser` function any prefered schema library may be used 🙌
- We reccomend [Valibot](https://valibot.dev/guides/comparison/)!
- To create a valibot parser use `vParse` + one/many of these helpers:
    - `{ token: vString('Please provide a token') }`
    - `{ modal: vBool('Please provide a modal param') }`
    - `{ email: vEmail('Please provide a valid email') }`
    - `{ value: vNum('Please provide a value as a number') }`
    - `{ voicePart: vEnums(new Enums(['Bass', 'Alto', 'Soprano'])) }`
    - `{ passportIssuedDate: vDate({error: 'Please provide date passport issued'}) }`
- Any of the helpers can be wrapped in valibot's `optional()` btw!
- Example:
    ```js
    vParse(object({ amount: optional(vNum()), allGood: vBool() }))
    ```
- `vBool()`
    - Parses `1` to `true`
    - Parses `0` to `false`
    - Parses `true` of any case to `true`
    - Parses `false` of any case to `false`
- `vDate()`
    - Can receive a data as a `Date` | `iso string` or `ms number`
    - Parses based on requested `to` prop
    - `@param props.to` - Optional, defaults to `iso`, what type of date are we parsing to, options are `'date' | 'ms' | 'sec' | 'iso'`
    - `props.includeIsoTime` - Optional, defaults to `true`, when true => `2025-08-01T00:50:28.809Z` when false => `2025-08-01`
    - `@param props.error` - The error to return when the input is invalid 
- 🚨 `Body Parsers` or parsers that validate request bodies are typically in their own file, b/c they are used on the `FE` & on the `BE`. If this parser was exported from the API file above and we imported it into a `FE` component, then there is a risk that` API content` could be in our `FE` build. So to avoid this, when we have **code that works in both environments**, it's `best practice` to put the export in it's `own file` (or a file that is as a whole good in both environments like `src/lib/vars.ts`), and ensure the **imports into this file** are `optimal` in **both** environments, example:
    ```ts
    // src/parsers/updateEmailParser.ts
    import { object } from 'valibot'
    import { vParse } from '@ace/vParse'
    import { vEmail } from '@ace/vEmail'


    export const updateEmailParser = vParse(
      object({
        email: vEmail('Please provide a valid email'),
      })
    )

    // src/api/apiUpdateEmail.ts
    import { API } from '@ace/api'
    import { eq } from 'drizzle-orm'
    import { db, users } from '@src/lib/db'
    import { sessionB4 } from '@src/auth/authB4'
    import { updateEmailParser } from '@src/parsers/updateEmailParser'


    export const POST = new API('/api/update-email', 'apiUpdateEmail')
      .b4([sessionB4])
      .body(updateEmailParser)
      .resolve(async (scope) => {
        await db
          .update(users)
          .set({ email: scope.body.email })
          .where(eq(users.id, scope.event.locals.session.userId))

        return scope.success()
      })

    // FE component
    const {store} = useStore()

    const onSubmit = createOnSubmit(({ event }) => {
      apiUpdateEmail({
        body: kParse(updateEmailParser, { email: store.newsletterForm.email }),
        onSuccess() {
          event.currentTarget.reset()
          showToast({ type: 'success', value: 'Updated!' })
        }
      })
    })
    ```
- `kParse()`
    - The `k` stands for `keys`
    - We pass to `kParse()` the `input` object (data to give to the parser) & the parser
    - At compile-time `kParse()` reads the parser and gives us autocomplete hints for the keys this parser requires
    - So w/ the example above, our IDE will error till `email` is a `key` in the `input` object
    - At run-time the parser will validate the `input` object completely
    - This helps us build our `input` object correctly
- [`createOnSubmit()`](#form-demo)
- Parsers for `path` and/or `search` params can be in their own file but are typically inline b/c they are only needed in that one place (most often but sometimes shared so then a file like above is ideal), example:
    ```ts
    export const POST = new API('/api/test', 'apiTest')
      .searchParams(vParse(object({ ready: vBool() })))
      .resolve(({ success, searchParams }) => {
        return success({ searchParams })
      })
    ```



## Create a Layout
1. Example: `src/app/RootLayout.tsx`
    ```ts
    // one to many layouts may surround a route
    // <ServiceWorker /> is fantastic if you'd love your site to function (simply or fully) w/o internet!


    import { Nav } from '@src/Nav/Nav'
    import { Layout } from '@ace/layout'
    import { ServiceWorker } from '@ace/serviceWorker'

    export default new Layout()
      .component(({children}) => {
        return <>
          <Nav />
          {children}
          <ServiceWorker />
        </>
      })
    ```



## Create a Route
1. Example: `src/app/Deposits/Deposits.tsx`
    ```ts
    // 🚨 Vite prefers css paths to be relative so don't use @src there please

    import './Deposits.css'
    import { Show } from 'solid-js'
    import { Route } from '@ace/route'
    import { Title } from '@solidjs/meta'
    import RootLayout from '../RootLayout'
    import { Users } from '@src/Users/Users'
    import { getUsersSources } from '@src/lib/vars'
    import { loadSession } from '@src/auth/loadSession'
    import { AuthLoading } from '@src/auth/AuthLoading'
    import { isEmployee, useStore } from '@src/store/store'
    import { AuthHeroTitle } from '@src/auth/AuthHeroTitle'
    import type { ScopeComponent } from '@ace/scopeComponent'


    export default new Route('/deposits')
      .layouts([RootLayout])
      .component((scope) => {
        loadSession()

        return <>
          <Title>❤️ Deposits</Title>

          <main class="deposit">
            <AuthHeroTitle />

            <div class="main-content">
              <Show when={scope.bits.get('apiGetSession') === false} fallback={<AuthLoading />}>
                <Loaded scope={scope} />
              </Show>
            </div>
          </main>
        </>
      })


    function Loaded({ scope }: { scope: ScopeComponent }) {
      const {store} = useStore()

      return <>
        <Show when={isEmployee(store)}>
          <div class="h-title">❤️ Made Deposit</div>
          <Users scope={scope} source={getUsersSources.keys.deposits}></Users>
        </Show>
      </>
    }
    ```
1. As seen above w/ `isEmployee(store)`, when computed properties are used in multiple components: `src/store/store.ts`:
    ```ts
    import { atoms } from './atoms'
    import { createMemo } from 'solid-js'
    import { Atoms2Store } from '@ace/types'
    import { partners } from '@src/lib/vars'
    import { createStore } from '@ace/createStore'


    export const { useStore, StoreProvider } = createStore({ atoms })


    // computed properties that are accessed in multiple modules
    export const isEmployee = (store: Atoms2Store<typeof atoms>) => createMemo(() => store.apiGetSession?.isAdmin || store.apiGetSession?.partner === partners.keys.globus)

    export const isAdmin = (store: Atoms2Store<typeof atoms>) => createMemo(() => store.apiGetSession?.isAdmin)
    ```



## Call APIs
1. With `Ace`, we call APIs via **API functions**! 🙌
    ```tsx
    function UpdateEmail() {
      const {store, refBind} = useStore()

      const onSubmit = createOnSubmit(({ event }) => {
        apiUpdateEmail({ // API Function! ❤️
          body: kParse(updateEmailParser, { email: store.newsletterForm.email }),
          onSuccess() {
            event.currentTarget.reset()
            showToast({ type: 'success', value: 'Updated!' }) // from @ace/toast
          }
        })
      })

      return <>
        <form ref={refFormReset()} onSubmit={onSubmit} class="update-email">
            <input ref={refBind('newsletterForm', 'email')} name="email" type="email" placeholder="Please enter email" />
            <Messages name="email" />
            <Submit label="Update" bitKey="apiUpdateEmail" $button={{ class: 'brand' }} />
        </form>
      </>
    }
    ```
1. `onSuccess()`
    - On `FE`, IF no errors AND `onSuccess` provided THEN `onSuccess` will be called w/ `response.data`, which is set on the `BE` via `return scope.success({ example: true })`
1. `onResponse()`
    - On `FE`, IF no errors AND `onResponse` provided THEN `onResponse` will be called w/ `Response`, which is set on the `BE` via `return new Response('example')`
1. `onError()`
    - On `FE`, IF `response.error` is truthy THEN `onError()` OR `defaultOnError()` will be called w/ `response.error`, which is set on the `BE` via `return scope.error('🐛')` OR `throw new Error('❌')`
    - `defaultOnError()` => [`showErrorToast(error.message)`](#show-toast-notifications)
1. `queryType`
    - If you specify a `queryType` then we'll use [Solid's `query()` function](https://docs.solidjs.com/solid-router/reference/data-apis/query). `query()` accomplishes the following:
        - Deduping on the server for the lifetime of the request
        - Provides a `back/forward cache` for browser navigation for up to **5 minutes**. Any user based navigation or link click bypasses this cache
    - 🚨 set the `queryType` to `stream` when you'd love this api call to happen while the component is rendering & this request **does NOT set cookies**. On refresh the request will start on the `BE` and on SPA navigation (on anchor click) the request will start on the `FE`
      ```ts
      import './Home.css'
      import { Route } from '@ace/route'
      import { useStore } from '@src/store/store'
      import { Title, Meta } from '@solidjs/meta'
      import { MarkdownItStatic } from '@ace/markdownItStatic'
      import { apiGetFinances, apiGetCashFlow, apiGetTransactions } from '@ace/apis'


      export default new Route('/')
        .layouts([RootLayout])
        .component(() => {
          const {sync} = useStore()

          apiGetTransactions({ // api's load simultaneously btw ❤️
            queryType: 'stream',
            onSuccess: (d) => sync('transactions', d)
          })

          apiGetFinances({ // on refresh => requests start on the BE 🤓
            queryType: 'stream',
            onSuccess(d) {
              sync('financeSummary', d.summary)
              sync('financeCategories', d.categories)
            }
          })

          return <>
            <Title>🏡 Home · Create Ace App</Title>
            <Meta property="og:title" content="🏡 Home · Create Ace App" />
            <Meta property="og:type" content="website" />
            <Meta property="og:url" content={buildOrigin} />
            <Meta property="og:image" content={buildOrigin + '/og/home.webp'} />

            <main class="home">
              <Welcome />

              <section class="summaries">
                <Summary key="balance" label="💸 Total Balance"  />
                <Summary key="monthlyExpenses" label="📉 Monthly Expenses" />
                <Summary key="monthlyIncome" label="📈 Monthly Income" />
              </section>

              <section class="vizs">
                <Categories />
                <Transactions/>
              </section>

              <MarkdownItStatic content={mdAppInfo} />

              <Nav showRefresh={true} />
            </main>
          </>
        })
      ```
    - 🚨 set the `queryType` to `direct` when this api call does not happen while the component is rendering but does happen after, like based on some user interaction like an onClick
      ```ts
      import { Show } from 'solid-js'
      import { Submit } from '@ace/submit'
      import { apiSignOut } from '@ace/apis'
      import { scope } from '@ace/scopeComponent'
      import { useStore } from '@src/store/store'
      import { goSignIn } from '@src/auth/goSignIn'
      import { createOnSubmit } from '@ace/createOnSubmit'


      export function SignOut() {
        const {set, store} = useStore()

        const signOut = createOnSubmit(() => {
          apiSignOut({ // API Function! ❤️
            queryType: 'direct',
            onSuccess () {
              set('apiGetSession', undefined)
              goSignIn(scope)
            }
          })
        })

        return <>
          <Show when={store.apiGetSession?.userId}>
            <form onSubmit={signOut}>
              <Submit label="Sign Out" bitKey="apiSignOut" $button={{class: 'brand'}} />
            </form>
          </Show>
        </>
      }
      ```
    - 🚨 set the `queryType` to `maySetCookies` when you'd love this api call to happen while the component is rendering & this request **DOES set cookies**. `maySetCookies` ensures that this request will always start on the `FE`. Explanation: The way a server tells a browser about cookies is w/ the` Set-Cookie` header. We may not update HTTP headers after a `Response` is given to the `FE`, and during streaming the response is already w/ the `FE`. `stream` is the most performant option, so to avoid this option as much as possible we recommend redirecting to api's that set cookies
      ```ts
      import { apiGetSession } from '@ace/apis'
      import { useStore } from '@src/store/store'


      export function loadSession() {
        const {set} = useStore()

        apiGetSession({ // API Function! ❤️
          queryType: 'maySetCookies',
          onSuccess: (d) => set('apiGetSession', d),
          onError: () => set('apiGetSession', undefined),
        })
      }
      ```
- 🚨 See [VS Code Extension](#vs-code-extension) to see how to add links to `Ace API's` right **above API Function calls!**
- See [Echo](#echo) to see how updating API data in Ace works
-  `queryKey`:
    - An optional prop that can be passed to api functions
    - The unique identifier `Solid's query()` uses for all it's magic like deduplication
    - IF `queryType` is set AND `queryKey` is undefined THEN the `queryKey` is set as the api function name (ex: `apiGetUsers`)
    - Typically being undefined is ideal **unless** there is a query or search param that is sent in this request and we wanna `dedup` based on that `id` (ex: `['apiGetUser', id]`)
    - So a `queryKey` can be `undefined` (typical), can be a string (uncommon), or an array (sometimes super helpful)



## VS Code Extension
- Provides links to `Ace API's` right **above API Function calls!** 🙌
    ![Ace for Vs Code Extension](https://i.imgur.com/6risrqD.png)
- In **VS Code** or any fork like **[VsCodium](https://vscodium.com/)**:
    - Extensions Search: `ace-vs-code`
    - The name of the package is `Ace for VS Code` and the author is `acets-team`
- & please feel free click here to see [additional vs code helpful info](#vs-code-helpful-info)!



## Echo
- How does this `Echo` idea work?
    1. An `API` endpoint updates some data
    1. The `API` gathers the updated data consistently (same function every time)
    1. The `API` echos the updated data to the `FE` w/in the `Response`
    1. & if using `Ace Live Server`, the  `API` echos the updated data to all subscribers
- 🤓 Kitchen Sink Example:
    - `src/lib/vars.ts`
      ```ts
      export const streams = new Enums(['amsterdamRegistration']) // the streams our Ace Live Server supports
      ```
    - `src/lib/types.d.ts`
      ```ts
      import type { ApiName2Data } from '@ace/types'

      export type LiveAmsterdamRegistrationData = { // subscribers will receive a toast message & the updated registration
        message: string,
        registration: ApiName2Data<'apiGetAmsterdamRegistration'>
      }
      ```
    - `src/db/dbGetAmsterdamRegistration.ts`
        ```ts
        // our consistent (same function every time) way to get complex data (complex b/c multiple joins) 

        import { eq, type SQL } from 'drizzle-orm'
        import { amsterdamRegistrations, db, roommateOptions, users, voiceParts } from "./db";


        export async function dbGetAmsterdamRegistration(where: SQL) {
          const [registration] = await db
            .select({
              id: amsterdamRegistrations.id,
              email: users.email, 
              phone: amsterdamRegistrations.phone,
              gender: amsterdamRegistrations.gender,
              voicePart: voiceParts.name,
              emergencyContact: amsterdamRegistrations.emergencyContact,
              physicalLimitations: amsterdamRegistrations.physicalLimitations,
              dietaryLimitations: amsterdamRegistrations.dietaryLimitations,

              roommateOption: roommateOptions.name,
              roommateName: amsterdamRegistrations.roommateName,
              singleAgree: amsterdamRegistrations.roommateSingleAgree,

              nameOnPassport: amsterdamRegistrations.name,
              passportNumber: amsterdamRegistrations.passportNumber,
              passportIssuedDate: amsterdamRegistrations.passportIssuedDate,
              passportExpiredDate: amsterdamRegistrations.passportExpiredDate,
              passportAuthority: amsterdamRegistrations.passportAuthority,
              nationality: amsterdamRegistrations.nationality,
            })
            .from(amsterdamRegistrations)
            .leftJoin(voiceParts, eq(amsterdamRegistrations.voicePartId, voiceParts.id))
            .leftJoin(roommateOptions, eq(amsterdamRegistrations.roommateOptionId, roommateOptions.id))
            .leftJoin(users, eq(users.id, amsterdamRegistrations.userId))
            .where(where)
            .limit(1)

          return registration
        }
        ```
    - `src/api/apiGetAmsterdamRegistration.ts`
        ```ts
        import { API } from '@ace/api'
        import { eq } from 'drizzle-orm'
        import { vNum } from '@ace/vNum'
        import { vParse } from '@ace/vParse'
        import { object, optional } from 'valibot'
        import { sessionB4 } from '@src/auth/authB4'
        import { amsterdamRegistrations } from '@src/db/db'
        import { dbGetAmsterdamRegistration } from '@src/db/dbGetAmsterdamRegistration'


        export const GET = new API('/api/get-amsterdam-registration/:registrationId?', 'apiGetAmsterdamRegistration')
          .b4([sessionB4])
          .pathParams(vParse(object({ registrationId: optional(vNum()) })))
          .resolve(async (scope) => {
            const where = scope.pathParams.registrationId // IF pathParam defined
              ? eq(amsterdamRegistrations.id, scope.pathParams.registrationId) // get registration by pathParams.registrationId
              : eq(amsterdamRegistrations.userId, scope.event.locals.session.userId) // get registration by current session user id

            const registration = await dbGetAmsterdamRegistration(where)

            return scope.success(registration)
          })
        ```
    - `src/api/apiUpsertAmsterdamRegistration.ts`
        ```ts
        import { API } from '@ace/api'
        import { streams } from '@src/lib/vars'
        import { sessionB4 } from '@src/auth/authB4'
        import { eq, type InferInsertModel } from 'drizzle-orm'
        import { db, amsterdamRegistrations } from '@src/db/db'
        import type { LiveAmsterdamRegistrationData } from '@src/lib/types'
        import { dbGetAmsterdamRegistration } from '@src/db/dbGetAmsterdamRegistration'
        import { upsertAmsterdamRegistrationParser } from '@src/parsers/upsertAmsterdamRegistrationParser'


        export const POST = new API('/api/upsert-amsterdam-registration', 'apiUpsertAmsterdamRegistration')
          .b4([sessionB4])
          .body(upsertAmsterdamRegistrationParser)
          .resolve(async (scope) => {
            if (!process.env.LIVE_SECRET) throw new Error('!process.env.LIVE_SECRET')

            const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, scope.event.locals.session.userId) })
            if (!user) throw new Error('Please sign in')

            const voicePart = await db.query.voiceParts.findFirst({ where: (v, { eq }) => eq(v.name, scope.body.voicePart) })
            if (!voicePart) throw new Error('Please include a valid voice part')

            const roommateOption = await db.query.roommateOptions.findFirst({ where: (r, { eq }) => eq(r.name, scope.body.roommateOption) })
            if (!roommateOption) throw new Error('Please include a valid roommate option')

            const existingRegistration = await db.query.amsterdamRegistrations.findFirst({
              where: (row, { eq }) => eq(row.userId, user.id)
            })

            const upsert: InferInsertModel<typeof amsterdamRegistrations> = { // ❤️ define 1 shape for insert AND update
              userId: user.id,
              phone: scope.body.phone,
              gender: scope.body.gender,
              voicePartId: voicePart.id,
              emergencyContact: scope.body.emergencyContact,
              physicalLimitations: scope.body.physicalLimitations || null,
              dietaryLimitations: scope.body.dietaryLimitations || null,
              roommateOptionId: roommateOption.id,
              roommateName: scope.body.roommateName || null,
              roommateSingleAgree: scope.body.roommateSingleAgree ? 1 : 0,
              name: scope.body.name,
              passportNumber: scope.body.passportNumber,
              passportIssuedDate: new Date(scope.body.passportIssuedDate),
              passportExpiredDate: new Date(scope.body.passportExpiredDate),
              passportAuthority: scope.body.passportAuthority,
              nationality: scope.body.nationality,
            }

            let data: undefined | LiveAmsterdamRegistrationData

            if (existingRegistration) { // 🔄 update
              await db
                .update(amsterdamRegistrations)
                .set(upsert)
                .where(eq(amsterdamRegistrations.id, existingRegistration.id))

              data = { // data is for Ace Live Server
                message: `${scope.body.name} updated their Amsterdam Registration!`,
                registration: await dbGetAmsterdamRegistration(eq(amsterdamRegistrations.id, existingRegistration.id)),
              }
            } else { // ✨ create
              const [resultSet] = await db
                .insert(amsterdamRegistrations)
                .values(upsert)
                .returning()

              data = { // data is for Ace Live Server
                message: `${scope.body.name} created their Amsterdam Registration!`,
                registration: await dbGetAmsterdamRegistration(eq(amsterdamRegistrations.id, resultSet.id))
              }
            }

            await scope.liveEvent({ // broadcast (echo) live event to all subscribers of the amsterdamRegistration stream
              data,
              stream: streams.keys.amsterdamRegistration,
              requestInit: { headers: { LIVE_SECRET: process.env.LIVE_SECRET } }
            })

            return scope.success(`Registration ${existingRegistration ? 'updated' : 'saved'}!`)
          })
        ```
    - `Component.tsx`
        ```tsx
        import { showToast } from '@ace/toast'
        import { onCleanup, onMount } from 'solid-js'
        import { LiveAmsterdamRegistrationData } from '@src/lib/types'

        const {sync} = useStore()

        onMount(() => {
          const ws = scope.liveSubscribe({ stream: streams.keys.amsterdamRegistration }) // 🔔 subscribe to amsterdamRegistration stream

          ws.addEventListener('message', async (event) => { // 💌 onMessage
            const data: LiveAmsterdamRegistrationData = JSON.parse(event.data) // parse data
            showToast({ type: 'success', value: data.message }) // show notfication
            sync('apiGetAmsterdamRegistration', data.registration) // update FE data
          })

          onCleanup(() => scope.liveUnsubscribe(ws)) // 🔕 on leave => unsubscribe
        })
        ```
    - `Ace Live Server` > `index.ts`
        ```ts
        import { jwtValidate } from '@ace/jwtValidate'
        import { createLiveWorker, createLiveDurableObject, readCookie } from '@ace/liveServer'


        export default createLiveWorker() satisfies ExportedHandler<Env>


        export const LiveDurableObject = createLiveDurableObject({
          onValidateEvent(request) { // only our server can post events
            if (request.headers.get('LIVE_SECRET') !== process.env.LIVE_SECRET) {
              return new Response('Unauthorized', { status: 400 })
            }
          },
          async onValidateSubscribe(request) { // only our signed in customers can subscribe (we may share cookies if we put our live server on a subdomain of the app server (ex: live.example.com)
            const jwt = readCookie(request, 'aceJWT')
            const res = await jwtValidate({ jwt })
            if (!res.isValid) return new Response('Unauthorized', { status: 400 })
          }
        })
        ```
- Why doesen't `Ace` use `revalidate()`?
    - Solid's `revalidate()` relies on **signals** created by `query()` and `createAsync()`
    - To **update** `state` with `Ace`, we don't **update** `query` signals, we **update** `state` signals
- Why doesen't `Ace` use `Single Flight Mutations`?
    - The `Response` that comes from a `Single Flight Mutation` is framework specific & not a `JSON` shape we define
    - & b/c of how `RPC` functions are created, the `Request URL` may also be difficult to predict 
    - We love **defined** & **type-safe**, `URLs` & `Responses`



## Breakpoints
#### BE Breakpoints ✅
1. @ `BE` code, place a `debugger` w/in your code and/or an `if (condition) debugger` (as seen in screenshot below)
1. Refresh site and now in your editor you may `watch variables` & see the `call stack`!
    ![Ace BE Breakpoint Example](https://i.imgur.com/Tha1FSx.jpeg)
#### FE Breakpoints ✅
1. @ `FE` code, place a `debugger` w/in your code and/or an `if (condition) debugger` (as seen in screenshot below)
1. In browser navigate to `Inpect` > `Sources`
1. Refresh site and now in your browser you may `watch variables` & see the `call stack`!
    ![Ace FE Breakpoint Example](https://i.imgur.com/sY9tJ2w.jpeg)



## Scope
#### ✅ ScopeBE
- Available @:
    - [`B4` Functions](#create-api-route), example:
        ```ts
        export const sessionB4: B4<{ session: Session }> = async (scope) => {
          scope.event.locals.session = await getSession(scope)
        }
        ```
    - [`API` > `.resolve()` Functions](#create-api-route), example:
      ```ts
      import { API } from '@ace/api'
      import { eq } from 'drizzle-orm'
      import { db, users } from '@src/lib/db'
      import { sessionB4 } from '@src/auth/authB4'
      import { updateEmailParser } from '@src/parsers/updateEmailParser'


      export const POST = new API('/api/update-email', 'apiUpdateEmail')
        .b4([sessionB4])
        .body(updateEmailParser)
        .resolve(async (scope) => {
          await db
            .update(users)
            .set({ email: scope.body.email })
            .where(eq(users.id, scope.event.locals.session.userId))

          return scope.success()
        })
      ```
- Features:
    - `scope.respond()`
        - Builds a `Response` based on the provided props
        - `scope.success()`,  `scope.error()` & `scope.go()` each use `scope.respond()`
        - The option to return a custom `Response` from an `API` or `B4` is available too btw
        - Props:
            ```ts
            {
              path?: T_Path, // redirect path string
              data?: T_Data, // object
              status?: number,
              error?: AceError,
              headers?: HeadersInit,
              pathParams?: RoutePath2PathParams<T_Path>, // object (for redirect)
              searchParams?: RoutePath2SearchParams<T_Path>, // object (for redirect)
            }
            ```
    - `scope.success()`
        - Creates a success `Response` w/ simple options
        - For all options please call `scope.respond()`
        - Props: `(data?: T_Data, status = 200)`
    - `scope.error()`
        - Creates a error `Response` w/ simple options
        - For all options please call `scope.respond()`
        - Props: `(message: string, status = 400)`
    - `scope.go()`
        - Creates a redirect `Response` w/ simple options
        - For all options please call `scope.respond()`
        - Props: `(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> })`
    - `scope.setCookie()`
        - Set a cookie
        - Props: `(name: string, value: string, options?: CookieSerializeOptions)`
    - `scope.getCookie()`
        - Get a cookie value by name
        - Props: `(name: string)`
    - `scope.clearCookie()`
        - Delete a cookie by name
        - Props: `(name: string)`
    - `scope.liveEvent()`
        - Helpful when you'd love to create an [Ace Live Server](#live-data-without-browser-refresh) `event`
    - `scope.requestUrlOrigin`
        - The origin of the current HTTP request URL
#### ✅ ScopeComponent
- Available @:
    - Any component via `import { scope } from '@ace/scopeComponent'`
    - [`Layout > .component()`](#create-a-layout), example:
        ```ts
        import { Nav } from '@src/Nav/Nav'
        import { Layout } from '@ace/layout'

        export default new Layout()
          .component(({ children }) => {
            return <>
              <Nav />
              {children}
            </>
          })
        ```
    - [`Route > .component()`](#create-a-route), example:
        ```ts
        import { Route } from '@ace/route'

        export default new Route('/')
          .component((scope) => {
            return <>
              <Show when={scope.bits.get('apiExample') === false} fallback={<Loading />}>
                <Loaded />
              </Show>
            </>
          })
        ```
    - [`Route404 > .component()`](#create-a-404-route), example:
        ```ts
        import { Route404 } from '@ace/route404'

        export default new Route404()
          .component((scope) => {
            return <>
              <h1>{scope.location.pathname}</h1>
            </>
          })
        ```
- Features:
    - `scope.pathParams`
        - Path params as an object
        - If using in a `createEffect()` THEN use `scope.PathParams()`
    - `scope.PathParams()`
        - Reactive path params that can be used in a `createEffect()`
        - If not using in a `createEffect()` THEN use `scope.pathParams`
    - `scope.searchParams`
        - Search params as an object
        - If using in a `createEffect()` THEN use `scope.SearchParams()`
    - `scope.SearchParams()`
        - Reactive search params that can be used in a `createEffect()`
        - If not using in a `createEffect()` THEN use `scope.searchParams`
    - `scope.location`
        - Location as an object
        - If using in a `createEffect()` THEN use `scope.Location()`
    - `scope.Location()`
        - Reactive location that can be used in a `createEffect()`
        - IF not using in a `createEffect()` THEN use `scope.location`
    - `scope.liveSubscribe()`
        - Helpful when you'd love to create a ws connection to an [Ace Live Server](#live-data-without-browser-refresh)
        - Example:
            ```ts
            const ws = scope.liveSubscribe({ stream: 'example' })
        
            ws.addEventListener('message', event => {
              console.log(event.data)
            })
        
            ws.addEventListener('close', () => {
              console.log('ws closed')
            })
            ```
    - `scope.go()`
        - Frontend redirect w/ simple options
        - For all possible options please use `scope.Go()`
        - Props:
            ```ts
            /**
             * @param path - Redirect to this path, as defined @ new Route()
             * @param params.pathParams - Path params
             * @param params.searchParams - Search params
             */
            ```
    - `scope.Go()`
        - Frontend redirect w/ simple options
        - For all possible options please use `scope.Go()`
        - Props:
            ```ts
            /**
             * @param path - Redirect to this path, as defined @ new Route()
             * @param pathParams - Path params
             * @param searchParams - Search params
             * @param replace - Optional, defaults to false, when true this redirect will clear out a history stack entry 
             * @param scroll - Optional, defaults to true, if you'd like to scroll to the top of the page when done redirecting
             * @param state - Optional, defaults to an empty object, must be an object that is serializable, available @ the other end via `fe.getLocation().state`
             */
            ```
    - `scope.children`
        - Get the children for a layout
        - IF not a layout OR no children THEN `undefined`
    - `scope.GET()`
        - Call api `GET` method w/ **type-safe autocomplete**
        - Props:
            ```ts
            /**
            * @param path - As defined @ `new API()`
            * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
            * @param options.pathParams - Path params
            * @param options.searchParams - Search params
            * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
            */
            ```
    - `scope.POST()`
        - Call api `POST` method w/ **type-safe autocomplete**
        - Props:
            ```ts
            /**
            * @param path - As defined @ `new API()`
            * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
            * @param options.pathParams - Path params
            * @param options.searchParams - Search params
            * @param options.body - Request body
            * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
            */
            ```
    - `scope.PUT()`
        - Call api `PUT` method w/ **type-safe autocomplete**
        - Props:
            ```ts
            /**
            * @param path - As defined @ `new API()`
            * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
            * @param options.pathParams - Path params
            * @param options.searchParams - Search params
            * @param options.body - Request body
            * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
            */
            ```
    - `scope.DELETE()`
        - Call api `DELETE` method w/ **type-safe autocomplete**
        - Props:
            ```ts
            /**
            * @param path - As defined @ `new API()`
            * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
            * @param options.pathParams - Path params
            * @param options.searchParams - Search params
            * @param options.body - Request body
            * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
            */
            ```



## Create a 404 Route
```tsx
import './Unknown.css'
import { A } from '@ace/a'
import { Title } from '@solidjs/meta'
import { Route404 } from '@ace/route404'
import RootLayout from '@src/app/RootLayout'


export default new Route404()
  .layouts([RootLayout]) // zero to many layouts available @ Route or Route404!
  .component(({location}) => {
    return <>
      <Title>😅 404</Title>

      <main class="not-found">
        <div class="code">404 😅</div>
        <div class="message">Oops! We can't find that page.</div>
        <div class="path">{location.pathname}</div>
        <A path="/" class="brand">🏡 Go Back Home</A>
      </main>
    </>
  })
```



## Create a Typesafe Anchor
- `Path`, `pathParams` & `searchParams` = **type-safe**
- IF `pathParams` or `searchParams` are defined for this route as **required** THEN they'll be required here @ compile-time (IDE autocomplee 🙌)
- When anchor path matches the current route an `active` class is added to the generated anchor
- When anchor path does not match the current route an `inactive` class is added to the generated anchor
- Use the [SolidJS `end` prop](https://docs.solidjs.com/solid-router/reference/components/a) (ex: `<A path="/" $a={{ end: true }}>Home</A>`) if the match is too greedy. If true, only considers the link to be active when the current location matches the href exactly; if false, checks if the current location starts with href
    ```tsx
    import { A } from '@ace/a'

    <A path="/about">Learn More</A>
    ```
- Props:
  ```js
  /**
   * @param props.path - Path to navigate to, as defined @ `new Route()`
   * @param props.pathParams - Route path params
   * @param props.searchParams - Route search params
   * @param props.children - Required
   * @param props.$a - Add props to `<SolidA />` & the html dom `<a />`
   */
  ```



## Typesafe Redirects
1. Redirect @ `B4`!
    ```tsx
    import type { B4 } from '@ace/types'

    export const redirectB4: B4 = async (scope) => {
      return scope.go('/') // return or throw both work :)
    }
    ```
1. Redirect @ `API > .resolve()`
    ```tsx
    // scope.go() and scope.error() are shortcuts to scope.respond()
    // IF scope.go() does not have all the options you want (ex: custom status or headers) please use scope.respond({ path: '/', status: abc, headers: xyz })


    import { API } from '@ace/api'
    import { vParse } from '@ace/vParse'
    import { vEnums } from '@ace/vEnums'
    import { elements } from 'src/lib/vars'
    import { object, picklist } from 'valibot'


    export const GET = new API('/api/element/:element', 'apiElement')
      .pathParams(vParse(object({ element: vEnums(elements) })))
      .resolve(async (scope) => {
        return scope.pathParams.element === 'fire' // ✨ Typesafe API Path Params
          ? scope.error('🔥')
          : scope.go('/') // 💫 Typesafe API Redirects (throwing scope.go() here works too)
      })
    ```
1. Redirect @ `Route > .component()`!
    ```tsx
    // IF scope.go() does not have all the options you want (ex: custom scroll or replace) please use scope.Go({ path: '/example', replace: true })
    // 🚨 Throw the `go()` or `Go()`, THROWING thankfully ends the inference loop of defining and returning a route 🙌


    import { Route } from '@ace/route'

    export default new Route('/')
      .component(scope => {
        throw scope.go('/deposits')
      })
    ```



## Add Offline Support
1. Create `/public/sw.js`
    ```js
    // @ts-check

    import { swAddOffLineSupport } from './.ace/swAddOffLineSupport.js'

    const packageDotJsonVersion = ''

    swAddOffLineSupport({ cacheName: `offline-cache-v-${packageDotJsonVersion}` })
    ```
1. 🚨 To align our app version (in package.json) w/ your cache version then:
    1. Ensure `package.json` [version is defined](https://docs.npmjs.com/cli/commands/npm-version)
    1. Ensure `/public/sw.js` has `const packageDotJsonVersion = ''` 
    1. Run in bash: `ace sw` to place your `package.json` version into your sw.js file 🥳
    1. Update package.json scripts to run `ace sw` automatically
        ```json
        {
          "scripts": {
            "dev": "ace build local && ace sw && vinxi dev",
            "build": "ace build prod && ace sw && vinxi build",
          },
        }
        ```
1. @ `src/entry-server.tsx` add `@ace/sw.styles.css?raw` AND `@ace/swRegister?raw`. The `?raw` is a `Vite` thing, it gives us the import as a string, and then we inline it for an optimal [Lighthouse score](https://developer.chrome.com/docs/lighthouse/overview)!
    ```tsx
    // @refresh reload
    import swRegister from '@ace/swRegister?raw'
    import swStyles from '@ace/sw.styles.css?raw'
    import { createHandler, StartServer } from '@solidjs/start/server'

    export default createHandler(() => (
      <StartServer
        document={({ assets, children, scripts }) => (
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <style>{swStyles}</style>
              <link rel="icon" href="/favicon.ico" />
              <link rel="manifest" href="/manifest.json" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="description" content="Create Ace App is a showcase for what is possible w/ Ace!" />

              {/* enhance how the site looks when added to an iOS device's home screen */}
              <meta name="apple-mobile-web-app-capable" content="yes" /> {/* tells iOS Safari that the web application should be run in full-screen mode without the standard browser chrome (address bar, toolbar) when launched from a home screen icon */}
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> {/* sets the appearance of the iOS status bar (time, battery icons) when running in full-screen mode */}

              {assets}
            </head>
            <body>
              <div id="app">{children}</div>
              <script>{swRegister}</script>
              {scripts}
            </body>
          </html>
        )}
      />
    ))
    ```


- How it works:
    - On every GET request we first go to the server, and if that response is ok then the service worker will store the response in cache
    - When offline we'll still try to fetch, and when it fails we'll check cache, and if cache has a response we'll give it
    - The styling is b/c service workers register when you go to a page that has a service worker, but it won't install and activate till the first refresh after it's been registered, so we do this immediately after registration, and to not let the user know this is happening we have the app be 0 opacity till after the refresh. The refresh only happens once in the lifetime of the customer on the app w/ this cache version (app version).



## Network Status Hook
- Helpful if you'd love to alter things based on their network (wifi) connection
- IF hook called one or many times THEN still only 1 event is added to window to watch network status & then this value is shared w/ all hooks
    ```ts
    import { Route } from '@ace/route'
    import { showToast } from '@ace/toast'
    import { useNetworkStatus } from '@ace/useNetworkStatus'

    export default new Route('/')
      .component(() => {
        const status = useNetworkStatus() // Accessor<'online' | 'offline'>
        
        return <>
          <button type="button" onClick={() => showToast({ type: 'info', value: status() })}>Click here</button>
        </>
      })
    ```



## Create Desktop Application
**✅ [`npx create-ace-app@latest`](#create-ace-app) is built w/ the following directions done btw!**
![Create Ace App](https://i.imgur.com/Nyd6HdL.png)
1. Please follow the [Add Offline Support](#add-offline-support) directions to ensure you register the service worker correctly!
    - Offline support is a lovely app feature but if you don't want it, just **don't** call `swAddOffLineSupport()` @ `/public/sw.js`
1. For free in [Figma](https://www.figma.com/) create a 512x512 icon for your app
1. For free @ [Progressier](https://progressier.com/pwa-manifest-generator) create a `manifest.json` and icon suite
1. Add the generated `manifest.json` and `icons` to your `/public` folder
1. @ `src/entry-server.tsx` > `<head>` add `<link rel="manifest" href="/manifest.json" />`
1. App install is now ready! (works on `localhost` too btw!)
    ![Create Desktop Application](https://i.imgur.com/iN3ywWW.png)



## Markdown
#### `<AceMarkdown />` ✅
- Ideal for SEO
- Supports `.md` files & markdown `Preview` @ [VsCodium](https://vscodium.com/)  ✅
    ![Ace Markdown Example](https://i.imgur.com/cigzPqB.jpeg)
- Example:
    ```tsx
    // How `.md?raw` works:
      // at build-time, the markdown file is bundled as a string literal 
      // so at run-time, there's no file I/O b/c the markdown is an in memory string constant 

    // 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary

    import { AceMarkdown } from '@ace/aceMarkdown'
    import { Example } from '@src/Example/Example'
    import mdAppInfo from '@src/md/mdAppInfo.md?raw'
    import { registerHljs } from '@src/init/registerHljs'
    import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

    <AceMarkdown content={mdAppInfo} components={[Example]} registerHljs={registerHljs} markdownItOptions={{ highlight: hljsMarkdownItOptions }} />
    ```
- Requires: `npm i markdown-it -D`
- Converts `markdown` to `html` AND supports `Directives`, added via `comments` that start with  `<!--{`, end with `}-->` and include `JSON` w/in
- `Directives`:
    - `$info`:
        - Example: `<!--{ "$info": true, "$interpolate": true, "title": "What is Ace?", "slug": "what-is-ace" }-->`
        - IF `$info.$interpolate` is `true` THEN `vars` from `$info` can be placed @ `markdown`, `component props`, `tab label` & `tab content`, example: `# {title} ❤️`
    - `$component`:
        - Adds a Solid component into markdown 🙌
        - Example: `<!--{ "$component": "Example", "title": "{title}" }-->`
        - THEN pass the `component function` to `AceMarkdown`, example: `<AceMarkdown content={mdWhatIsAce} components={[Example]} />`
    - ❤️ `$tabs`:
        - Example: `<!--{ "$tabs": ["TS", "JS"] }-->`
        - The value in the directive @ `$tabs` is the tab `labels`, so for this example there would be 2 labels, one is `TS` and the other is `JS`
        - Place the tab content below the `Directive`
        - 🚨 Add `---` at the end of each tab content to let us know where each tab content ends
        - IF the number of `content items` does not match the number of `labels` THEN we'll throw an error
        - ✅ Tab content may include, `markdown`, or `components`
        - W/in the `Directive` these additional `TabsProps` can be provided of `{ name?: string, variant?: 'underline' | 'pill' | 'classic', $div?: JSX.HTMLAttributes<HTMLDivElement> }`
            - Example: `<!--{ "$tabs": ["TS", "JS"], "variant": "underline" }-->`
- Props:
    ```ts
    {
      /** Ace Markdown Content, example: `import mdWhatIsAce from '@src/md/mdWhatIsAce.md?raw'`, then provide `mdWhatIsAce` here  */
      content: string,
      /** Components that are in the AceMarkdown, just passing the function names is perfect */
      components?: (() => JSX.Element)[],
      /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
      setMD?: Setter<markdownit | undefined>
      /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
      markdownItOptions?: MarkdownItOptions
      /** Optional, props passed to inner wrapper div */
      $div?: JSX.HTMLAttributes<HTMLDivElement>,
      /** Optional, to enable code highlighting pass a function here that registers highlight languages */
      registerHljs?: () => void,
    }
    ```


#### `parseMarkdownFolders()` ✅
- Helpful when we have a folder of `.md` files and we'd love to get `type-safe` info about all of the markdowns w/in the folder
- Example: We've got a folder for posts and we wanna show each post title & link to it w/in a component
    - `Ace Markdown Directive`:
        ```html
        <!--{ "$info": true, "title": "What is Ace?", "slug": "what-is-ace" }-->
        ```
    - `ace.config.js`
        ```ts
        export const config = {
          mdFolders: [
            { id: 'mdFolder', path: 'src/md' },
            { id: 'contentFolder', path: 'src/content' },
          ],
        }
        ```
    - `./src/parsers/mdParser`
        ```ts
        export const mdParser = vParse(object({ 
          $info: vBool(),
          slug: vString(),
          title: vString()
        }))
        ```
    - `Component`
        ```ts
        import { parseMarkdownFolders } from '@ace/parseMarkdownFolders'

        const mdFolder = parseMarkdownFolders('mdFolder', mdParser)
        const contentFolder = parseMarkdownFolders('contentFolder', parser)

        console.log({
          mdFolder, contentFolder, // { path: string, raw: string, info: T }[]
          whatIsAce: mdFolder.find(md => md.info.slug === 'what-is-ace')
        })
        ```


#### `<MarkdownItStatic />` ✅
- Ideal for SEO
- Does not support `<AceMarkdown />` directives
- Supports `.md` files & markdown `Preview` @ [VsCodium](https://vscodium.com/)  ✅
- Install: `npm i markdown-it -D`
- Example:
    ```ts
    // 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary

    import mdAppInfo from '@src/md/mdAppInfo.md?raw'
    import { registerHljs } from '@src/init/registerHljs'
    import { MarkdownItStatic } from '@ace/markdownItStatic'
    import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

    <MarkdownItStatic content={mdAppInfo} registerHljs={registerHljs}  options={{ highlight: hljsMarkdownItOptions }} />
    ```
- Props:
    ```ts
    {
      /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
      content: string,
      /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
      setMD?: Setter<markdownit | undefined>
      /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
      markdownItOptions?: MarkdownItOptions
      /** Optional, props passed to inner wrapper div */
      $div?: JSX.HTMLAttributes<HTMLDivElement>,
      /** Optional, to enable code highlighting pass a function here that registers highlight languages */
      registerHljs?: () => void
    }
    ```


#### `<MarkdownItDynamic />` ✅
- Ideal for dynamic markdown (from `DB`) or `FE` alterable markdown (from `textarea`)
- Does not support `<AceMarkdown />` directives
- Install: `npm i markdown-it -D`
- Example:
    ```ts
    // 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary

    import { registerHljs } from '@src/init/registerHljs'
    import { MarkdownItDynamic } from '@ace/markdownItDynamic'
    import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

    <MarkdownItDynamic content={() => store.buildStats} registerHljs={registerHljs} options={{ highlight: hljsMarkdownItOptions }} $div={{ class: 'markdown' }} />
    ```
- Props:
    ```ts
    {
      /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
      content: Accessor<string | undefined>
      /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
      setMD?: Setter<markdownit | undefined>
      /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
      markdownItOptions?: MarkdownItOptions
      /** Optional, props passed to inner wrapper div */
      $div?: JSX.HTMLAttributes<HTMLDivElement>,
      /** Optional, to enable code highlighting pass a function here that registers highlight languages */
      registerHljs?: () => void
    }
    ```

#### `defaultMarkdownOptions` ✅
- Requested `markdownItOptions` @ `<AceMarkdown />`, `<MarkdownItStatic />` & `<MarkdownItDynamic />` will be merged w/ these `defaultMarkdownOptions`
    ```ts
    import type { Options as MarkdownItOptions } from 'markdown-it'

    const defaultMarkdownOptions: MarkdownItOptions = {
      html: true,
      linkify: true,
      typographer: true
    }
    ```



## Code Highlight Markdown
1. Install: `npm i highlight.js -D`
1. Install: `npm i @highlightjs/cdn-assets -D`
1. Add `hljs: true` @ [`ace.config.js`](#ace-config) > `plugins` & then run `ace build local` OR `npm run dev` to get the `hljs` fundamentals
1. @ `src/global.d.ts` add `/// <reference path="../.ace/fundamentals/hljsDeclare.d.ts" />`
1. @ `app.css` add: `@import '@highlightjs/cdn-assets/styles/github-dark.min.css';`
    - [All available styles](https://github.com/highlightjs/highlight.js/tree/main/src/styles)
1. @ `src/init/registerHljs.ts` register the languages you'd love to support, example:
    ```ts
    import xml from '@ace/hljs/xml'
    import hljs from '@ace/hljs/core'
    import typescript from '@ace/hljs/typescript'

    let registered = false

    export function registerHljs() {
      if (!registered) { // Register typescript & xml for tsx (& then for tsx just use the language "ts") ❤️
        hljs.registerLanguage('xml', xml)
        hljs.registerLanguage('typescript', typescript)

        registered = true
      }
    }
    ```
1. Use Example:
    - 🚨 The components `<AceMarkdown />`, `<MarkdownItStatic />` & `<MarkdownItDynamic />` all use the props `registerHljs` & `markdownItOptions` the exact same way:
        ```ts
        import { AceMarkdown } from '@ace/aceMarkdown'
        import mdAppInfo from '@src/md/mdAppInfo.md?raw'
        import { registerHljs } from '@src/init/registerHljs'
        import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

        <AceMarkdown content={mdAppInfo} registerHljs={registerHljs} markdownItOptions={{ highlight: hljsMarkdownItOptions }} $div={{ class: 'markdown' }} />
        ```



## Enums
1. Simple:
    ```ts
    import { Enums, type InferEnums } from '@ace/enums'

    const voiceParts = new Enums(['Bass', 'Alto', 'Soprano'])

    type VoiceParts = InferEnums<typeof voiceParts>  // 'Bass' | 'Alto' | 'Soprano'

    console.log(voiceParts.has('Tenor')) // false

    console.log(voiceParts.keys.Bass) // 'Bass' & type-safe!
    ```
1. Complex:
    ```ts
    const businessTypes = new Enums([
      { key: 'llc', value: 'LLC' },
      { key: 'corporation', value: 'Corporation' },
      { key: 'soleProprietor', value: 'Sole Proprietor' },
    ])

    type BusinessTypes = InferEnums<typeof businessEntities> // { key: 'llc', value: 'LLC' } | { key: 'corporation', value: 'Corporation' } | { key: 'soleProprietor', value: 'Sole Proprietor' }

    type BusinessTypeKeys = BusinessTypes['key'] // 'llc' | 'corporation' | 'soleProprietor'
  
    type BusinessTypeValues = BusinessTypes['value'] // 'LLC' | 'Corporation' | 'Sole Proprietor'

    console.log(voiceParts.has('llc')) // true

    console.log(businessTypes.keys.soleProprietor) // 'soleProprietor'

    console.log(businessTypes.values.soleProprietor) // 'Sole Proprietor'
    ```
1. With Parsers:
    ```ts
    import { vEnums } from '@ace/vEnums'
    import { vParse } from '@ace/vParse'

    export const GET = new API('/api/example/:type', 'apiExample')
      .pathParams(vParse(object({ type: vEnums(businessTypes) }))) // allows: 'llc' | 'corporation' | 'soleProprietor'
      .resolve(async (scope) => {
        return scope.success(scope.pathParams)
      })
    ```



## Bits
- Bits are boolean signals
  ```ts
  <Show when={scope.bits.get('apiExample') === false} fallback={<Loading />}>
    <Loaded />
  </Show>
  ```
- To set a bit: `scope.bits.set(key, value)`
- To get a bit value: `scope.bits.get(key)`
- Anytime an api is loading you may get its loading state via: `scope.bits.get(apiName)`
    - This is how the `<Submit />` component knows to load based on the provided `bitKey` prop
      ```ts
      <form onSubmit={signOut}>
        <Submit label="Sign Out" bitKey="apiExample" $button={{class: 'brand'}} />
      </form>
      ```
- 🚨 Their value is either `true` | `false` | `undefined`
    - If we call `.get()` before we have called `.set()` then the value is `undefined`
    - Thanks to bits **3 possible values** we may know, if an api has not been called yet `undefined`, if it's loading `true` and if it's done loading `false`
- BTW: `scope` is provided to every `Route`, `Layout` & can be imported via: `import { scope } from '@ace/scopeComponent'`



## Modal Demo
- ✅ In any component create a modal via `<Modal id="lol" />`
- ✅ Allow a modal to be shown, hidden & watched anywhere w/ that `id`, ex: `showModal('lol')`
- Add to `app.tsx` => `import '@ace/modal.styles.css'` & then:
```tsx

import './Spark.css'
import { Route } from '@ace/route'
import { vBool } from '@ace/vBool'
import { Title } from '@solidjs/meta'
import { vParse } from '@ace/vParse'
import { createEffect } from 'solid-js'
import { object, optional } from 'valibot'
import RootLayout from '@src/app/RootLayout'
import { showModal, hideModal, onHideModal, isModalVisible, Modal } from '@ace/modal'


export default new Route('/spark')
  .layouts([RootLayout])
  .searchParams(vParse(object({ modal: optional(vBool()) })))
  .component(({ Go, SearchParams }) => {
    onHideModal('⚡️', () => Go({path: '/spark', replace: true})) // 💜 Typesafe Frontend Redirects

    createEffect(() => {
      if (SearchParams().modal) showModal('⚡️') // 💚 Typesafe Search Params
      else if (isModalVisible('⚡️')) hideModal('⚡️')
    })

    const show = () => Go({path: '/spark', searchParams: {modal: true}})

    return <>
      <Title>🧚‍♀️ Spark</Title>

      <button onClick={show} type="button">Show Modal</button>

      <Modal id="⚡️"> {/* 🚨 The id prop is how we identify modal's in helper functions :) */}
        <h1>Your creative spark will ignite something beautiful!</h1>
        <button onClick={() => hideModal('⚡️')} type="button">Hide Modal</button>
      </Modal>
    </>
  })
```



## Bind DOM Elements
1. Create a `ref` Function, example:
    ```ts
    // setting your desired element generics (ex: HTMLInputElement) as seen here allows this function to show errors @ compile time if this ref function is placed on anything other then an input, textarea or select ❤️

    // IF the ref function is w/in a <Show /> or <Switch /> THEN on unmount our ref functon is called w/ null. So the `if (!el) return` is defensive. The most consistent unmount option is onCleanup() as seen here b/c onCleanup() is called during the <Show /> case & any other case like, we went to a page w/o this dom element 💚

    import { onCleanup } from 'solid-js'

    export function refExample<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(random: string) {
      return (el: T | null) => { 
        if (!el) return

        const onInput = (e: Event) => {
          console.log({ e, random })
        }

        el.addEventListener('input', onInput)

        onCleanup(() => {
          el.removeEventListener('input', onInput)
        })
      }
    }
    ```
1. Apply `ref` Function, example:
    ```ts
    <input ref={refExample('❤️')} />
    ```
1. Apply multiple `ref` Functions, example:
    ```ts
    import { refs } from '@ace/refs'

    <input ref={refs(refAloha(), refNamaste()))} />
    ```



## Form Demo
- ✅ `FE` & `BE` validation shares the same `signInParser` schema
- ✅ No `Request` is made to the `BE` unless `FE` validation passes
- ✅ Error messages for each `input` show up next to that `input`
- ✅ IF `input` has error(s) AND start typing in `input` THEN clear that `inputs` error(s)
- ✅ Save `input` value on refresh OR on offline thanks to `refBind()` syncing our store (atom that can persist to indexdb) w/ the `input`

```ts
import { Submit } from '@ace/submit'
import { kParse } from '@ace/kParse'
import { apiSignIn } from '@ace/apis'
import { showToast } from '@ace/toast'
import { Messages } from '@ace/messages'
import { useStore } from '@src/store/store'
import { createOnSubmit } from '@ace/createOnSubmit'
import { signInParser } from '@src/parsers/signInParser'


export function SignIn() {
  const {store, refBind} = useStore()

  const onSubmit = createOnSubmit(() => {
    apiSignIn({
      body: kParse(signInParser, { email: store.signInFormEmail }),
      onSuccess: () => showToast({ type: 'success', value: 'Please check email inbox for sign in link!' }),
    })
  })

  return <>
    <form onSubmit={onSubmit}>
      <div class="form-item">
        <label>Email</label>
        <input ref={refBind('signInFormEmail')} name="email" type="email" />
        <Messages name="email" />
      </div>

      <Submit label="Sign In" bitKey="apiSignIn" $button={{ class: 'brand' }} />
    </form>
  </>
}
```
- Notes:
    - `useStore().store`
        - Provides access to atoms (ex: `store.signInFormEmail`)
    - `useStore().refBind()`
        - Provides 2 way data binding between inputs, textareas and/or selects AND a `store`
        - Way 1: on init THEN set `input` value w/ `store` value
        - Way 2: on `input` change THEN set `store` value w/ `input` value
        - Way 1 Plus 😎: on store value change THEN set `input` value w/ `store` value
        - Also adds a feature thanks to `refClear()` so that on input error messages @ `<Messages />` clear
    - [`kParse()`](#parser)
    - `createOnSubmit()`
        - Wraps our callback in a `try/catch` for us 
        - On FE or BE errors => Routes errors to `<Messages />` components by the `name` property
    - `refFormReset()`
        - A [`ref` function](#bind-dom-elements) is a way to define what we'd love an element to do w/in a function
        - Ensures `<Messages />` clear when `event.currentTarget.reset()` is called
    - `<Submit />`
        - Show the `<Loading />` when `scope.bits.get(bitKey)` is `true`
        - `$button` forwards props to the inner `<button />`



## Magic Link Demo
- Features:
    - ✅ JWT Create & Validate
    - ✅ Send Free Magic Link Email w/ Brevo
    - ✅ Collect no passwords (people forget passwords)
    - ✅ Know emails are valid b/c they gotta click the link
1. Create helpful types @ `src/lib/types.d.ts`:
    ```ts
    export type MagicLinkJWTPayload = { // data in magic link jwt
      tokenId: number
    }

    export type SessionJWTPayload = { // data in session jwt
      userId: number
      sessionId: number
    }

    export type Session = { // data in object we create if session jwt is valid
      sessionId: number
      userId: number
      isAdmin: boolean
      name: string
      partner: string | null
    }
    ```
1. `/api/sign-in` API POST endpoint that will check to see if the provided email is in the database and if it is will create a jwt token, create a magic link and then send an email w/ that link
    ```ts
    // our jwtCreate() function uses the web crypto api, so it'll work great in Node and on the Edge!


    import { API } from '@ace/api'
    import { eq } from 'drizzle-orm'
    import { msMinute } from '@ace/ms'
    import { dateShift } from '@ace/dateShift'
    import { jwtCreate } from '@ace/jwtCreate'
    import { MagicLinkJWTPayload } from '@src/lib/types'
    import { createRouteUrl } from '@ace/createRouteUrl'
    import { db, signInTokens, users } from '@src/lib/db'
    import { signInParser } from '@src/parsers/signInParser'
    import { sendBrevoTemplate } from '@ace/sendBrevoTemplate'


    export const POST = new API('/api/sign-in', 'apiSignIn')
      .body(signInParser)
      .resolve(async (scope) => {
        const result = await db.transaction(async (tx) => {
          const [dbUser] = await tx // get user in db based on their email
            .select({ userId: users.id, name: users.name, isAdmin: users.isAdmin, hasMadeAmsterdamDeposit: users.hasMadeAmsterdamDeposit  })
            .from(users)
            .where(eq(users.email, scope.body.email))

          if (!dbUser.userId) throw new Error('Invalid sign in')
        
          const ttl = 15 * msMinute

          const [dbToken] = await tx.insert(signInTokens) // add token in db
            .values({ userId: dbUser.userId, expiration: dateShift(ttl) })
            .returning({ tokenId: signInTokens.id })

          const tokenId = dbToken?.tokenId
          if (!tokenId) throw new Error('Session create error')

          const payload: MagicLinkJWTPayload = { tokenId }
          const token = await jwtCreate({ payload, ttl })

          const brevoResponse = await sendBrevoTemplate({ // send brevo email 
            templateId: 1,
            to: [{ email: scope.body.email, name: dbUser.name ?? '' }],
            params: { LINK: scope.requestUrlOrigin +  createRouteUrl('/magic-link/:token', {pathParams: {token}}) }
          })

          if (!brevoResponse.isSuccess) {
            throw new Error(brevoResponse.statusText)
          }

          return { ok: true }
        })

        if (result.ok) return scope.success()
        return scope.error('Sign in failed')
      })
    ```
1. Create the `/magic-link/:token` route that the email is pointing too:
    ```ts
    import './MagicLink.css'
    import { Route } from '@ace/route'
    import { Title } from '@solidjs/meta'
    import RootLayout from '../RootLayout'
    import { Loading } from '@ace/loading'
    import { apiMagicLink } from '@ace/apis'
    import { showErrorToast } from '@ace/toast'
    import { magicLinkParser } from '@src/parsers/magicLinkParser'


    export default new Route('/magic-link/:token')
      .layouts([RootLayout])
      .pathParams(magicLinkParser)
      .component((scope) => {
        apiMagicLink({
          queryType: 'maySetCookies',
          pathParams: scope.pathParams,
          onError (error) {
            scope.go('/members')
            if (error.message) showErrorToast(error.message)
          }
        })

        return <>
          <Title>🪄 Magic Link</Title>

          <main class="magic-link">
            <Loading color="var(--primary-color)" size="6rem" />
            <div class="label">Validating</div>
            <div class="message">Please do not navigate away</div>
          </main>
        </>
      })
    ```
1. Create `/api/magic-link` to validate jwt & set cookies!
    ```ts
    import { API } from '@ace/api'
    import { eq } from 'drizzle-orm'
    import { msWeek } from '@ace/ms'
    import { dateShift } from '@ace/dateShift'
    import { jwtCreate } from '@ace/jwtCreate'
    import { jwtCookieName } from '@src/lib/vars'
    import { jwtValidate } from '@ace/jwtValidate'
    import { db, sessions, signInTokens } from '@src/lib/db'
    import { magicLinkParser } from '@src/parsers/magicLinkParser'
    import { MagicLinkJWTPayload, SessionJWTPayload } from '@src/lib/types'


    export const GET = new API('/api/magic-link/:token', 'apiMagicLink')
      .pathParams(magicLinkParser)
      .resolve(async (scope) => {
        const ttlSession = msWeek

        const jwtMagic = await jwtValidate<MagicLinkJWTPayload>({jwt: scope.pathParams.token})

        if (jwtMagic.errorMessage) throw new Error(jwtMagic.errorMessage)

        const {userId, sessionId} = await db.transaction(async (tx) => {
          if (!jwtMagic.payload?.tokenId) throw new Error('Invalid sign in, b/c token does not contain w/in it a tokenId, please try signing in again')
          
            const [resGetSignInToken] = await tx // find token in db based on tokenId in jwt 
            .select({ tokenId: signInTokens.id, userId: signInTokens.userId, expiration: signInTokens.expiration })
            .from(signInTokens)
            .where(eq(signInTokens.id, jwtMagic.payload.tokenId))

          const { tokenId, userId, expiration } = resGetSignInToken ?? {}

          if (!tokenId || !userId || !expiration) throw new Error('Invalid sign in, b/c sign in email links may only be used once, please try signing in again')
          if (expiration <= new Date()) throw new Error('Invalid sign in, b/c the email link expired')

          const [resCreateSession] = await tx.insert(sessions) // add session in db
            .values({ userId, expiration: dateShift(ttlSession) })
            .returning({ sessionId: sessions.id })

          const sessionId = resCreateSession?.sessionId
          if (!sessionId) throw new Error('Invalid sign in, b/c there was an error creating the session in the database, please try signing in again')

          await tx.delete(signInTokens).where(eq(signInTokens.id, tokenId)) // remove magic link token from db

          return { userId, sessionId }
        })

        const payload: SessionJWTPayload = {userId, sessionId}

        const maxAge = ttlSession / 1000 // jwt exp and session maxAge is in seconds / db is in milliseconds

        const jwt = await jwtCreate({ ttl: maxAge, payload })

        scope.setCookie(jwtCookieName, jwt, { maxAge })

        return scope.go('/members')
      })
    ```
1. Create a `src/auth/getSession.ts` for us to call @ `sessionB4()`:
    ```ts
    import { eq } from 'drizzle-orm'
    import { ScopeBE } from '@ace/scopeBE'
    import { datePast } from '@ace/datePast'
    import { goSignIn } from './goSignIn'
    import { jwtValidate } from '@ace/jwtValidate'
    import { sessionCookieName } from '@src/lib/vars'
    import { db, users, sessions } from '@src/lib/db'
    import type { Session, SessionJWTPayload } from '@src/lib/types'


    export async function getSession(scope: ScopeBE) {
      const jwt = await jwtValidate<SessionJWTPayload>({ jwt: scope.getCookie(sessionCookieName) }) 

      if (!jwt.isValid) {
        if (jwt.payload) { // they signed in
          scope.clearCookie(sessionCookieName)

          if (jwt.payload.sessionId) await db.delete(sessions).where(eq(sessions.id, jwt.payload.sessionId)) // delete from db
        }

        throw goSignIn(scope) // jwt is invalid
      }

      const [dbUser] = await db
        .select({
          name: users.name,
          isAdmin: users.isAdmin,
          sessionId: sessions.id,
          partner: users.partner,
          expiration: sessions.expiration,
        })
        .from(users)
        .innerJoin(sessions, eq(sessions.userId, users.id)) // ensure session exists (delete from db if wanna invalidate)
        .where(eq(sessions.id, jwt.payload.sessionId))

      if (!dbUser?.sessionId) throw goSignIn(scope)

      if (datePast(dbUser.expiration)) throw goSignIn(scope) // altering db date can expire token too

      const session: Session = {
        userId: jwt.payload.userId,
        sessionId: jwt.payload.sessionId,
        isAdmin: dbUser.isAdmin,
        name: dbUser.name,
        partner: dbUser.partner
      }

      return session
    }
    ```
1. `goSignIn()` is just a simple navigation helper
    ```ts
    import type { ScopeBE } from '@ace/scopeBE'
    import type { ScopeComponent } from '@ace/scopeComponent'


    export function goSignIn(scope: ScopeBE | ScopeComponent) {
      return scope.go('/members/:auth?', { pathParams: { auth: 'sign-in' } })
    }
    ```



## Create Password Hash
### Here's a way to hash @ the Edge (ex: Cloudflare Workers) or @ Node!
1. `import { hashCreate } from @ace/hashCreate`
1.  `hashCreate({ password, saltLength = 16, iterations = 99_999, hashFn = 'SHA-512' })()`
    - `@param props.password` - The plaintext password to hash
    - `@param props.saltLength` - The National Institute of Standards and Technology (NIST) recommends a random salt length of 16 so we do to. `(default is 16)`
    - `@param props.iterations` - We recommend 300_000 to 1_000_000 iterations in Node for high security & fast performance `(default is 99_999)`. The default is 99_999 b/c that is the max allowed in the browser, aka @ Cloudflare Workers. More iterations = More security = Slower performance, Test & time, a good ballpark time is 100 to 300ms
    - `@param props.hashFn` - `SHA-512 (default)` w/ default saltLength & iterations is far beyond classical brute-force capabilities. SHA-256 is slightly weaker but faster.
1. `import { hashValidate } from @ace/hashValidate`
1. `hashValidate({ password, hash })`
    - `@param props.password` - The plaintext password to validate agains the hash
    - `@param props.hash` - Hash string response from `hashCreate()`



## Live Data without Browser Refresh
![Ace Live Server](https://i.imgur.com/BtKtzWk.png)
1. Create an **Ace Live Server** (`Cloudflare Worker` + `Cloudflare Durable Object` that uses [hibernating web sockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets)), bash:
    ```bash
    npx create-ace-live-server@latest
    ```
1. Start your `Ace Live Server` via `npm run dev`
1. Now back @ your Website code:
    1. Add `liveHosts` to `ace.config.js`
        ```js
        export const config = {
          liveHosts: {
            local: 'localhost:8787',
            prod: 'live.example.com'
          }
        }
        ```
    1. **Subscribe** to events w/ [ScopeComponent](#scope):
        ```ts
        onMount(() => {
          const ws = scope.liveSubscribe({ stream: 'example' })

          ws.addEventListener('message', event => {
            console.log(event.data)
          })

          onCleanup(() => scope.liveUnsubscribe(ws))
        })
        ```
    1. **Create Events** w/ [ScopeBE](#scope):
        ```ts
        const res = await scope.liveEvent({ // ScopeBE
          stream: 'example',
          data: { aloha: true }, // Event data, the entire object will be provided to `/subscribe`
          requestInit: { headers: { LIVE_SECRET: process.env.LIVE_SECRET } }, // Optional, is merged w/ the `defaultInit` of `{ method: 'POST', body: JSON.stringify(props.data), headers: { 'Content-Type': 'application/json' } }`
        })
        ```
1. 🚨 IF you would love to send messages from the browser `ws` THEN add an `onMessage` callback @ `createLiveDurableObject()`, example:
    ```ts
    import { createLiveWorker, createLiveDurableObject } from '@ace/liveServer'


    export default createLiveWorker() satisfies ExportedHandler<Env>


    export const LiveDurableObject = createLiveDurableObject({
      onMessage(props) {
        console.log('props', props)
      }
    })
    ```
1. 🚨 & IF you would love to secure your `Ace Live Server`, example:
    ```ts
    import { jwtValidate } from '@ace/jwtValidate'
    import { createLiveWorker, createLiveDurableObject, readCookie } from '@ace/liveServer'


    export default createLiveWorker() satisfies ExportedHandler<Env>


    export const LiveDurableObject = createLiveDurableObject({
      onValidateEvent(request) { // IF valid THEN no return AND IF invalid THEN return Response
        if (request.headers.get('live_secret') !== process.env.LIVE_SECRET) { // to create a password "ace password" in bash ❤️ & place this password in the .env of your app & the .env of your live server, so that only your app can call /event
          return new Response('Unauthorized', { status: 400 })
        }
      },
      async onValidateSubscribe(request) { // IF valid THEN no return AND IF invalid THEN return Response
        const jwt = readCookie(request, 'aceJWT')
        const res = await jwtValidate({ jwt })
        if (!res.isValid) return new Response('Unauthorized', { status: 400 })
      }
    })
    ```
  - 🚨  Cookies can be shared between `Website` & `Ace Live Server`, IF:
      - on `localhost` OR
      - `Ace Live Server` is deployed to a website sub-domain AND the cookie is set like this: 
          ```ts
          import { env } from '@ace/env'
          import { msWeek } from '@ace/ms'
          import { sessionCookieName } from '@src/lib/vars'

          const maxAge = msWeek / 1000 // session maxAge is in seconds

          scope.setCookie(sessionCookieName, jwt, {
            maxAge,
            domain: env == 'prod'
              ? '.example.com' // allows us to set cookies @ example.com & read cookie @ live.example.com
              : undefined
          })
          ```
1. To deploy your `Ace Live Server` w/ **git push**, follow our [deploy directions here](#deploy)!
1. 🚨 To place `Ace Live Server` @ a subdomain so you may share cookies w/ your `App`, in your `wrangler.jsonc` set `routes` to: 
    ```json
    {
        "routes": [
        {
          "pattern": "live.example.com",
          "zone_id": "123456789",
          "custom_domain": true
        }
      ]
    }
    ```


## Open Graph Demo
#### ✅ Helpful when people post a link to your site on places like `Facebook`, `Discord` or `Slack` & you'd love an image & specific information to show
1. Take a screenshot of the website OR use an existing image
    - Using an existing image makes sense if this is for example a product page so just use an existing product image
    - If using a screenshot, before adding it to your `/public` folder, we recommend [sqooshing](https://squoosh.app/editor) your image (reduces size by +70% & still looks really good), so it loads quickly & is accepted by the 3rd party showing your link
1. Add `<Meta />` tags, [og meta tags info](https://ogp.me/)
    ```ts
    import './Home.css'
    import { Route } from '@ace/route'
    import { buildOrigin } from '@ace/env'
    import { Title, Meta } from '@solidjs/meta'


    export default new Route('/')
      .component(() => {
        return <>
          <Title>🏡 Home · Create Ace App</Title>
          <Meta property="og:title" content="🏡 Home · Create Ace App" />
          <Meta property="og:type" content="website" />
          <Meta property="og:url" content={buildOrigin} />
          <Meta property="og:image" content={buildOrigin + '/og/home.webp'} />
          <Meta property="og:description" content="The home page for Create Ace App!" />

          <main class="home">
            <h1>Home Page</h1>
          </main>
        </>
      })
    ```
1. [Preview](https://www.opengraph.xyz/) open graph, [deploy](#deploy) required btw!


## SVG Demo
- `src/lib/svgs.tsx`
    ```ts
    /**
     * - 200,000 free icons: https://icones.js.org/collection/all
     * - This file if for svg icons, not for huge svg's they can go in their own file & added to an <img /> src
     * - SVG's as functions is nice once you wanna send props like height & width
    */

    /**
     * - How it works:
     * - Solid treats the function output as static content
     * - So when we call svg_refresh(), Solid runs the function once and returns a static JSX element (DOM node)
     * - Because this function has no reactive data sources, Solid has no reason to re-run it.
     * - The resulting <svg> will be inserted into the DOM once and will never re-render again unless a signal is passed as a prop to the function ex: <button>{svg_refresh(size())}</button>
    */

    export const svg_refresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44c-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71z"/></svg>

    export const svg_up = () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m11 8.8l-2.9 2.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.6-4.6q.3-.3.7-.3t.7.3l4.6 4.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275L13 8.8V17q0 .425-.288.713T12 18t-.712-.288T11 17z" /></svg>
    ```



## Add Custom Fonts
1. Place the `VariableFont_wght` > `.tff` file in the `/public` folder, ex: `public/fonts/Quicksand.ttf`
1. Add font css: `src/app.css`
    ```css
    :root {
      --font-family: "Quicksand", sans-serif;
    }

    @font-face {
      font-family: 'Quicksand';
      src: url('/fonts/Quicksand.ttf') format('truetype');
      font-weight: 100 900; /* Adjust according to the font's weights */
      font-style: normal;
    }
    ```
1. Bind `app.css` @ `src/app.tsx`
    ```ts
    import './app.css' // when importing css that is not from @ace, Vite requests relative paths
    import '@ace/tabs.styles.css'
    import '@ace/toast.styles.css'
    import '@ace/modal.styles.css'
    import '@ace/loading.styles.css'
    import '@ace/slideshow.styles.css'
    import { createApp } from '@ace/createApp'
    import { StoreProvider } from '@src/store/store'


    export default createApp([StoreProvider])
    ```

1. Apply font css in any css file:
    ```css
    body,
    html,
    #app {
      font-family: var(--font-family);
    }
    ```



## Loading Spinner Component
- Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
  ```tsx
  <Show when={scope.bits.get('apiExample')} fallback={<Loaded />}>
    <Loading />
  </Show>
  ```
- 👷‍♀️ Component Props:
  - `type` - Optional, spinner type: `'one' (default) or 'two'`
  - `width` - Optional, spinner width, `default: 2.1rem`
  - `height` - Optional, spinner height, `default: 2.1rem`
  - `thickness` - Optional, spinner thickness, `default: 0.3rem`
  - `speed` - Optional, spinner speed, `default: 1s`
  - `twoColor` - Optional, if type is `two`, this will set the color for the 2nd spinner, `default: white`
  - `label` - Optional, text to announce to screen readers, `default: 'Loading...'`
  - `spanProps` - Optional, additional props to spread onto the outer `span`

- 🎨 Custom CSS Variables:
  - `--ace-loading-color`: Primary color, default: `gold`
  - `--ace-loading-two-color`: Secondary color for `type="two"`, default: `white`
  - `--ace-loading-width`: Spinner width, default: `2.1rem`
  - `--ace-loading-height`: Spinner height, default: `2.1rem`
  - `--ace-loading-thickness`: Spinner thickness, default: `0.3rem`
  - `--ace-loading-speed`: Spin speed, default: `1s`



## Show Toast Notifications
- Add to `app.tsx` => `import '@ace/toast.styles.css'` & then:
- Dark Mode
  ```ts
    // value may be an array or a string
    // by default visible for 9 seconds, to alter set ms prop, to show till they close set ms to Infinity

    showToast({ type: 'info', value: 'Aloha' })
    showErrorToast('Uh oh!') // visible till they close
    showToast({ value: ['Light', 'Info'], type: 'info', toastProps: {style: toastStyleLight} }) // light mode
  ```
- Custom Styles w/ css, CSS:
  ```css
  #ace-toast-wrapper {
    .toast.emerald {
      --ace-toast-bg: rgb(6, 95, 70);
      --ace-toast-border: 1px solid rgb(16, 185, 129);
      --ace-toast-icon-color: rgb(6, 78, 59);
      --ace-toast-icon-border: 1px solid rgb(16, 185, 129);
      --ace-toast-icon-bg: rgb(209, 250, 229);
      --ace-toast-close-color: rgb(134, 239, 172);
      --ace-toast-close-hover-border: rgb(52, 211, 153);
      --ace-toast-close-hover-bg-color: rgba(16, 185, 129, 0.2);
    }
  }
  ```
- Custom Styles w/ css, TSX:
  ```tsx
  import { Route } from '@ace/route'
  import { showToast } from '@ace/toast'

  export default new Route('/')
    .component(() => {
      return <button onClick={() => showToast({ value: 'Emerald 🌿', toastProps: {class: 'toast emerald'} })}>Emerald 🌿</button>
    })
  ```
- Custom Styles w/ only tsx:
  ```tsx
  import { Route } from '@ace/route'
  import type { JSX } from 'solid-js'
  import { showToast, toastStyleLight } from '@ace/toast'

  export default new Route('/')
    .component(() => {
      const toastStyleLavender: JSX.CSSProperties = {
        ...toastStyleLight,
        '--ace-toast-bg-color': 'rgb(243, 232, 255)',
        '--ace-toast-text-color': 'rgb(76, 29, 149)',
        '--ace-toast-border': '1px solid rgb(192, 132, 252)',
        '--ace-toast-icon-color': 'rgb(109, 40, 217)',
        '--ace-toast-icon-border': '1px solid rgb(192, 132, 252)',
        '--ace-toast-icon-bg': 'rgb(233, 213, 255)',
        '--ace-toast-close-color': 'rgb(139, 92, 246)',
        '--ace-toast-close-hover-border': 'rgb(167, 139, 250)',
        '--ace-toast-close-hover-bg-color': 'rgba(165, 180, 252, 0.2)',
      }

      return <button onClick={() => showToast({ value: 'Custom Lavender 💜', toastProps: {style: toastStyleLavender} })}>Custom Lavender 💜</button>
    })
  ```



## Tabs Component
- Add to `app.tsx` => `import '@ace/tabs.styles.css'`
- Add `import { Tabs } from '@ace/tabs'` to the page w/ tabs, & then:
- Tabs that show content below:
  ```tsx
  <Tabs
    mode="content"
    variant="classic"
    tabs={[
      new ContentTab('Tab 1', <>Tab 1</>),
      new ContentTab('Tab 2', <>Tab 2</>),
      new ContentTab('Tab 3', <>Tab 3</>),
    ]}
  />
  ```
- Tabs that navigate routes:
  ```tsx
    <Tabs
      mode="route"
      variant="pill"
      tabs={[
        new RouteTab('Home', '/'),
        new RouteTab('About', '/about'),
        new RouteTab('Members', '/members'),
      ]}
    />
  ```
- Tabs that scroll to content:
  ```tsx
  <Tabs
    name="nav"
    mode="scroll"
    variant="underline"
    scrollMargin={74}
    tabs={[
      new HashTab('Home', '#banner'),
      new HashTab('Offerings', '#carousel'),
      new HashTab('Spiritual Retreats', '#retreats'),
    ]}
  />
  ```
- Tab helper functions:
  ```ts
  setActiveByTabIndex('nav', 2)
  setActiveByPath('route', '/')
  setActiveByHash('hash', '#bio')
  ```



## Radio Cards Component
- Creates radio buttons but each seletion is a card
- Add to `app.tsx` => `import '@ace/radioCard.styles.css'` & then:
  ```tsx
  import { RadioCards, blueActiveStyle, greenActiveStyle, purpleActiveStyle } from '@ace/radioCards'

  <RadioCards
    name="color"
    value="blue"
    label="Choose color"
    activeStyle={purpleActiveStyle} // defaults to blueActiveStyle
    onChange={(val) => console.log(val)}
    radios={[
      { id: 'red', value: 'red', title: 'Red', checked: true },
      { id: 'blue', value: 'blue', title: 'Blue', slot: <div>🌊</div> },
      { id: 'green', value: 'green', title: 'Green', disabled: true }
    ]}
  />
  ```



## Slidshow Component
- Slides are tsx, so they can be images and / or html :)
- Add to `app.tsx` => `import '@ace/slideshow.styles.css'` & then:
  ```tsx
  import './Home.css'
  import slide1 from './slide1.webp'
  import slide2 from './slide2.webp'
  import slide3 from './slide3.webp'
  import slide4 from './slide4.webp'
  import slide5 from './slide5.webp'
  import { Route } from '@ace/route'
  import { Slideshow } from '@ace/slideshow'

  export default new Route('/')
    .component(() => {
      const slides = [
        <img src={slide1} />,
        <img src={slide2} />,
        <img src={slide3} />,
        <img src={slide4} />,
        <img src={slide5} />,
      ]

      return <>
        <main class="home">
          <Slideshow items={() => slides} />
        </main>
      </>
    })
  ```



## Ace Config
- Please place @ `ace.config.js`
- Example:
    ```js
    // @ts-check 

    /** @type {import('@acets-team/ace').AceConfig} */
    export const config = {
      sw: true,
      apiDir: './src/api',
      appDir: './src/app',
      logCaughtErrors: true,
      origins: {
        local: ['http://localhost:3000', 'http://localhost:3001']
      },
      plugins: {
        solid: true,
        agGrid: true,
        chartjs: true,
        valibot: true,
        markdownIt: true,
      }
    }
    ```
- Details:
    ```js
    export type AceConfig = {
      /** The directory that holds your api files */
      apiDir?: string,
      /** The directory that holds your routes and layouts */
      appDir?: string,
      /** Ace is a set of helpful files we call fundamentals. Fundamentals are grouped by plugins. Set a plugin to true to gain access to the fundamentals it holds. */
      plugins: PluginsConfig,
      /** Default is `tsconfig.json`, helps us resolve aliases */
      tsConfigPath?: string,
      /** The `key` is the `env` which is set w/ the build command, ex: `ace build local`, in this example the key is `local`. The value is a `string` or `array` of `strings` which are the allowed origins. 🚨 If your origin is '*' cookies won't work, not an Ace limitation, that's just how HTTP work :) */
      origins: Record<string, string | string[]>
      /** 
      * - When set to true 
      * - On build => IF `config.sw` = `true` THEN file in `public` directory that starts w/ `sw` and is a `.js` file is renamed to `sw_[package dot json version].js` - Helps maintain alignment between app versions and cache versions
      * @example
        ```ts
        import { createRequire } from 'node:module'
        const { version } = createRequire(import.meta.url)('./package.json')
        ```
      * 
      */
      sw?: boolean
      /**
      * - Optional, defaults to `_info`
      * - Messages are grouped by name: `Map<string, Signal<string[]>>`
      * - Messages are read from `response.error.messages` & typically have `valibot` / `zod` errors
      * - If `response.error.message` is defined, we'll put that value @ `mesages[defaultMessageName] = [response.error.message]`
      */
      defaultMessageName?: string
      /**
      * - Optional, defaults to `❌ Sorry but an error just happened`
      * - If no other error is provided we'll show this
      */
      defaultError?: string
      /**
      * - The key aligns w/ the keys @ `ace.config.js` > `origins`
      * - The value is the host url to the Ace Live Server when @ that `origin`
      * - 🚨 Host meaning no `http://` like this: `liveHosts: { local: 'localhost:8787', prod: 'live.example.com' }`
      */
      liveHosts?: Record<string, string>
      /** Would you like to log errors */
      logCaughtErrors?: boolean,
      /** 
      * - Optional, Specify an `id` and the `path` to a folder of markdowns from the current working directory
      * - When defined the `mdFolders` will get a `parseMarkdownFolders()` helper created at build time
      */
      mdFolders?: { id: string, path: string }[]
    }
    ```



### Ace Plugins:
  ```js
  export type PluginsConfig = {
    /**
    * Enables **SolidJS** fundamentals (helpful modules @ `./ace`)
    *
    * Requires the following npm dev imports:
    * - `solid-js`
    * - `@solidjs/meta`
    * - `@solidjs/start`
    * - `@solidjs/router`
    * 
    * @link https://docs.solidjs.com/
    */
    solid?: boolean

    /**
    * Enables **Valibot** fundamentals (helpful modules @ `./ace`)
    *
    * Requires the following npm dev imports:
    * - `valibot`
    * 
    * @link https://valibot.dev/guides/comparison/
    */
    valibot?: boolean

    /**
    * Enables **Zod** fundamentals (helpful modules @ `./ace`)
    *
    * Requires the following npm dev imports:
    * - `zod`
    * 
    * @link https://zod.dev/
    */
    zod?: boolean

    /**
    * Enables **Turso** fundamentals (helpful modules @ `./ace`)
    *
    * Requires the following npm dev imports:
    * - `@libsql/client`
    * - `drizzle-orm`
    * 
    * @link https://turso.tech/
    */
    turso?: boolean

    /**
    * Enables **AgGrid** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following npm dev imports:
    *     - `ag-grid-community`
    * @link https://www.ag-grid.com/
    */
    agGrid?: boolean

    /**
    * Enables **Brevo** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following `.env` variable:
    *     - `process.env.BREVO_API_KEY`
    *
    * @link https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys
    * @link https://developers.brevo.com/docs/send-a-transactional-email
    * @link https://developers.brevo.com/docs/how-it-works
    * @link https://www.cloudflare.com/en-gb/ips/
    */
    brevo?: boolean

    /**
    * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following npm dev imports:
    *     - `markdown-it`
    *
    * @link https://www.npmjs.com/package/markdown-it
    */
    markdownIt?: boolean


    /**
    * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following npm dev imports:
    *     - `highlight.js`
    *     - `@highlightjs/cdn-assets`
    *
    * @link https://highlightjs.readthedocs.io/
    */
    hljs?: boolean

    /**
    * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following npm dev imports:
    *     - `wrangler`
    *     - `@cloudflare/workers-types`
    *
    * @link https://developers.cloudflare.com/durable-objects/
    */
    cf?: boolean

    /**
    * Enables **Chart.js** fundamentals (helpful modules @ `./ace`)
    * 
    * - Requires the following npm dev imports:
    *     - `chart.js`
    *
    * @link https://www.chartjs.org/
    */
    chartjs?: boolean
  }
  ```



## When to restart dev?
- It only takes 3 seconds, but it's important to restart dev sometimes (in bash `control + c` & then `npm run dev`), b/c HMR updates the majority of types but a restart updates them all, so please restart dev when:
    - An `API` is `created/deleted`
    - A `Route` is `created/deleted`
    - A `Layout` is `created/deleted`
    - A `Layout` is `added/removed` from a `new Route()` or `new Route404()`'s `.layout([])`



## IF developing multiple Ace projects simultaneously
    To mimic real life locally, when switching projects but not domains..
    Please ensure localhost:3000 is clean!
    So no left over local storage, index db or service workers!
#### When you are switching from one project to another please follow these steps:
1. @ `Chrome` > `Inspect` > `Application` delete all:
    - `Cookies` 
    - `Cache Storage`
1. Fully wipe fe cache, paste in browser console:
    ```ts
    (async () => {
        // Unregister all service workers
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();

        // Delete all caches
        const cacheNames = await caches.keys();
        for (const name of cacheNames) await caches.delete(name);

        // Clear IndexedDB
        if (indexedDB.databases) {
            const dbs = await indexedDB.databases();
            for (const db of dbs) indexedDB.deleteDatabase(db.name);
        }

        // Clear local & session storage
        localStorage.clear();
        sessionStorage.clear();
    })()
    ```
1. IF you do not see `Promise {<pending>}` in the console after pasting the above in, close console, reopen console & try again please
1. 🚨 Close ALL `localhost:3000` tabs
1. `Force Quit` browser then open it back up (& can reopen previous tabs)



## Environment Variables
1. Add `nodejs_compat` @ `compatibility_flags`, example:
  ```json
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "create-ace-app",
    "compatibility_date": "2025-10-30",
    "compatibility_flags": [
      "nodejs_compat"
    ],
    "observability": {
      "enabled": true
    },
  }
  ```
1. Add environment variable @ `.env`, example:
    - `EXAMPLE=PTvbxCQo0999SeBssjmzp4jY-BveJJm6Pn3sKPiDIev95-dRF7iiLB0N0L0UkxX9bB9VIdHcUVQbQvNlyxPQxA`
    - If you need to create a password **(secure + random + 64 bytes)**, bash: `ace password`
        - In order to use scripts in any `bash terminal` and not just as a `package.json` > `script` it is required to globally install the package, so `ace password` requires `npm i @acets-team/ace -g`, that's just how npm works :)
1. @ server side code call `process.env.EXAMPLE`
1. To add the environment variable to a live cloudflare worker `npx wrangler secret put EXAMPLE`



## Environment Information
- When we run `ace build local` the text after `ace build` is the current environment so in this example the current environment is `local` & with `ace build prod` the current environment is `prod`
- Because this command is done @ build time, we have access to this variable @ compile time & @ runtime, on the `FE` or `BE`, example:
  ```ts
  import { env } from '@ace/env'

  console.log(env) // local
  ```



## Origin Information
1. `configOrigins:`
    - Available via `import { configOrigins } from '@ace/env'`
    - Aligns  [`ace.config.js`](#ace-config) > `origins` w/ the current `ace build <env>`
    - The resulting `Set` tells us, all the origins we support for the current `environment` @ build time
    - Helpful for validating incoming request origins (ex: during CORS checks)
1. `buildOrigin:`
    - Available via `import { buildOrigin } from '@ace/env'`
    - The expectected/primary server origin @ build time
    - A static value that comes from `ace.config.js` during `ace build <env>`
    - 🚨 IF the current  `ace.config.js` > `origins` > `env` has more then 1 origin defined, the first origin defined will be used here, example: for `prod: ['https://example.com', 'https://www.example.com']` the `buildOrigin` will be `https://example.com`
    - Helps us:
        - Know the expectected/primary origin w/ no request context
    - Ideal for:
        - Build time url generation (ex: Open graph meta tags, frontend urls)
1. `scope.requestUrlOrigin`
    - Available from [`ScopeBE`](#scope)
    - The origin of the current HTTP request URL
    - Helps us:
        - Know where the current request was received
    - Ideal for:
        - Creating absolute run time urls on the BE that match the active server (ex: magic link)
        - CORS Validation (ensure requestUrlOrigin matches allowed configOrigins)



## Add Tailwind
1. `Bash`
    ```bash
    npm install -D tailwindcss@latest postcss autoprefixer @tailwindcss/vite
    ```
1. In `src/app.css`:
    ```css
    @import "tailwindcss";
    ```
1. In `app.config.ts`:
    ```ts
    import tailwindcss from '@tailwindcss/vite'
    import { defineConfig } from '@solidjs/start/config'

    export default defineConfig({
      vite: {
        plugins: [tailwindcss()]
      }
    })
    ```
1. Tailwind [Cheatsheet](https://nerdcave.com/tailwind-cheat-sheet)
1. Download the tailwind vscode extension
    1. Click Extensions
    1. Search: `bradlc.vscode-tailwindcss`
    1. Install extension
    1. Reload Vscode



## Turso Demo
1. [Install Turso locally & Sign In](https://docs.turso.tech/quickstart)
1. Install: `npm i @libsql/client -D`
1. Install: `npm i drizzle-orm -D`
1. Install: `npm i drizzle-kit -D`
1. Add `turso: true` to `ace.config.ts` > `plugins` & then run `ace build local` OR `npm run dev` to import turso fundamentals
1. Create [`./drizzle.config.ts`](https://orm.drizzle.team/docs/drizzle-config-file), example:
    ```ts
    // Helps Drizzle CLI connect to DB

    import type { Config } from 'drizzle-kit'
    import { env } from './.ace/fundamentals/env'

    let dbCredentials

    if (env === 'local') dbCredentials = { url: 'http://127.0.0.1:8080', }
    else {
      if (!process.env.TURSO_DATABASE_URL) throw '!process.env.TURSO_DATABASE_URL'
      if (!process.env.TURSO_AUTH_TOKEN) throw '!process.env.TURSO_AUTH_TOKEN'

      dbCredentials = {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    }

    export default {
      dbCredentials,
      out: './migrations',
      schema: './src/db/db.ts',
      dialect: env === 'local' ? 'sqlite' : 'turso',
    } satisfies Config
    ```
1. Create a `db.ts` file @ `/src/db/db.ts`, example:
    ```ts
    //  Helps Application connect to DB

    import { env } from '@ace/env'
    import { relations } from 'drizzle-orm'
    import { tursoConnect } from '@ace/tursoConnect'
    import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'


    export const posts = sqliteTable('posts', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      title: text('title').notNull(),
      slug: text('slug').notNull().unique(),
      displayOrder: integer('displayOrder').notNull(),
      content: text('content').notNull(),
      groupId: integer('groupId').references(() => postGroups.id).notNull(),
      createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(new Date()),
    })


    export const postGroups = sqliteTable('postGroups', {
      id: integer('id').primaryKey({ autoIncrement: true }),
      title: text('title').notNull(),
      displayOrder: integer('displayOrder').notNull(),
    })


    export const postsRelations = relations(posts, ({ one }) => ({
      group: one(postGroups, {
        fields: [posts.groupId],
        references: [postGroups.id],
      })
    }))


    export const postGroupsRelations = relations(postGroups, ({ many }) => ({
      posts: many(posts)
    }))


    export const { db, client } = tursoConnect({
      local: env === 'local' ? 'http://127.0.0.1:8080' : null,
      drizzleConfig: {
        schema: {
          posts,
          postGroups,
        }
      }
    })
    ```
1. Add to `package.json` > `scripts`
    ```json
    {
      "db:local": "turso dev --db-file ./src/db/local.db",
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:studio": "npx drizzle-kit studio",
      "db:push": "ace build prod && npm run db:migrate && ace build local",
    }
    ```
1. Create migrations locally: `npm run db:generate`
1. Review newly created `migrations` folder `sql`
1. Start local database
    1. Terminal 1: `npm run db:local`
    1. Terminal 2: `npm run db:studio`
1. Apply migrations:
   - Local:
       1. `ace build local`
       1. `npm run db:migrate`
   - Production:
       1. `ace build prod`
       1. `npm run db:push`
       1. `npm run db:studio` to view prod data locally
1. 🚨 How it works:
    - The `env` @ `ace build <env>` determines the current db during `npm run db:studio` AND `npm run db:migrate`
    - So to:
        - Push locally: `ace build local && npm run db:migrate`
        - Push to prod: `ace build prod && npm run db:migrate` OR `npm run db:push`
        - View local data: `ace build local && npm run db:studio`
        - View prod data: `ace build prod && npm run db:studio`
    - Note: `npm run dev` does an `ace build local` btw ❤️
1. In your `.env` file add your Turso production credentials, example:
    ```toml
    TURSO_DATABASE_URL="libsql://your-db.turso.io"
    TURSO_AUTH_TOKEN="your-secret-auth-token"
    ```



## AgGrid Demo
- This table can:
    - ✅ Scroll
    - ✅ Paginate
    - ✅ Column Sort
    - ✅ Custom Theme
    - ✅ Add filters to columns
    - ✅ Only build from AgGrid what we use
1. Install: `npm i ag-grid-community -D`
1. Theme: `src/agGrid/themeAgGrid.ts`
    ```ts
    import { Theme, themeQuartz } from 'ag-grid-community'

    let theme: undefined | Theme<any>

    export function themeAgGrid() {
      if (!theme) {
        theme = themeQuartz.withParams({
          fontSize: '1.71rem',
          headerFontWeight: 600
        })
      }

      return theme
    }
    ```
1. Register: `src/agGrid/registerAgGrid.ts`
    ```ts
    // This way only the things used from ag-grid-community will be in your build


    import { ModuleRegistry, ClientSideRowModelModule, DateFilterModule, TextFilterModule, CellStyleModule } from 'ag-grid-community'

    let registered = false

    export function registerAgGrid() {
      if (!registered) {
        ModuleRegistry.registerModules([ClientSideRowModelModule, DateFilterModule, TextFilterModule, CellStyleModule])
        registered = true
      }
    }
    ```
1. Implement:
    ```ts
    // sync() is great for arrays, by default it does a reconcile() by "id" to keep DOM updates optimal


    import { AgGrid } from '@ace/agGrid'
    import { useStore } from '@src/store/store'
    import { agGridComponent } from '@ace/agGridComponent'
    import { randomArrayItem } from '@ace/randomArrayItem'
    import { agGridCellRenderer } from '@ace/agGridCellRenderer'

    function Transactions() {
      const {sync, store} = useStore()
      const defaultTransactionsCount = 15

      const addTransaction = () => {
        sync('transactions', [
          ...store.transactions, 
          { id: store.transactions.length, date: date2Iso(new Date()), description: randomArrayItem(emojis), amount: randomBetween(-6000, 9000) }
        ])
      }

      const refreshTransactions = () => {
        sync('transactions', store.transactions.slice(0, defaultTransactionsCount))
      }

      return <>
        <div class="viz">
          <div class="head">
            <h2>📆 Transactions</h2>
            <div class="buttons">
              <Show when={store.transactions.length > defaultTransactionsCount}>
                <Refresh onClick={refreshTransactions} tooltipContent="Refresh Transactions" />
              </Show>
              <button class="brand" onClick={addTransaction}>Add Transaction</button>
            </div>
          </div>

          <div class="body">
            <AgGrid 
              register={registerAgGrid}
              gridOptions={() => ({
                theme: themeAgGrid(),
                rowData: store.transactions,
                defaultColDef: { flex: 1, sortable: true, resizable: true },
                columnDefs: [
                  {
                    sort: 'desc',
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    cellRenderer: agGridCellRenderer({ component: TableCellDate }),
                  },
                  { field: 'description', filter: 'agTextColumnFilter', },
                  {
                    field: 'amount',
                    sortable: false,
                    cellStyle: { textAlign: 'right' },
                    cellRenderer: agGridCellRenderer({ component: TableCellAmount }),
                  }
                ],
              })}
            />
          </div>
        </div>
      </>
    }


    const TableCellDate = agGridComponent<Transaction>(params => {
      const date = params.data?.date
      return <>{date ? dateRead({ date }) : 'Unknown'}</>
    })


    const TableCellAmount = agGridComponent<Transaction>(params => {
      const amount = params.data?.amount ?? 0

      return <>
        <div classList={{ up: amount > 0 }} class="table-amount">
          {formatter.format(Math.abs(amount))}
        </div>
      </>
    })
    ```



## Chart.js Demo
- Demo shows the following charts (Chart.js offers even more tho):
    - ✅ Bar
    - ✅ Line
    - ✅ Doughnut
1. Install: `npm i chart.js -D`
1. Register: `src/init/registerChartJs.ts`
    ```ts
    // This way only the following things used from chart.js will be in your build


    import {
      Chart,
      Legend,
      Tooltip,
      ArcElement, // doughnut
      BarElement, // bar
      LinearScale, // bar, line
      LineElement, // line
      PointElement, // line
      BarController, // bar
      CategoryScale, // bar, line
      LineController, // line
      DoughnutController, // doughnut
      Title as ChartJsTitle,
    } from 'chart.js'

    let registered = false

    export function registerChartJs() {
      if (!registered) {
        Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartJsTitle, LineController, BarController, PointElement, LineElement, DoughnutController, ArcElement)
        Chart.defaults.font.size = 18
        registered = true
      }
    }
    ```
1. Implement:
    ```ts
    import { ChartJs } from '@ace/chartjs'
    import { useStore } from '@src/store/store'
    import { randomArrayItem } from '@ace/randomArrayItem'


    function Categories() {
      const defaultCategoriesCount = 4

      const {sync, store} = useStore()

      const colors = ['#38bdf8', '#8e7cfb', '#3b82f6', '#4ade80',  '#ffb8d2', '#facc15', '#0284c7', '#b43c02']

      const addCategory = () => {
        sync('financeCategories', [
          ...store.financeCategories,
          {
            id: randomArrayItem(emojis),
            amount: (store.financeCategories.at(-1)?.amount ?? 0) + 38
          }
        ])
      }

      const refreshCategories = () => {
        sync('financeCategories', store.financeCategories.slice(0, defaultCategoriesCount))
      }

      return <>
        <div class="viz">
          <div class="head">
            <h2>🍰 Categories</h2>
            <div class="buttons">
              <Show when={store.financeCategories.length > defaultCategoriesCount}>
                <Refresh onClick={refreshCategories} tooltipContent="Refresh Categories" />
              </Show>

              <button class="brand" onClick={addCategory}>Add Category</button>
            </div>
          </div>

          <div class="body two-col">
            <ChartJs
              register={registerChartJs}
              $canvas={{ class: 'doughnut' }}
              map={() => store.financeCategories}
              config={{
                type: 'doughnut',
                data: {
                  datasets: [{
                    data: [],
                    borderWidth: 0,
                    hoverOffset: 8,
                    backgroundColor: colors,
                  }]
                },
                options: {
                  plugins: {
                    legend: {
                      labels: { color: '#f0f0f0' }
                    },
                    title: {
                      display: false,
                    }
                  }
                }
              }} />

            <div class="charts">
              <ChartJs
                register={registerChartJs}
                map={() => store.financeCategories}
                config={{
                  type: 'line',
                  data: {
                    labels: [],
                    datasets: [{
                      tension: 0.3,
                      label: 'Expenses',
                      data: [],
                      backgroundColor: colors,
                      borderColor: 'rgba(255, 255, 255, 0.6)',
                    }]
                  },
                  options: {
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: '#cfd8e3' } },
                      y: { ticks: { color: '#cfd8e3' } }
                    }
                  }
                }} />

              <ChartJs
                register={registerChartJs}
                map={() => store.financeCategories}
                config={{
                    type: 'bar',
                    data: {
                      labels: [],
                      datasets: [{
                        label: 'Expenses',
                        data: [],
                        backgroundColor: colors,
                      }]
                    },
                    options: {
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#cfd8e3' } },
                        y: { ticks: { color: '#cfd8e3' } }
                      }
                    }
                  }} />
            </div>
          </div>
        </div>
      </>
    }
    ```



## Send Brevo Emails
1. [Brevo](https://www.brevo.com/) offers **300** marketing / API emails a day for [free](https://www.brevo.com/pricing/), has a super easy integration w/ Cloudflare, and allows people to reply to your emails, so you get a free email inbox too!
1. [Setup DNS between Brevo & Cloudflare](https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-DMARC)
    - During this process there is an option of `Authenticate the domain automatically`. If you're using Cloudflare we recommend this option, it adds all the DNS records in 1 lovely step!
1. [Ensure you have a sender setup](https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email)
1. [Create an API Key](https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys)
    - Add `BREVO_API_KEY` to `.env` file
1. [Create an Email Template](https://help.brevo.com/hc/en-us/articles/360019787120-Create-an-email-template)
    - On the edit template page, to have a link point to a param, set the `Link Target` to `{{params.EXAMPLE_LINK}}` & then [(reference)](https://developers.brevo.com/docs/send-a-transactional-email):
    - Ensure you have `plugins > brevo` set to true in your Ace config, do a [dev restart](#-when-a-dev-restart-is-necessary) & then:
    ```ts
    const response = await sendBrevoTemplate({ // send brevo email 
      templateId: 1,
      to: [{ email, name }],
      params: { EXAMPLE_LINK: scope.origin + createRouteUrl('/magic-link/:token', {pathParams: {token}}) }
    })
    ```
1. [API Documentation](https://developers.brevo.com/reference/sendtransacemail)



## Deploy
### Ace can be deployed to any Vite-compatible hosting provider (aka: Vite projects output a `dist` folder with `HTML`, `CSS`, and `JavaScript` files, so any hosting provider that can handle that, aka: everyone) 🚀 To deploy on `git push` to `Cloudflare Workers`:
1. Locally at your project root (where package.json is) create `wrangler.jsonc`, example:
    ```json
    {
      "$schema": "node_modules/wrangler/config-schema.json",
      "name": "create-ace-app",
      "compatibility_date": "2025-11-04",
      "compatibility_flags": [
        "nodejs_compat"
      ],
      "observability": {
        "enabled": true
      }
    }
    ```
1. Update the `compatibility_date` to yesterday's date
1. Setup GitHub
    1. Create a GitHub account or Sign In
    1. Create a `public or private` repository
    1. Push all changes
1. Create a Cloudlfare account or Sign in
1. Navigate to `Workers & Pages`
1. Click the `Create application` button
1. Click: `Import a Repository`
1. Configure your Project
    - Build Command: `npm run build`
    - Deploy Command: `npx wrangler deploy`
    - Save & Deploy (🚨 the first deploy will fail b/c we're not done yet!)
1. Locally navigate to `.env` at your project root
1. For each item here, tell cloudflare about it in `bash`, example: `npx wrangler secret put JWT_SECRET`
1. Navigate to `Workers & Pages` > `Your Project` > `Deployments`
1. Find prod URL, by visiting site, or seeing logs
1. Add prod url to your `ace.config.js` > `origins` > `prod`, example:
    ```js
    // @ts-check 

    /** @type {import('@acets-team/ace').AceConfig} */
    export const config = {
      sw: true,
      apiDir: './src/api',
      appDir: './src/app',
      logCaughtErrors: true,
      origins: {
        prod: 'https://create-ace-app.jquery-ssr.workers.dev/',
        local: ['http://localhost:3000', 'http://localhost:3001']
      },
      plugins: {
        hljs: true,
        solid: true,
        agGrid: true,
        valibot: true,
        chartjs: true,
        markdownIt: true,
      }
    }
    ```
1. 💫 Push to GitHub aka **Deploy**! ❤️



## Add a custom domain
1. Purchase a domain, I love [Namecheap](http://namecheap.com)!
1. Sign into Cloudflare
1. In the `Dashboard` navigate to `Acount Home`
1. Click `Add a Domain`
1. Enter domain @ `Enter an existing domain`
1. Select radio `Quick scan for DNS records`
1. Select `Free` Plan
1. At the Review DNS Records page, delete records w/ errors not covered by a certificate, if unsure, save them somewhere to add again later
    - ☁️ What does the Proxy (orange‑cloud) do?
        - When a record is Proxied, traffic to that hostname is routed through Cloudflare’s edge network instead of hitting your origin directly. This gives you caching, DDoS protection, TLS termination, performance optimizations, and firewall rules all managed at Cloudflare’s layer
        - Email-related DNS record (DKIM/SPF) don't need proxy b/c proxy would break proper verification
1. Click `Continue to Activation`
1. Copy Nameservers and paste them where you bought the domain. For namecheap this is @ `Domain List` > `Nameservers` > `Custom DNS`
1. In Cloudflare click continue
1. In Cloudflare copy the `Zone ID`
1. In your `wrangler.jsonc` add:
    ```json
    {
        "routes": [
        {
          "pattern": "example.com",
          "zone_id": "123456789",
          "custom_domain": true
        }
      ]
    }
    ```
1. Update your `ace.config.js` file with your new `env`
1. When you get an email from cloudflare that your domain is ready, push to Github and the deploy will now go to your custom domain! 💚



## Resolve www DNS
1. IF you'd love your site to still work when people do `www.example.com` THEN in your `wrangler.jsonc` add a `www` subdomain, example:
    ```json
    {
        "routes": [
        {
          "pattern": "example.com",
          "zone_id": "123456789",
          "custom_domain": true
        },
        {
          "pattern": "www.example.com",
          "zone_id": "123456789",
          "custom_domain": true
        }
      ]
    }
    ```



## View Production Logs
- IF deployed as a `Cloudflare Worker` THEN to view production logs @:
    - Local Terminal
        - `npx wrangler tail`
    - Dashboard
        1. Ensure `observability` > `enabled` is set to `true` @ `wrangler.jsonc`
        1. Navigate to `Workers & Pages` > `Click Site` > `Observability`



## VS Code Helpful Info
1. How to show intellisense dropdown in VS Code?
    - `Control` + `Space`
    
1. How to reload VS Code?
    - `Command` + `Shift` + `P`
    - Type: `reload window`
    - Press `Enter`

1. How to open VS Code `settings.json`
    - `Command` + `Shift` + `P`
    - Type: `user settings json`
    - Press `Enter`

1. How to get VS Code to create `<div class="example"></div>` on `.example`
    - @ VS Code `settings.json` add:
        ```json
        {
          "emmet.includeLanguages": {
            "typescriptreact": "html",
            "javascriptreact": "html"
          }
        }
        ```
    - Reload VS Code!

1. How to run `code .` in VS Code `bash` & have it open a new VS Code in that directory
    - `Command` + `Shift` + `P`
    - Type: `Shell Command: Install 'code' command in PATH`
    - Press `Enter`

1. How to alter icon for `.tsx` files in VS Code
    - Download the `Symbols` extension by `Miguel Solorio`
    - Bash cd into `~/.vscode/extensions/`
    - Bash cd `miguelsolorio.symbols-` w/ the proper version
    - Bash: `code .`
    - @ `/src/icons/files/` place image
    - @ `/src/symbol-icon-theme.json` w/in `iconDefinitions` place `"ace": { "iconPath": "./icons/files/[ image name & extension ]" },`
    - @ `fileExtensions` update `"tsx": "ace",` & anywhere else ya love!
    - @ VS Code `settings.json` add:
        ```js
        "symbols.files.associations": {
          "*.jsx": "ace",
          "*.tsx": "ace"
        }
        ```
    - Reload VS Code!



## Error Dictionary
#### Anytime you see "Standard Fix" below, [do these app clear steps first please](#if-developing-multiple-ace-projects-simultaneously)... & then these steps please
1. Stop all local servers running Ace
1. Delete generated `.ace` folder
1. `npm run dev`
1. Ensure the port shown in `bash`, is the port in your `./ace.config.js`
1. Open a new browser tab, place the url from `bash` into the browser & press `Enter`



### 🔔 Errors
1. `bash: ace: command not found`
    - The way `npm` works, is if we wanna go into a `bash` terminal & use a command like `ace` then the package that provides this command **must be globally installed**
    - This is b/c bash can navigate to any directory, so all that is required is to globally install is `npm i @acets-team/ace -g`
    - 🚨 This is not a requirment @ `package.json` > `scripts`, which is why `ace` commands  work here w/o a global install but is a standard `npm` requirement w/in a bash terminal ❤️
1. `TypeError: Comp is not a function at createComponent`
    - Ensure `app.tsx` has `import { createApp } from '@ace/createApp'` and `export default createApp()`
    - Standard Fix
1. `Error: <A> and 'use' router primitives can be only used inside a Route.`
    This is typically caused by something in the default export function @ `app.tsx` that should not be there, like `useParams()` or `useLocation()`. This function must only have items like  `<Router />`, `<FileRoutes />` or `<Route />`. Then w/in the component functions of the route or layout we may use router primatives
    - Standard Fix
1. `Cannot read properties of null (reading 'push') @ Effects.push.apply(Effects, e);` 
    - Standard Fix
1. `Error Unknown error @ solid-js/dist/dev.js`
    - Fix any browser console errors
    - Standard Fix
1. `Type [example] is not assignable to type 'IntrinsicAttributes & [example]. Property [example] does not exist on type 'IntrinsicAttributes & [example].ts(2322)`
    - Ensure the props on your functional components are destructured so rather then `export function ExampleComponent(scope: ScopeComponent)` it should be `export function ExampleComponent({ scope }: { scope: ScopeComponent })` 
1. `Argument of type '(scope: ScopeComponent<any, any>) => void' is not assignable to parameter of type 'RouteComponent<any, any>'. Type 'void' is not assignable to type 'Element'.`
    - Change this:
        ```ts
        export default new Route('/')
          .component((scope) => {
            return scope.go('/sign-in')
          })
        ```
    - To this:
        ```ts
        export default new Route('/')
          .component((scope) => {
            throw scope.go('/sign-in')
          })
        ```
    - Throwing thankfully ends the inference loop of defining and returning a route 🙌

