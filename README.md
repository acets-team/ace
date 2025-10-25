# ✨ Ace
    Welcome! Thanks for being here! 🙏

1. [Create Ace App](#create-ace-app)
1. [What is Ace?](#what-is-ace)
1. [Save state to indexdb](#save-state-to-indexdb)
1. [Create API Route](#create-api-route)
1. [Create Middleware](#create-api-route)
1. [Path and Search Params](#path-and-search-params)
1. [Valibot Helpers](#valibot-helpers)
1. [Create a Layout](#create-a-layout)
1. [Create a Route](#create-a-route)
1. [Create a 404 Route](#create-a-404-route)
1. [Create a Typesafe Anchor](#create-a-typesafe-anchor)
1. [Typesafe Redirects](#typesafe-redirects)
1. [Add Offline Support](#add-offline-support)
1. [Network Status Hook](#network-status-hook)
1. [Modal Demo](#modal-demo)
1. [Form Demo](#form-demo)
1. [Magic Link Demo](#magic-link-demo)
1. [Create Password Hash](#create-password-hash)
1. [Loading Spinner Component](#loading-spinner-component)
1. [Show Toast Notifications](#show-toast-notifications)
1. [Tabs Component](#tabs-component)
1. [Radio Cards Component](#radio-cards-component)
1. [Slidshow Component](#tabs-component)
1. [Ace Config](#ace-config)
1. [🚨 When to restart dev?](#when-to-restart-dev)
1. [IF developing multiple Ace projects simultaneously](#if-developing-multiple-ace-projects-simultaneously)
1. [Add Tailwind](#add-tailwind)
1. [AgGrid Demo](#aggrid-demo)
1. [Chart.js Demo](#chartjs-demo)
1. [Markdown-It Demo](#markdown-it-demo)
1. [Send Brevo Emails](#send-brevo-emails)
1. [Deploy on Cloudflare](#deploy-on-cloudflare)
1. [Add a custom domain](#add-a-custom-domain)
1. [Resolve www DNS](#resolve-www-dns)
1. [VS Code Enhancements](#vs-code-enhancements)
1. [Error Dictionary](#error-dictionary)



## Create Ace App!
- Mac / Linux
    ```bash
    nvm use 24 && npx create-ace-app@latest
    ```
- Windows
    ```bash
    nvm use 24 && npx.cmd create-ace-app@latest
    ```



## What is Ace?
- Ace is a set of functions, classes, and types (fundamentals) to aid web developers. We’ve grouped these fundamentals into plugins. When a plugin is set to true in your Ace config, that plugin's corresponding fundamentals are added into the `.ace` folder (at the root of your project). Each plugin is opt-in, and only the Ace fundamentals you import and use will be included in your build! **Standard Ace plugins include:**
  1. **[Solid](https://docs.solidjs.com/)** (optimal DOM updates)
  1. **[Drizzle](https://orm.drizzle.team/)** (typesafe db updates)
  1. **[Turso](https://turso.tech/)** (5GB Free DB)
  1. **[Cloudflare](https://www.cloudflare.com/)** (Servers near users)
  1. **[AgGrid](https://www.ag-grid.com/)** (Scrollable, filterable & sortable tables)
  1. **[Charts.js](https://www.chartjs.org/)** (Evergreen charting library)
  1. **[Valibot](https://valibot.dev/)** (Zod + small bundle)
  1. **[Brevo](https://www.brevo.com/)** (300 emails a day for free)
  1. **[Markdown-It](https://markdown-it.github.io/markdown-it/)** (Markdown to HTML)
  1. **[Highlight.js](https://github.com/highlightjs/highlight.js)** (Highlight code in Markdown)



## Save state to indexdb
1. Define atoms: `src/store/atoms.ts`
    ```ts
    // atoms are saved @ memory, session storage, local storage (5mb) or indexdb (100's of mb's)
    // an Atom "is" prop helps us know how to serialize and deserialze
    // setting custom onSerialize & onDeserialze is avaialble too!
    // on first read, atoms init their value from their save location!
    // save reads and writes are bulked on tick and then sent in batch!


    import { Atom } from '@ace/atom'
    import type { ApiName2Data, ChartJsData } from '@ace/types'
    import type { FinanceSummary, Transaction, ChatMessage } from '@src/lib/types'


    export const atoms = {
      count: new Atom({ save: 'idb', is: 'number', init: 0 }),
      buildStats: new Atom({ save: 'idb', is: 'string', init: '' }),
      chatMessage: new Atom({ save: 'idb', is: 'string', init: '' }),
      cashFlow: new Atom<ChartJsData[]>({ save: 'idb', is: 'json', init: [] }),
      chatMessages: new Atom<ChatMessage[]>({ save: 'idb', is: 'json', init: [] }),
      transactions: new Atom<Transaction[]>({ save: 'idb', is: 'json', init: [] }),
      financeCategories: new Atom<ChartJsData[]>({ save: 'idb', is: 'json', init: [] }),
      financeSummary: new Atom<undefined | FinanceSummary>({ save: 'idb', is: 'json' }),
      fortunes: new Atom<ApiName2Data<'apiGetFortune'>[]>({ save: 'idb', is: 'json', init: [] }),
    }
    ```
1. Create a Store: `src/store/store.ts`
    ```ts
    // To work w/ atoms we put them into a store and then call useStore()
    // Atoms are available in any layout or component w/ useStore()
    // Multiple stores is simple but probably not necessary


    import { atoms } from './atoms'
    import { createMemo } from 'solid-js'
    import { Atoms2Store } from '@ace/types'
    import { createStore } from '@ace/createStore'


    export const { useStore, StoreProvider } = createStore({ atoms })
    ```
1. Wrap `<App/>` with `<StoreProvider/>`: `src/app.tsx`
    ```ts
    // the createApp() will generate all our <Route />'s for us and wrap them w/ the providers in the (provided) array :)
  
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



## Create API Route
1. Example: `src/api/apiUpdateEmail.ts`
    ```ts
    // to the API constructor, the first arg is the path param and the 2nd is the api function name which can be called on the fe or be


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
          .set({ email: scope.body.email }) // typesafe b/c updateEmailParser
          .where(eq(users.id, scope.event.locals.session.userId)) // typesafe b/c sessionB4

        return scope.success('Updated!')
      })
    ```
1. Create middleware functions: `src/auth/authB4.ts`
    ```ts
    // Ace middleware is different then express middleware and for that reason we use a different name we call them b4 (before) functions b/c they run before your API resolve function
    // If a b4 returns anything that response is given to the user
    // To persist data from one b4 to the next or from a b4 to the resolve, place data into `event.locals` and update the functions generic type 🚨 By setting the generic type this lets downstream b4's or resolves know the type of your persisted data, so then in the resolve for example we'd have typesafety for `scope.event.locals.session` as seen in the api example:


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
1. Create a parser: `src/parsers/updateEmailParser.ts`
      ```ts
      // vParse() helps us create valibot parsers
      // In Ace a parser is a function that validates & also potentially parses data
      // Within these functions any prefered schema library may be used 🙌
      // 🚨 & b/c this parser is used by our fe and be we place it into its own file & only include imports that are fine including on the fe & be (security) (make bundlers life easy)


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
- @ `new Route()` & `new API()`, `.pathParams()` & `.searchParams()` work the same way!
- IF params are valid THEN `scope.pathParams` and/or `scope.searchParams` will be set w/ their typesafe parsed values!
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
    import { object } from 'valibot'
    import { vParse } from '@ace/vParse'
    import { vString } from '@ace/vString'

    export default new Route('/magic-link/:token')
      .pathParams(vParse(object({ token: vString('Please provide a token') })))
    ```
1. [All valibot helpers that can be used w/in `vParse(object(())`](#valibot-helpers)



## Valibot Helpers
1. All valibot helpers that can be used w/in `vParse(object(())`
    - `{ token: vString('Please provide a token') }`
    - `{ modal: vBool('Please provide a modal param') }`
    - `{ email: vEmail('Please provide a valid email') }`
    - `{ value: vNum('Please provide a value as a number') }`
    - `{ voicePart: vEnums(new Enums(['Bass', 'Alto', 'Soprano'])) }`
    - `{ passportIssuedDate: vDate({error: 'Please provide date passport issued'}) }`



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

    // bits are boolean signals, anytime an api is called w/o a bitKey provided it automtically get's a bitKey that is the same name as it's api name
    // bits makes it simple to know anywhere if an api is loading and can be updated anywhere w/ scope.bits.set(key, value)

    import './Deposits.css'
    import { Show } from 'solid-js'
    import { Route } from '@ace/route'
    import { Title } from '@solidjs/meta'
    import RootLayout from '../RootLayout'
    import { Users } from '@src/Users/Users'
    import { SignIn } from '@src/auth/SignIn'
    import { getUsersSources } from '@src/lib/vars'
    import { loadSession } from '@src/auth/loadSession'
    import { AuthLoading } from '@src/auth/AuthLoading'
    import { AuthHeroTitle } from '@src/auth/AuthHeroTitle'
    import { useStore, isEmployee } from '@src/store/store'
    import type { ScopeComponent } from '@ace/scopeComponent'


    export default new Route('/deposits')
      .layouts([RootLayout])
      .component((scope) => {
        loadSession()

        return <>
          <Title>❤️ Deposits</Title>

          <main class="deposit">
            <AuthHeroTitle />

            <Show when={scope.bits.get('apiGetSession')} fallback={<Loaded scope={scope} />}>
              <AuthLoading />
            </Show>
          </main>
        </>
      })


    function Loaded({ scope }: { scope: ScopeComponent }) {
      const {store} = useStore()

      return <>
        <Show when={isEmployee(store)} fallback={<SignIn />}>
          <div class="h-title">❤️ Made Deposit</div>
          <Users scope={scope} source={getUsersSources.keys.deposits}></Users>
        </Show>
      </>
    }
    ```
1. When API is called the same way in multiple components, `src/auth/loadSession.ts`
    ```ts
    // In Ace we call API's as typesafe functions
    // When a queryType is set that tells us to send this request using Solid's query(), which helps w/ deduplication & revalidation
    
    // 🚨 set the queryType to 'stream' when you'd love to load data for a component and that api does not set cookies. On refresh the request will start on the be and on spa navigation the query will start on the fe

    // 🚨 set the queryType to 'maySetCookies' if we are loading data into a component like 'stream' but this api may set cookies. When true we will ensure that wheter page refresh or spa navigation this request will start on the fe. The way a server tells a browser about cookies is w/ the Set-Cookie header. We may not update that header if the Response is already w/ the fe, and during streaming the response is already w/ the fe, we're just sending down some extra text when it's ready but we can't update a Set-Cookie header after a response is already sent. BUT if we start the request on the fe THEN thru the lifetime of the request, updating response headers is simple

    // 🚨 set the queryType to 'direct' when you wanna call query() but not to get data for a component while it's loading but based on some user interaction like an onClick

    // the set() function from useStore() takes the same functional arguments as setStore() from Solid, so w/ set() first we call setStore() and then we call save() to persist our fe data
    // when this page loads we'll start w/ data from indexdb and then onData() or onError() we'll update that indexdb data & that update will show in the app

    // additional api function arguments:
    // onGood() - if the api does not respond w/ data but you wanna know an error did not happen
    // onResponse() - to get the raw unparsed Response object
    // bitKey - when not set, automatically set to the api function name, ex: scope.bits.get('apiGetSession') is available in any layout or component


    import { apiGetSession } from '@ace/apis'
    import { useStore } from '@src/store/store'


    export function loadSession() {
      const {set} = useStore()

      apiGetSession({
        queryType: 'maySetCookies',
        onData: (d) => set('apiGetSession', d),
        onError: (e) => set('apiGetSession', undefined),
      })
    }
    ```
1. When computed properties are used in multiple components: `src/store/store.ts`:
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
- Path, pathParams & searchParams = **typesafe**
- So IF path or search params are defined for this path as **required** THEN they'll be required here via TS IDE autocomplete intellisense
- By default & configurable this component toggles an active class based on the current route 🥳
```html
<A path="/about">Learn More</A>
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
- Add `<ServiceWorker />` component to your `RootLayout`
  ```ts
  import { Nav } from '@src/Nav/Nav'
  import { Layout } from '@ace/layout'
  import { ServiceWorker } from '@ace/serviceWorker'

  export default new Layout()
    .component((scope) => {
      return <>
        <Nav />
        {scope.children}
        <ServiceWorker />
      </>
    })
  ```
- Create `/public/sw.js`
  ```js
  // @ts-check

  import { addOfflineSupport } from '../.ace/addOfflineSupport.js'

  const packageDotJsonVersion = ''

  addOfflineSupport({ cacheName: `offline-cache-v-${packageDotJsonVersion}` })
  ```
- 🚨 If you want your app version (in package.json) to align w/ your cache version **(recommended)** then:
    1. Ensure `/public/sw.js` has `const packageDotJsonVersion = ''` 
    1. Run in bash: `ace swVersion` to place your `package.json` version into your sw.js file :)
    1. Update package.json scripts to run `ace swVersion` automatically
        ```json
        {
          "scripts": {
            "dev": "ace build local && ace swVersion && vinxi dev",
            "build": "ace build prod && ace swVersion && vinxi build",
          },
        }
        ```
- How it works:
    - On every GET request we first go to the server, and if that response is ok then the service worker will store the response in cache
    - When offline we'll still try to fetch, and when it fails we'll check cache, and if cache has a response we'll give it



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



## Modal Demo
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



## Form Demo
- ✅ FE & BE Validation uses the same schema
- ✅ No BE request is made unless FE validation passes
- ✅ Error messages for each input show up next to that input
- ✅ IF input has error(s) AND start typing in input THEN clear that inputs error(s)
- ✅ Save input value on refresh OR on offline thanks to `refBind()` syncing our store (atom that can persist to indexdb) w/ the input

```ts
// useStore() provides a reference to an object that has helpful store items
// store provides access to atoms (ex: store.count)
// refBind() provides 2 way data binding between stores and inputs, textareas and/or selects 

// kParse() (the k stands for keys)
// In Ace a parser is a function that validates & also potentially parses data
// kParse() is helpful when you wanna use a parser and get autocomplete for what keys this parser requires
// So w/ this example our IDE will error till email is a prop on the input object to kParse()
// The parser will check the particulars of the input object but kParse will just enforce at compile time all the keys the parser requires are present which is helpful when building objects for api's

// createOnSubmit() wraps our callback in a try catch for us + default error handling we can set
// IF the fe signInParser validation have an error w/ the "email" object prop that'll match the <Messages name="email" /> in the DOM & show them

// refFormReset() will ensure <Messages /> clear when event.currentTarget.reset() is called
// A ref function is a way to define what you'd love an element to do w/in a function, like add and remove event listeners for example

// showToast() is an ace fundamental w/ loads of styling options

// <Submit /> will show <Loading /> when the apiUpdateEmail is true
// bitKey's in Ace are boolean signals and when an api function is called w/o and explicit bit key it's given one as is name which makes knowing when it's loading easy
// $button forwards props to the inner <button />
        

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
      onGood: () => showToast({ type: 'success', value: 'Please check email inbox for sign in link!' }),
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
            params: { LINK: scope.origin +  createRouteUrl('/magic-link/:token', {pathParams: {token}}) }
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

        if (jwtMagic.errorMessage) return scope.error(jwtMagic.errorMessage)

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
    import { jwtCookieName } from '@src/lib/vars'
    import { jwtValidate } from '@ace/jwtValidate'
    import { db, users, sessions } from '@src/lib/db'
    import type { Session, SessionJWTPayload } from '@src/lib/types'


    export async function getSession(scope: ScopeBE) {
      const jwt = await jwtValidate<SessionJWTPayload>({ jwt: scope.getCookie(jwtCookieName) }) 

      if (!jwt.isValid) {
        if (jwt.payload) { // they signed in
          scope.clearCookie(jwtCookieName)

          if (jwt.payload.sessionId) await db.delete(sessions).where(eq(sessions.id, jwt.payload.sessionId)) // delete from db
        }

        throw new Error('Please sign in') // jwt is invalid
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

      if (!dbUser?.sessionId) throw new Error('Invalid session')

      if (datePast(dbUser.expiration)) throw new Error('Session expired') // altering db date can expire token too

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



## Create Password Hash
### If you would love to deploy to Cloudflare, here's a way to hash on the edge :)
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



## Loading Spinner Component
- Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
  ```tsx
  <Show when={scope.bits.get('apiExample')} fallback={<Loading />}>
    <div>Loaded!</div>
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
      --ace-toast-border-color: rgb(16, 185, 129);
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
        '--ace-toast-border-color': 'rgb(192, 132, 252)',
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
      /** Would you like to log errors */
      logCaughtErrors?: boolean,
      /** Ace is a set of helpful files we call fundamentals. Fundamentals are grouped by plugins. Set a plugin to true to gain access to the fundamentals it holds. */
      plugins: PluginsConfig,
      /** Default is `tsconfig.json` */
      tsConfigPath?: string,
      /** The `key` is the `env` which is set w/ the build command, ex: `ace build local`, in this example the key is `local`. The value is a `string` or `array` of `strings` which are the allowed origins to request your api. Helpful for API Response Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin 🚨 If your origin is '*' cookies won't work, not an Ace limitation, that's just how HTTP work :) */
      origins: Record<string, string | string[]>
      /** 
       * - When set to true 
      * - On build => IF `config.sw` = `true` AND package.json version is defined THEN file in `public` directory that starts w/ `sw` and is a `.js` file is renamed to `sw_[package dot json version].js` - Helps maintain alignment between app versions and cache versions
      * 
      */
      sw?: boolean
    }
    ```
- Plugins:
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
     */
    solid?: boolean

    /**
     * Enables **Valibot** fundamentals (helpful modules @ `./ace`)
     *
     * Requires the following npm dev imports:
     * - `valibot`
     */
    valibot?: boolean

    /**
     * Enables **Zod** fundamentals (helpful modules @ `./ace`)
     *
     * Requires the following npm dev imports:
     * - `zod`
     */
    zod?: boolean

    /**
     * Enables **Turso** fundamentals (helpful modules @ `./ace`)
     *
     * Requires the following npm dev imports:
     * - `@libsql/client`
     * - `drizzle-orm`
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
     *
     * @link https://www.npmjs.com/package/markdown-it
     */
    highlightJs?: boolean

    /**
     * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
     * 
     * - Requires the following npm dev imports:
     *     - `wrangler`]
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
     * @link https://developers.cloudflare.com/durable-objects/
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
    ```
1. Delete all cookies @ `Chrome` > `Inspect` > `Application`
1. 🚨 Close ALL `localhost:3000` tabs
1. IF you have `sw` set to true in your ace config:
    1. Open a new tab and visit `chrome://serviceworker-internals/`
    1. On this chrome page, do a browser find for `:3000` to ensure `localhost:3000` has no service workers attached, if you see it here click the Stop/Unregister button



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



## AgGrid Demo
- This table can:
    - ✅ Scroll
    - ✅ Paginate
    - ✅ Column Sort
    - ✅ Custom Theme
    - ✅ Add filters to columns
    - ✅ Only build from AgGrid what we use
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



### Markdown-It Demo
    ```ts
    // On `Markdown` component content prop change, the resulting html is updated 
    // Language specific code highlighting is available w/ Highlight.js!

    // 🚨 When loading data for a component we recommed using solid's `query()` function and this is set w/ the `queryType` property seen below!
    // `query()` helps w/ deduplication, caching & makes it easy to query endpoints again!
    // Each api call below happens simultaneously
    // When the queryType is stream as seen below, API calls start on the server on page refresh and start from the browser on anchor navigation

    import './Home.css'
    import { Route } from '@ace/route'
    import { Title } from '@solidjs/meta'
    import { Loading } from '@ace/loading'
    import { useStore } from '@src/store/store'
    import RootLayout from '@src/app/RootLayout'
    import { MarkdownIt } from '@ace/markdownIt'
    import { apiGetFinances, apiGetBuildStats } from '@ace/apis'
    import type { Transaction, FinanceSummary } from '@src/lib/types'


    export default new Route('/')
      .layouts([RootLayout])
      .component(() => {
        const {set, sync, store} = useStore()

        apiGetBuildStats({
          queryType: 'stream', // data from the api is streamed in while the page is being built by the browser
          onData: (d) => set('buildStats', d)
        })

        apiGetFinances({
          queryType: 'stream',
          onData (d) {
            sync('cashFlow', d.cashFlow) // unlike set(), sync() will reconcile() arrays based on a key, default is "id"
            sync('transactions', d.transactions)
            sync('financeCategories', d.categories)
          }
        })

        return <>
          <Title>🏡 Home</Title>

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

            <Show when={store.buildStats} fallback={<MarkdownIncoming />}>
              <MarkdownIt content={() => store.buildStats} $div={{class: 'markdown'}} />
            </Show>
          </main>
        </>
      })
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



## Deploy on Cloudflare
### [Cloudflare](https://www.cloudflare.com/) offers 100,000 requests a day for [free](https://developers.cloudflare.com/workers/platform/pricing/)! 🥹
1. Create a GitHub account or Sign in
1. Push to a public or private repository
1. Create a Cloudlfare account or Sign in
1. Navigate to `Workers & Pages`
1. Click the `Create` button
1. Click: `Import a Repository`
1. Configure your Project
    - Build Command: `npm run build`
    - Deploy Command: `npx wrangler deploy`
    - Save & Deploy
1. Locally at your project root (where package.json is) create `wrangler.toml`
1. In the first line place the worker name that you gave to cloudflare: `name = "your-project-name"`
1. On the 2nd line place yesterday's date, example: `compatibility_date = "2025-01-30"`
1. Locally navigate to `.env` at your project root
1. For each item here, tell cloudflare about it, example: `npx wrangler secret put JWT_SECRET`
1. Navigate to `Workers & Pages` > `Your Project` > `Deployments`
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
1. In your wrangler.toml add 
  ```toml
  routes = [
    { pattern = "example.com", zone_id = "123456789", custom_domain = true }
  ]
  ```
1. Update your `ace.config.js` file with your new `env`
1. When you get an email from cloudflare that your domain is ready, push to Github and the deploy will now go to your custom domain! 💚



### Resolve www DNS
1. In your wrangler.toml update to: 
  ```toml
  routes = [
    { pattern = "example.com", zone_id = "123456789", custom_domain = true },
    { pattern = "www.example.com", zone_id = "123456789", custom_domain = true }
  ]
  ```



## VS Code Enhancements
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

