






### Create Ace App!
- Mac / Linux
```bash
nvm use 24 && npx create-ace-app@latest
```
- Windows
```bash
nvm use 24 && npx.cmd create-ace-app@latest
```


### 🪷 The Ace Stack
    Ace is built with Solid Start. Solid is a lovely library that at its essence, is all about signals (functions that let us update the DOM optimally and subscribe to variable updates) 🙌
    
    Thanks to Solid’s beautiful API, Ace integrates simply & powefully  with evergreen vanilla JS projects. For example w/ Ace you may add components w/ signals into AgGrid table cells or you can update Chart.js charts by just pushing an object to an array (that's a signal) 🙏

    Extending Ace projects via CDN w/ Types or via NPM w/ Vite is easy 💚
    
    So Ace is built w/ Solid but what is Ace exactly? Ace is a set of functions, classes, and types (fundamentals) to aid web developers. We’ve grouped these fundamentals into plugins. When a plugin is set to true in your Ace config, that plugin's corresponding fundamentals are added into your .ace folder (at the root of your project). Each plugin is opt-in, and the only Ace fundamentals that will be in your build, are the ones you import and use! Standard Ace plugins include:
1. **[Solid](https://docs.solidjs.com/)**
    - Save fe state to memory, session storage, local storage or indexdb
      ```ts
      import { Atom } from '@ace/atom'
      import type { ApiName2Data } from '@ace/types'
      import type { ChartData, FinanceSummary, Transaction, ChatMessage } from '@src/lib/types'


      export const atoms = {
        count: new Atom({ save: 'idb', is: 'number', init: 0 }),
        buildStats: new Atom({ save: 'idb', is: 'string', init: '' }),
        chatMessage: new Atom({ save: 'idb', is: 'string', init: '' }),
        cashFlow: new Atom<ChartData[]>({ save: 'idb', is: 'json', init: [] }),
        chatMessages: new Atom<ChatMessage[]>({ save: 'idb', is: 'json', init: [] }),
        transactions: new Atom<Transaction[]>({ save: 'idb', is: 'json', init: [] }),
        financeCategories: new Atom<ChartData[]>({ save: 'idb', is: 'json', init: [] }),
        financeSummary: new Atom<undefined | FinanceSummary>({ save: 'idb', is: 'json' }),
        fortunes: new Atom<ApiName2Data<'apiGetFortune'>[]>({ save: 'idb', is: 'json', init: [] }),
      }

      // atoms are saved whever you want, options include memory, session storage, local storage (5mb) and indexdb (hundreds of mb's)
      // atoms are available in any fe function or component w/ useStore()
      // on first read atoms init their value from their save location & updating their value is easy & efficient!
      ```
    - Typesafe anchor component
      ```ts
      <A path="/about" $a={{class:'brand'}}>Learn More</A>
      ```
    - Call API's as typesafe functions
      ```ts
      function UpdateEmail() {
        // store provides access to atoms
        // refBind() provides 2 way data binding between inputs, textareas & selects and stores (so data stored on refresh is easy)
        const {store, refBind} = useStore() 

        const onSubmit = createOnSubmit(({ event }) => { // createOnSubmit() wraps our callback in a try catch for us + default error handling we can set
          // In Ace a parser is a function that validates & also potentially parses data
          // kParse() is helpful when you wanna use a parser and get autocomplete for what keys this parser requires
          // So w/ this example our ide will error till email is a prop on the input object to kParse()
          // The parser will check the particulars of the input object but kParse will just enforce at compile time all the keys the parser requires are present which is helpful when building objects for api's
          const body = kParse(updateEmailParser, { email: store.newsletterForm.email }) 

          apiUpdateEmail({
            body,
            onGood() {
              event.currentTarget.reset()
              showToast({ type: 'success', value: 'Updated!' })
            }
          })
        })

        return <>
          <form ref={refFormReset()} onSubmit={onSubmit}>
            <div class="flex">
              <input ref={refBind('newsletterForm', 'email')} name="email" type="email" placeholder="Please enter email" />
              <Messages name="email" />
              <Submit label="Update" bitKey="apiUpdateEmail" $button={{ class: 'brand' }} />
            </div>
          </form>
        </>
      }
      ```
1. **[AgGrid](https://www.ag-grid.com/)**
    - The `AgGrid` component syncs w/ their CDN so your build stays light
    - All Options are typesafe
    - On options or data change the table is updated 
      ```ts
      function Transactions() {
        const {sync, store} = useStore()
        const defaultTransactionsCount = 15

        const addTransaction = () => {
          sync('transactions', [ // sync() is great for arrays, by default it does a reconcile() by id so only this new item will be updated in the DOM
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
                gridOptions={() => ({
                  rowData: store.transactions,
                  defaultColDef: { flex: 1, sortable: true, resizable: true },
                  columnDefs: [
                    {
                      field: 'date',
                      filter: 'agDateColumnFilter',
                      sort: 'desc',
                      cellRenderer (params: AgParams<Transaction[]>) {
                        return params.data?.date ? dateRead({ date: params.data.date }) : 'Unknown'
                      }
                    },
                    { field: 'description', filter: 'agTextColumnFilter', },
                    {
                      field: 'amount',
                      cellStyle: { textAlign: 'right' },
                      sortable: false,
                      cellRenderer (params: AgParams<Transaction[]>) {
                        const amount = () => (params.data?.amount ?? 0)

                        return <>
                          <div classList={{ up: amount() > 0 }} class="table-amount">
                            { formatter.format(Math.abs(amount())) }
                          </div>
                        </>
                      }
                    },
                  ],
                })}
              />
            </div>
          </div>
        </>
      }
      ```
1. **[Drizzle](https://orm.drizzle.team/) + [Turso](https://turso.tech/)**
    - 5GB SQL Database for [free](https://turso.tech/pricing) w/ a lovely ui, intuitive functions, & database typesafety!
      ```ts
      import { API } from '@ace/api'
      import { eq } from 'drizzle-orm'
      import { vNum } from '@ace/vNum'
      import { vParse } from '@ace/vParse'
      import { object, optional } from 'valibot'
      import { sessionB4 } from '@src/auth/authB4'
      import { db, users, amsterdamRegistrations, voiceParts, roommateOptions } from '@src/lib/db'


      export const GET = new API('/api/get-amsterdam-registration/:registrationId?', 'apiGetAmterdamRegistration') // define desired method, path, path params & function name for this api :)
        .b4([sessionB4])
        .pathParams(vParse(object({ registrationId: optional(vNum()) })))
        .resolve(async (scope) => {
          const where = scope.pathParams.registrationId
            ? eq(amsterdamRegistrations.id, scope.pathParams.registrationId)
            : eq(amsterdamRegistrations.userId, scope.event.locals.session.userId)

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

          return scope.success(registration)
        })
      ```
1. **[Charts.js](https://www.chartjs.org/)**
    - The `ChartsJS` component syncs w/ their CDN so your build stays light
    - All Options are typesafe
    - On options or data change the chart is updated 
      ```ts
      function Categories() {
        const {sync, store} = useStore()
        const defaultCategoriesCount = 4
        const colors = ['#38bdf8', '#8e7cfb', '#3b82f6', '#4ade80',  '#ffb8d2', '#facc15', '#0284c7', '#b43c02']

        const chart = createMemo(() => { // computed property example
          const data: number[] = []
          const labels: string[] = []

          for (const c of store.financeCategories) {
            labels.push(c.id)
            data.push(c.amount)
          }

          return { data, labels }
        })

        const addCategory = () => {
          sync('financeCategories', [
            ...store.financeCategories,
            {
              id: randomArrayItem(emojis),
              amount: (chart().data.at(-1) ?? 0) + 38
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

            <div class="body">
              <ChartJS
                $canvas={{class: 'doughnut'}}
                config={() => ({
                  type: 'doughnut',
                  data: {
                    labels: chart().labels,
                    datasets: [{
                      borderWidth: 0,
                      hoverOffset: 8,
                      data: chart().data,
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
                })}
              />

              <div class="charts">
                <ChartJS
                  config={() => ({
                    type: 'line',
                    data: {
                      labels: chart().labels,
                      datasets: [{
                        tension: 0.3,
                        label: 'Expenses',
                        data: chart().data,
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
                  })}
                />

                <ChartJS
                  config={() => ({
                    type: 'bar',
                    data: {
                      labels: chart().labels,
                      datasets: [{
                        label: 'Expenses',
                        data: chart().data,
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
                  })}
                />
              </div>
            </div>
          </div>
        </>
      }
      ```
1. **[Cloudflare](https://www.cloudflare.com/)**
    - DDOS protection, 100,000 hosting requests a day for [free](https://developers.cloudflare.com/workers/platform/pricing/), and deployment is as simple as [git push](#-deploy)!
1. **[Valibot](https://valibot.dev/)**
    - To validate a simple sign in form, Zod requires 13.5 kB whereas Valibot require only 1.37 kB. That's a [90% reduction in bundle size](https://valibot.dev/guides/comparison/).
1. **[Brevo](https://www.brevo.com/)**
    - Email templates editor
    - 300 marketing and/or API emails a day for [free](https://wsearchParamssearchParamsww.brevo.com/pricing/)
1. **[Markdown-It](https://markdown-it.github.io/markdown-it/)**
    - The `Markdown` component syncs w/ their CDN so your build stays light
    - All Options are typesafe
    - On options or data change the markdown is updated 
    - Language specific code highlighting available
      ```ts
      import './Home.css'
      import { Route } from '@ace/route'
      import { Title } from '@solidjs/meta'
      import { Loading } from '@ace/loading'
      import { Markdown } from '@ace/markdown'
      import { useStore } from '@src/store/store'
      import RootLayout from '@src/app/RootLayout'
      import { apiGetFinances, apiGetBuildStats } from '@ace/apis'
      import type { Transaction, FinanceSummary } from '@src/lib/types'


      export default new Route('/')
        .layouts([RootLayout])
        .component(() => {
          const {set, sync, store} = useStore()

          apiGetBuildStats({
            queryType: 'stream',
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
                <Markdown content={() => store.buildStats} $div={{class: 'markdown'}} />
              </Show>
            </main>
          </>
        })
      ```



### 🚨 When a dev restart is necessary?
- It only takes 3 seconds, but it's important to restart dev sometimes (in bash `control + c` & then `npm run dev`), b/c HMR updates the majority of types but a restart updates them all, so please restart dev when:
    - An `API` is `created/deleted`
    - A `Route` is `created/deleted`
    - A `Layout` is `created/deleted`
    - A `Layout` is `added/removed` from a `new Route()` or `new Route404()` 



### 👩‍💻 Route!
```tsx
import { A } from '@ace/a'
import { Route } from '@ace/route'
import { Title } from '@solidjs/meta'

export default new Route('/yin')
  .component(() => {
    return <>
      <Title>Yin</Title>
      <A path="/yang">Yang</A> {/* typesafe! 🙌 */}
    </>
  })
```



### 💞 Layout!
```tsx
import './Guest.css'
import Nav from './Nav'
import { Layout } from '@ace/layout'

export default new Layout()
  .component(({children}) => {
    return <>
      <div class="guest-layout">
        <Nav />
        {children}
      </div>
    </>
  })
```



### 😅 404 Route!
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



### 💫 Route w/ Async Data!
- Ace allows us to call our API's w/ a function as seen here!
- When loading data for a component we recommed using solid's `query()` function and this is set w/ the `queryType` property! `query()` helps w/ deduplication, caching & makes it easy to query endpoints again!
  ```tsx
  import './Home.css'
  import { Route } from '@ace/route'
  import { Title } from '@solidjs/meta'
  import { Loading } from '@ace/loading'
  import { Markdown } from '@ace/markdown'
  import { useStore } from '@src/store/store'
  import RootLayout from '@src/app/RootLayout'
  import { apiGetFinances, apiGetBuildStats } from '@ace/apis'
  import type { FinanceSummary, Transaction } from '@src/lib/types'


  export default new Route('/')
    .layouts([RootLayout])
    .component(() => {
      const {set, sync, store} = useStore()

      apiGetBuildStats({
        queryType: 'stream',
        onData: (d) => set('buildStats', d)
      })

      apiGetFinances({
        queryType: 'stream',
        onData (d) {
          sync('cashFlow', d.cashFlow)
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
            <Markdown content={() => store.buildStats} $div={{class: 'markdown'}} />
          </Show>
        </main>
      </>
    })
  ```



### ✨ Form!
- ✅ FE & BE Validation uses the same schema
- ✅ No BE request is made unless FE validation passes
- ✅ Error messages for each input show up next to that input
- ✅ IF input has error(s) AND start typing in input THEN clear that inputs error(s)
- ✅ Save input value on refresh thanks to `refBind()` syncing our store (atom that can persist to indexdb) w/ the input
  ```tsx
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
      <form onSubmit={onSubmit} style={{'margin-bottom': 'var(--space)'}} >
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
  

### 🥹 Search Params!
- Required and/or optional search params available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'
import { vParse } from '@ace/vParse'
import { guestB4 } from '@src/lib/b4'
import { object, optional, picklist } from 'valibot'


export const GET = new API('/api/clothing', 'apiClothing')
  .b4([guestB4])
  .searchParams(vParse(object({ category: optional(picklist(['men', 'women'])) })))
  .resolve(async (scope) => {
    switch (scope.searchParams.category) { // ❤️ Typesafe Search Params
      case 'men':
      case 'women':
        return scope.success(clothing.filter(c => c.category === scope.searchParams.category))
      default:
        if (scope.searchParams.category) return scope.error('🚨 The valid categories are "men" & "women"')
        else return scope.success(clothing) // call scope.Success() to send custom headers :)
    }
  })


const clothing = [
  {id: 1, category: 'men', name: 'A'},
  {id: 2, category: 'men', name: 'B'},
  {id: 3, category: 'men', name: 'C'},
  {id: 4, category: 'women', name: 'D'},
  {id: 5, category: 'women', name: 'E'},
  {id: 6, category: 'women', name: 'F'},
]
```



![Sloths developing software in a tree](https://i.imgur.com/LognTyf.jpeg)



### 💖 GET!
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha', 'apiAloha') // now we've got an api endpoint @ the path /api/aloha AND we can call the function apiAloha() on the frontend or backed w/ request & response typesafety!
  .resolve(async (scope) => scope.success({ aloha: true }))
```
- ✅ Props for: `scope.success(data: T_Data, status = 200)`
    - `data` - Any valid json prop, so string, number, boolean, array or object
    - `status` - Optional, HTTP Response Status `default: 200`
- 👷‍♀️ Props for: `scope.Success({ data, status = 200, headers }: { data?: T_Data, status?: number, headers?: HeadersInit })`
    - `data` -  Type: Any valid json prop, so string, number, boolean, array or object
    - `status` - Optional, HTTP Response Status `default: 200`
    - `headers` - Optional, HTTP Response Headers, `'Content-Type': 'application/json'` added automatically



### 💜 Path Params!
- Required and/or optional path params available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'
import { object } from 'valibot'
import { vNum } from '@ace/vNum'
import { vParse } from '@ace/vParse'


export const GET = new API('/api/fortune/:id', 'apiFortune')
  .pathParams(vParse(object({ id: vNum() })))
  .resolve(async (scope) => {
    return scope.pathParams.id < 0 || scope.pathParams.id > 2
      ? scope.error('🐛') // call scope.Error() to send custom headers :)
      : scope.success({ id: scope.pathParams.id, fortune: fortunes[scope.pathParams.id] })
  })


const fortunes = [
  'Your inner light guides the way',
  'Kindness is your superpower',
  'Your laughter spreads sunshine',
]
```
- 🚨 Props for: `scope.error(message: string, status = 400)`
    - `message` -  Error message
    - `status` - Optional, HTTP Response Status `default: 400`
- ‼️ Props for: `scope.Error({ error, status = 400, headers }: { error: AceError, status?: number, headers?: HeadersInit })`
    - `error` - `AceError` constructor takes `{ status = 400, statusText, message, messages, rawBody }`. Setting a status here too can be helpful when you call a BE API and get an error status from them and wanna relay that and set a different status for this HTTP Response 😅 & `messages` are Valibot / Zod error messages of type `Record<string, string[]>`
    - `status` - Optional, HTTP Response Status `default: 400`
    - `headers` - Optional, HTTP Response Headers, `'Content-Type': 'application/json'` added automatically



### 💙 Use Middleware!
- Available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'
import { authB4 } from '@src/lib/b4'

export const GET = new API('/api/aloha', 'apiAloha')
  .b4([authB4]) // run the `authB4()` async function before this api boots!
  .resolve(async (be) => scope.success('aloha')
```



### 💚 Create Middleware!
```tsx
import { go } from '@ace/go'
import type { B4 } from '@ace/types'
import { JWTResponse } from '@src/lib/types'
import { jwtCookie2EventLocals } from '@ace/jwtCookie2EventLocals'


export const exampleB4: B4<{example: string}> = async ({ event }) => {
  event.locals.example = 'aloha'
  // when using this b4 it'll have typesafety for event.locals.example as a string :)
}


export const authB4: B4<{jwt: JWTResponse}> = async ({ event }) => { // see how we create a jwt in the POST example below w/ jwtCookieSet()
  await jwtCookie2EventLocals(event)
  if (!event.locals.jwt.isValid) return go('/sign-in') // go() knows about all your routes & provides 
}


export const guestB4: B4<{jwt: JWTResponse}> = async ({ event }) => {
  await jwtCookie2EventLocals(event)
  if (event.locals.jwt.isValid) return go('/welcome') // call Go() to send custom status & headers
}
```



### 💛 Parser (For Request Body)!
- Placed in a seperate file so it can be imported into `new API()` (BE) and `new Route()` (FE)
```tsx
import { pipe, email, string, object, nonEmpty } from 'valibot'
import { vParse, type ValibotParser2Input } from '@ace/vParse'


export const signInParser  = vParse( // parsers validate (be) api's & (fe) forms's!
  object({
    email: pipe(string(), email('Please provide a valid email')),
    password: pipe(string(), nonEmpty('Please provide a password')),
  })
)

export type SignInSchema = ValibotParser2Input<typeof signInParser> // by defining runtime validations above, we get compile time types app-wide!
```



### 🧡 POST!
- All the typesafe `db`, `jwt` & `hash` code below works @ `Node` & `Cloudflare Workers` 🥹
```tsx
import { API } from '@ace/api'
import { eq } from 'drizzle-orm'
import { ttlDay } from '@ace/jwtCreate'
import { hashValidate } from '@ace/hashValidate'
import type { JWTPayload } from '@src/lib/types'
import { jwtCookieSet } from '@ace/jwtCookieSet'
import { db, sessions, users } from '@src/lib/db'
import { signInParser } from '@src/parsers/signInParser'


export const POST = new API('/api/sign-in', 'apiSignIn')
  .body(signInParser) // validate / parse request body
  .resolve(async (scope) => {
    const _db = db() // since we'll call db() many times var it out

    const resGetUser = await _db // using their email, get their userId & hashed password
      .select({ userId: users.id, hash: users.password })
      .from(users)
      .where(eq(users.email, scope.body.email))

    const { userId, hash } = resGetUser[0] ?? {}

    if (!userId) return scope.error('Invalid sign in') // call scope.Error() to send custom headers & status codes
    if (!hash) return scope.error('Please sign up')

    const hashResponse = await hashValidate({ hash, password: scope.body.password }) // check if the hash is valid
    if (!hashResponse.isValid) return scope.error('Invalid sign in')

    const ttl = ttlDay // we have exports for ttlMinute, ttlHour & ttlWeek too :)

    const resCreateSession = await _db.insert(sessions) // add session to db so we can always sign someone out by removing their db session
      .values({ userId, expiration: new Date(Date.now() + ttl) })
      .returning({ sessionId: sessions.id })

    const sessionId = resCreateSession[0]?.sessionId // notify if there was a db error
    if (!sessionId) return scope.error('Session create error')

    const payload: JWTPayload = { sessionId } // add jwt to cookie
    await jwtCookieSet({ jwtCreateProps: { ttl, payload } })

    return scope.success('yay')
  })
```



### 💞 Redirect @ `resolve()`!
```tsx
import { API } from '@ace/api'
import { vParse } from '@ace/vParse'
import { object, picklist } from 'valibot'


export const GET = new API('/api/element/:element', 'apiElement')
  .pathParams(vParse(object({ element: picklist(['ether', 'fire', 'water', 'air', 'earth']) })))
  .resolve(async (scope) => {
    return scope.pathParams.element === 'fire' // ✨ Typesafe API Path Params
      ? scope.error('🔥')
      : scope.go('/') // 💫 Typesafe API Redirects
  })
```
- 💨 Props for: `scope.go(path: T, params?: RoutePath2Params<T>)`
    - `path` -  Path to Route as defined @ `new Route()`
    - `params` - Optional, Params to route as an object
- 🏎️ Props for: `scope.Go({ path, params, status = 301, headers }: { path: T, params?: RoutePath2Params<T>, status?: number, headers?: HeadersInit})`
    - `path` -  Path to Route as defined @ `new Route()`
    - `params` - Optional, Params to route as an object
    - `status` - Optional, HTTP Response Status `default: 400`
    - `headers` - Optional, HTTP Response Headers



### 🔀 Redirect @ `new Route()`!
- 🚨 Throw the `go()` or `Go()`, throwing thankfully ends the inference loop of defining and returning a route 🙌
```tsx
import { Route } from '@ace/route'

export default new Route('/')
  .resolve(async ({go}) => {
    throw go('/sign-in')
  })
```



![Squirrel Engineer](https://i.imgur.com/V5J2qJq.jpeg)



# 🙏 Aria Compliant Components



### 🌀 Loading Spinner!
- Add to `app.tsx` => `import '@ace/loading.styles.css'` & then:
  ```tsx
  <Show when={cms.getContent(1)} fallback={<Loading />}>
    <div innerHTML={cms.getContent(1)}/>
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



### 📣 Toast Notification!
- Add to `app.tsx` => `import '@ace/toast.styles.css'` & then:
- Dark Mode
  ```tsx
    const res = await apiSignIn({ bitKey: 'signIn', body })

    if (res.data) showToast({ type: 'success', value: 'Welcome!' })
    else if (res.error?.message) showToast({ type: 'danger', value: res.error.message })
  ```
- Light Mode
  ```tsx
  showToast({ value: ['Light', 'Info'], type: 'info', toastProps: {style: toastStyleLight} })
  ```
- Custom Styles w/ css, CSS:
  ```css
  #ace-toast-wrapper {
    .toast.emerald {
      --ace-toast-bg-color: rgb(6, 95, 70);
      --ace-toast-border-color: rgb(16, 185, 129);
      --ace-toast-icon-color: rgb(6, 78, 59);
      --ace-toast-icon-border: 1px solid rgb(16, 185, 129);
      --ace-toast-icon-bg-color: rgb(209, 250, 229);
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
        '--ace-toast-icon-bg-color': 'rgb(233, 213, 255)',
        '--ace-toast-close-color': 'rgb(139, 92, 246)',
        '--ace-toast-close-hover-border': 'rgb(167, 139, 250)',
        '--ace-toast-close-hover-bg-color': 'rgba(165, 180, 252, 0.2)',
      }

      return <button onClick={() => showToast({ value: 'Custom Lavender 💜', toastProps: {style: toastStyleLavender} })}>Custom Lavender 💜</button>
    })
  ```


### 📣 Modal!
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


### 🗂️ Radio Cards!
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



### 🗄️ Tabs!
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



### 🌠 Slideshow!
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


# Add Tailwind
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



# 🔐 Create Password Hash
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




# 🚀 Deploy!
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


### Add a custom domain! 🎊
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



### ✅ Get `www` DNS to resolve
1. In your wrangler.toml update to: 
  ```toml
  routes = [
    { pattern = "example.com", zone_id = "123456789", custom_domain = true },
    { pattern = "www.example.com", zone_id = "123456789", custom_domain = true }
  ]
  ```


### 💌 Send emails!
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


![Bunnies writing code](https://i.imgur.com/d0wINvM.jpeg)



# 🚨 Error Dictionary!
    Anytime you see "Standard Fix" below, do this please



## ✅ Standard Fix
1. In browser, delete the `Solid Start` cookie that has the cookie name from `./ace.config.js`
1. Stop all local servers running Ace
1. Delete generated `.ace` folder
1. `npm run dev`
1. Ensure the port shown in `bash`, is the port in your `./ace.config.js`
1. Open a new browser tab, place the url from `bash` into the browser & press `Enter`



## 🔔 Errors
1. `TypeError: Comp is not a function at createComponent`
    - Ensure `app.tsx` has `import { createApp } from '@ace/createApp'` and `export default createApp()`
    - Standard Fix
1. `Error: <A> and 'use' router primitives can be only used inside a Route.`
    - This is typically caused by something in the default export function @ `app.tsx` that should not be there, like `useParams()` or `useLocation()`. This function must only have items like  `<Router />`, `<FileRoutes />` or `<Route />`. Then w/in the component functions of the route or layout we may use router primatives
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
            return scope.go('/sign-in/:messageId?')
          })
        ```
    - To this:
        ```ts
        export default new Route('/')
          .component((scope) => {
            throw scope.go('/sign-in/:messageId?')
          })
        ```
    - Throwing thankfully ends the inference loop of defining and returning a route 🙌


# 👷‍♀️ FAQ!
1. How to create secrets (passwords)
    - Bash: `openssl rand -base64 64`
    - The terminal may put the password on 2 lines, but place as one long string in `.env` file

1. How to speak to `ChatGPT` about `Ace`?!
    - If the question `is not` Ace specific then I'll preface w/ `env: SolidJS`
    - If the question `is` Ace specific then I'll preface w/ `env: Ace which is basically SolidStart w/ additional typesafety`

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
