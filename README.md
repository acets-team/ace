![Ace](https://i.imgur.com/UWcQSn7.png)



### Create an Ace App ✅
```bash
npx create-ace-app@latest
```

### GET! 💖
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha', 'apiAloha') // now we've got an api endpoint @ the path /api/aloha AND we can call the function apiAloha() on the frontend or backed w/ request & response typesafety!
  .resolve(async (be) => {
    return be.success({ aloha: true }) // call be.Success() to set custom status code / headers
  })
```


### Params! 💜
- Required & optional params available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha/:id', 'apiAloha')
  .params<{ id: string }>() // set params type here & then this api's params are known @ .resolve() & app-wide 🙌
  .resolve(async (be) => {
    const {id} = be.getParams() // typesafe!
    return be.success({ id })
  })
```


### Use Middleware! 💙
- Available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'
import { authB4 } from '@src/lib/b4'

export const GET = new API('/api/aloha', 'apiAloha')
  .b4(authB4) // run the `authB4()` async function before this api boots!
  .resolve(async (be) => {
    return be.success({ aloha: true })
  })
```


### Create Middleware! 💚
```tsx
import { go } from '@ace/go'
import type { B4 } from '@ace/types'

export const guestB4: B4 = async (jwt) => {
  if (jwt.isValid) return go('/contracts') // go() knows about all your routes & provides autocomplete!
}

export const authB4: B4 = async (jwt) => {
  if (!jwt.isValid) return go('/sign-in/:messageId?', {messageId: '1'}) // call Go() to send custom status & headers
}
```


### Redirect @ `resolve()`! 💞
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha/:id', 'apiAloha')
  .params<{ id: string }>()
  .resolve(async (be) => {
    const {id} = be.getParams()
    return id === 9 ? be.go('/example') : be.success({ id }) // be.go() knows about all your routes & provides autocomplete!
  })
```


### POST! 🧡
- All the typesafe `db`, `jwt` & `hash` code in this example works @ `Node` & `Cloudflare Workers` 🥹
```tsx
import { API } from '@ace/api'
import { eq } from 'drizzle-orm'
import { ttlDay } from '@ace/jwtCreate'
import { JWTPayload } from 'ace.config'
import { hashValidate } from '@ace/hashValidate'
import { jwtCookieSet } from '@ace/jwtCookieSet'
import { db, sessions, users } from '@src/lib/db'
import { signInSchema, type SignInSchema } from '@src/schemas/SignInSchema'


export const POST = new API('/api/sign-in', 'apiSignIn')
  .body<SignInSchema>()
  .resolve(async (be) => {
    const body = signInSchema.parse(await be.getBody()) // get, validate & parse body to { email: string, password: string }

    const _db = db() // since we'll call db() many times var it out

    const resGetUser = await _db // using their email, get their userId & hashed password
      .select({ userId: users.id, hash: users.password })
      .from(users)
      .where(eq(users.email, body.email))

    const { userId, hash } = resGetUser[0] ?? {}

    if (!userId) return be.error('Invalid sign in') // call be.Error() to send custom headers & status codes
    if (!hash) return be.error('Please sign up')

    const hashResponse = await hashValidate({ hash, password: body.password }) // check if the hash is valid
    if (!hashResponse.isValid) return be.error('Invalid sign in')

    const ttl = ttlDay // we have exports for ttlMinute, ttlHour & ttlWeek too :)

    const resCreateSession = await _db.insert(sessions) // add session to db so we can always sign someone out by removing their db session
      .values({ userId, expiration: new Date(Date.now() + ttl) })
      .returning({ sessionId: sessions.id })

    const sessionId = resCreateSession[0]?.sessionId // notify if there was a db error
    if (!sessionId) return be.error('Session create error')

    const payload: JWTPayload = { sessionId } // add jwt to cookie
    await jwtCookieSet({ jwtCreateProps: { ttl, payload } })

    return be.success({yay: true})
  })
```


![Sloths developing software in a tree](https://i.imgur.com/LognTyf.jpeg)


### Schema 💛
```tsx
import { pipe, email, string, object, nonEmpty } from 'valibot'
import { ValibotSchema, type InferValibotSchema } from '@ace/valibotSchema'


export const signInSchema = new ValibotSchema( // schema's validate (be) api's above & (fe) route's below!
  object({
    email: pipe(string(), email('Please provide a valid email')),
    password: pipe(string(), nonEmpty('Please provide a password')),
  })
)

export type SignInSchema = InferValibotSchema<typeof signInSchema> // by defining runtime validations above, we get compile time types app-wide!
```


### Layout! ❤️
```tsx
import './Guest.css'
import Nav from './Nav'
import { Layout } from '@ace/layout'


export default new Layout()
  .component((fe) => {
    return <>
      <div class="guest">
        <Nav />
        {fe.getChildren()}
      </div>
    </>
  })
```


### Route! 🌟
```tsx
import { A } from '@ace/a'
import { Route } from '@ace/route'
import { Title } from '@solidjs/meta'


export default new Route('/yin') // this route uses no layouts!
  .component((fe) => {
    return <>
      <Title>Yin</Title>
      <A path="/yang">Yang</A> {/* The <A /> component knows about your routes & provides autocomplete! 🙌 */}
    </>
  })
```


### 404 Route! ☀️
```tsx
import './404.css'
import { A } from '@ace/a'
import { Title } from '@solidjs/meta'
import RootLayout from '../RootLayout'
import { Route404 } from '@ace/route404'


export default new Route404()
  .layouts([RootLayout]) // zero to many layouts available @ Route or Route404!
  .component((fe) => {
    return <>
      <Title>😅 404</Title>

      <main class="not-found">
        <div class="code">404 😅</div>
        <div class="message">Oops! We can't find that page.</div>
        <div class="path">{fe.getLocation().pathname}</div>
        <A path="/" class="brand">🏡 Go Back Home</A>
      </main>
    </>
  })

```


### Route w/ Async Data! 💫
- Async data requests (seen below @ `load()`) run simultaneously and populate in app once resolved!
- If this page is refreshed, data begins gathering on the server
- If this page is navigated to via a link w/in the app (SPA navigation), then the data request starts from the browser
- How to:
    1. First w/in your API definition: `export const GET = new API('/api/character/:element', 'apiCharacter')`
    1. & then call your API w/in the `route` or `layout` as many times as ya ❤️:
    ```tsx
    import '@ace/shimmer.styles.css'
    import { load } from '@ace/load'
    import { Route } from '@ace/route'
    import { Suspense } from 'solid-js'
    import { apiCharacter } from '@ace/apis'
    import type { InferLoadFn } from '@ace/types'
    import type { InferEnums } from '@ace/paramEnums'
    import type { elementEnums } from '@src/lib/vars'


    export default new Route('/smooth')
      .component(() => {
        const air = load(() => apiCharacter({params: {element: 'air'}}), 'air')
        const fire = load(() => apiCharacter({params: {element: 'fire'}}), 'fire')
        const earth = load(() => apiCharacter({params: {element: 'earth'}}), 'earth')
        const water = load(() => apiCharacter({params: {element: 'water'}}), 'water')

        return <>
          <h1>This element will render immediately</h1>
          <Characters res={{ air, fire, earth, water }} />
        </>
      })

    function Characters({ res }: { res: Record<InferEnums<typeof elementEnums>, InferLoadFn<'apiCharacter'>> }) { // once you type InferLoadFn<''> all the api function names appear in the sring thanks to Ace typesafety!
      return <>
        <div class="characters">
          <Character element={res.fire} />
          <Character element={res.water} />
          <Character element={res.earth} />
          <Character element={res.air} />
        </div>
      </>
    }


    function Character({ element }: { element: InferLoadFn<'apiCharacter'> }) { // once a load has finished the character will render
      return <>
        <div class="character">
          <Suspense fallback={<div class="ace-shimmer"></div>}>
            {element()?.error?.message || element()?.data?.character}
          </Suspense>
        </div>
      </>
    }
    ```


### Form! ✨
```tsx
import { clear } from '@ace/clear'
import { Route } from '@ace/route'
import { Submit } from '@ace/submit'
import { apiSignUp } from '@ace/apis'
import { Title } from '@solidjs/meta'
import { guestB4 } from '@src/lib/b4'
import RootLayout from '../RootLayout'
import GuestLayout from './Guest.Layout'
import { Messages } from '@ace/messages'
import { createOnSubmit } from '@ace/createOnSubmit'
import { signUpSchema } from '@src/schemas/SignUpSchema'


export default new Route('/sign-up/:sourceId?')
  .b4(guestB4) // run this asyc fn b4 route render
  .layouts([RootLayout, GuestLayout]) // Root wraps Guest, Guest wraps this Route!
  .component((fe) => {
    const onSubmit = createOnSubmit(async (fd) => { // createOnSubmit() places this async fn() into a try/catch for us & on fe or be catch, <Messages /> get populated below!
      const body = signUpSchema.parse({ // get parse & validate request body
        email: fd('email'), // fd() is a form data helper
        password: fd('password')
      }) 

      await apiSignUp({ body, bitKey: 'signUp' }) // a bit is a boolean signal 💃 & the body has autocomplete!
    })

    return <>
      <Title>Sign Up</Title>

      <form onSubmit={onSubmit}>
        <input placeholder="Email" name="email" type="email" use:clear />
        <Messages name="email" /> {/* shows messages, from signUpSchema.parse() and/or fe.POST(), for just the email input! 🚀 */}

        <input placeholder="Password" name="password" type="password" use:clear /> {/* the use:clear directive clears password <Messages /> on first interaction w/ this input! */}
        <Messages name="password" />

        <div class="footer">
          <Submit label="Sign Up" bitKey="signUp" /> {/* Uses fe.bits.isOn('signUp') to show a loading indicator! 🏋️‍♂️ */}
        </div>
      </form>
    </>
  }
})
```


### Redirect @ `b4()`! 🤓
- If your b4 is in an imported function like above @ `Create Middleware` then no need to throw the redirect
- If your b4 is defined in the same chain as defining a Route like below, throw a goThrow() to avoid the cirular type loops of defining a Route and returning a Route simultaneously ✅
```tsx
import { goThrow } from '@ace/go'
import { Route } from '@ace/route'

export default new Route('/')
  .b4(async () => {
    throw goThrow('/sign-in') // goThrow() knows about all your routes & provides autocomplete!
  })
```
![Squirrel Engineer](https://i.imgur.com/V5J2qJq.jpeg)


## 🚀 How to Deploy!
### [Cloudflare](https://www.cloudflare.com/) offers free global hosting! 🥹
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
1. Copy worker env url
1. Add the env url to your `./ace.config.js`
1. Example:
    ```js
    envs: [
      { name: 'local', url: 'http://localhost:3000' },
      { name: 'prod', url: 'https://example.ace.workers.dev' },
    ]
    ```
1. Locally at your project root (where package.json is) create `wrangler.toml`
1. In the first line place the worker name that you gave to cloudflare: `name = "your-project-name"`
1. On the 2nd line place today's date: `compatibility_date = "2025-01-30"`
1. Locally navigate to `.env` at your project root
1. For each item here, tell cloudflare about it, example: `npx wrangler secret put SESSION_CRYPT_PASSWORD`
1. Bash: `ace build prod` or `npx ace build prod` (`npx` is required when a `-g` is not done @ `npm i`)
1. Navigate to `Workers & Pages` > `Your Project` > `Deployments`
1. 💫 Push to GitHub aka **Deploy**! ❤️


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
    - Ensure the props on your functional components are destructured so rather then `export function ExampleComponent(fe: FE)` it should be `export function ExampleComponent({ fe }: { fe: FE })` 
1. `'default' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.`
    - Change this:
        ```ts
        import { go } from '@ace/go'
        import { Route } from '@ace/route'

        export default new Route('/')
          .b4(async () => {
            return go('/sign-in')
          })
        ```
    - To this:
        ```ts
        import { goThrow } from '@ace/go'
        import { Route } from '@ace/route'

        export default new Route('/')
          .b4(async () => {
            throw goThrow('/sign-in')
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
