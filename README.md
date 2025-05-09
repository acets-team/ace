![Ace](https://i.imgur.com/jFILQ9P.png)


## 🧐 What is `Ace`?!
- 👋 `Ace` provides **Solid Fundamentals**... For those that ❤️ `fine grained reactivity` **AND** `in-editor autocomplete`!


## 👷‍♀️ Create `Ace` App?!
- Yes please! Just open a `bash` terminal &:
  ```bash
  npx create-ace-app@latest
  ```
- [Wanna see what "create-ace-app" does automatically 🔮?!](https://github.com/acets-team/create-ace-app)


## ✅ Got Features?!
### Standard
1. [Free](#-how-to-deploy) global hosting, 💸 thanks to [Cloudflare](https://www.cloudflare.com/)! ☁️
1. From the **server** or **browser**, call your **API endpoints** as a `typesafe` **function**!
1. **`In editor`**, **`autocomplete`** & **`typesafety`** @:
    - Anchor Tags 🔗
    - Frontend & Backend Redirects 🔀
    - API Requests started server side during page load 🌐
    - Async API Requests started in the browser after page load 💫
1. The initial `page load HTML` is created server-side for lovely `SEO` but then after that initial page load, enjoy **smooth** `Single Page App` routing & navigation! 🧚‍♀️ 
1. On **update**... Only **update**... What **updated**  💪 all **thanks** to [Solid](https://www.solidjs.com/)! 🙏



### Security
1. Smaller than a photo 📸 b/c even when **unminified** `Ace` is less then **`300 kB`**, requires **`0 dependencies`** & was built to be tree shaked! 🌳
1. Simplify cookies, sessions & auth, thanks to the `set()`, `get()` & `clear()`, session data helpers! 🚨 
1. Like middleware, run `async` functions **before** your `route`'s or `api`'s boot! 🔐


### Routes & API
1. Define 0 to many `layouts` for `routes` to be placed within! 📥 
1. Place your `layouts`, `routes` & `apis` wherever ya love! 💚
1. `Define`, `read` and `validate`, **path or search** `params`, at **api's or route's**! 🪷
1. Enjoy fast initial page load times, b/c all static content is in the initial HTML! 😊
1. Have static content available immediately, make multiple api calls during a page reder, and as each dynamic promise resolves (ex: database data), stream that item back to the frontend! 🎉
1. So when Request processing begins on the server, so does dynamic data gathering. If dynamic data is ready before the page has been built that dynamic data will be included in the initial page load and all else will stream once that item is ready! 💫


### Getting Started
1. Create new projects 👩‍🍼 and build the **`autocompleting intellisense types`** for existing ones 🏗️ wih our `blazingly-fast cli`! ⚡️
1. A super simple api, with tons of [JSDOC](https://jsdoc.app/) comments for in editor docs & examples  when hovering over `Ace` **types, functions and components**! 🤓


### Honorable Mentions
1. `<AnimatedFor />` - Animate your lovely lists, with CSS animations! 🌀
1. `<Messages />` - Show `form save error messages`, for the form as a hole AND per input, by the input! 🎯
1. `Shimmer` & `LoadSpin`: Show gentle loading animations with CSS! ✨
1. `ParamEnums`: Simply define all the `enums` a `url param` can be and then validate the url (ex: `'earth' | 'air' | 'fire' | 'water'`)
1. `parseNumber()`: Also helpful w/ params, to find out is a param `a number`, a `specific` number and/or `between` 2 numbers to help gain url param **confidence**!
1. `mongoConnect()` & `mongoModel()` - Manage mongo connection pools & enhance its standard typesafety!
1. `cuteLog()` - Create strings w/ 30+ customization options to add some style to your terminal logs! 🎨
1. `holdUp()` - Pause for a specific or random amount of time! ⏳
1. `lorem()` - Generate `lorem ipsum` words & paragraphs! ✍️


## 🧚‍♀️ Got code?!
### GET! 💖
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha', 'apiAloha') // now we've got an api endpoint @ the path /api/aloha AND we can call the function apiAloha() app-wide w/ request & response typesafety!
  .resolve(async (be) => {
    return be.json({ aloha: true })
  })
```


### Params! 💜
- Required & optional params available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha/:id', 'apiAloha')
  .params<{ id: string }>() // set params type here & then this api's params are known @ .resolve() & app-wide 🙌
  .resolve(async (be) => {
    return be.json({ params: be.getParams() })
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
    return be.json({ aloha: true })
  })
```


### Create Middleware! 💚
```tsx
import { go } from '@ace/go'
import type { B4 } from '@ace/types'

export const guestB4: B4 = async (ctx) => {
  if (ctx.sessionData) return go('/contracts') // go() knows about all your routes & provides autocomplete!
}

export const authB4: B4 = async (ctx) => {
  if (!ctx.sessionData) return go('/sign-in/:messageId?', {messageId: '1'})
}
```


### POST! 🧡
```tsx
import { go } from '@ace/go'
import { API } from '@ace/api'
import { compare } from 'bcrypt'
import { guestB4 } from '@src/lib/b4'
import { SessionData } from 'ace.config'
import { M_User } from '@src/db/M_User'
import { setSessionData } from '@ace/session'
import { mongoConnect } from '@ace/mongoConnect'
import { signInSchema, SignInSchema } from '@src/schemas/SignInSchema'


export const POST = new API('/api/sign-in', 'apiSignIn')
  .b4(guestB4)
  .body<SignInSchema>() // tells .resolve() & app-wide the request body this api requires
  .resolve((be) => {
    const body = signInSchema.parse(await be.getBody()) // get, validate & parse the request body in 1 line!

    await mongoConnect() // ensures 1 mongo pool is running

    const user = await M_User.get().findOne({ email: body.email }).lean()

    if (!user) throw new Error('Please use valid credentials')

    if (!await compare(body.password, user.passwordHash)) throw new Error('Please use valid credentials')

    const sessionData: SessionData = { id: user.id }

    setSessionData(sessionData)

    return be.go('/auhenticated') // go() knows about all your routes & provides autocomplete!
  }
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
import GuestNav from './GuestNav'
import { Layout } from '@ace/layout'


export default new Layout()
  .component((fe) => {
    return <>
      <div class="guest">
        <GuestNav />
        {fe.getChildren()}
      </div>
    </>
  })
```


### Route! 🌟
```tsx
import { A } from '@ace/a'
import { Title } from '@solidjs/meta'
import { Route } from '@ace/route'


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
  .layouts([RootLayout]) // zero to many layouts available!
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
    import '@ace/shimmer.styles'
    import { load } from '@ace/load'
    import { Route } from '@ace/route'
    import { Suspense } from 'solid-js'
    import { apiCharacter } from '@ace/apis'
    import type { InferParseFn } from '@ace/types'
    import type { InferEnums } from '@ace/paramEnums'
    import type { elementEnums } from '@src/lib/vars'


    export default new Route('/smooth')
      .component(() => {
        const air = load(() => apiCharacter({params: {element: 'air'}}), 'air')
        const fire = load(() => apiCharacter({params: {element: 'fire'}}), 'fire')
        const earth = load(() => apiCharacter({params: {element: 'earth'}}), 'earth')
        const water = load(() => apiCharacter({params: {element: 'water'}}), 'water')

        return <Characters res={{ air, fire, earth, water }} />
      })

    function Characters({ res }: { res: Record<InferEnums<typeof elementEnums>, InferParseFn<'apiCharacter'>> }) {
      return <>
        <div class="characters">
          <Character element={res.fire} />
          <Character element={res.water} />
          <Character element={res.earth} />
          <Character element={res.air} />
        </div>
      </>
    }


    function Character({ element }: { element: InferParseFn<'apiCharacter'> }) {
      return <>
        <div class="character">
          <Suspense fallback={<div class="shimmer"></div>}>
            {element()?.error?.message || element()?.data?.character}
          </Suspense>
        </div>
      </>
    }
    ```

### Infer! 🧚‍♀️
- In the example above we use `InferParseFn`
- When using an `Infer`, example: `InferParseFn<''>`, place your insertion point in the string, press **control + space** & get autocomplete. Every `Infer` has this feature, every `Infer` may be found @ `@ace/types` and the  most frequently used are:
    - **`✅ InferParseFn`**
        - Autocomplete: **All API Functions**
        - Type: **API Function Response**
        - Example: `InferParseFn<'apiCharacter'>`
    - **`✅ InferResponseGET`**
        - Autocomplete: **Path to each api GET**
        - Type: **API Response Body**
        - Example: `InferResponseGET<'/api/example'>`
    - **`✅ InferParamsGET`**
        - Autocomplete: **Path to each api GET**
        - Type: **API Params**
        - Example: `InferParamsGET<'/api/example/:id'>`
    - **`✅ InferBodyPOST`**
        - Autocomplete: **Path to each api POST**
        - Type: **API Request Body**
        - Example: `InferBodyPOST<'/api/example'>`
    - **`✅ InferParamsRoute`**
        - Autocomplete: **Path to each route**
        - Type: **Route Params**
        - Example: `InferParamsRoute<'/example/:id'>`
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


## 💖 Next!
- [FAQ](https://github.com/acets-team/ace/blob/main/README_FAQ.md)
- [Error Dictionary](https://github.com/acets-team/ace/blob/main/README_ERRORS.md)
