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
1. The initial `page load HTML` is created server-side for lovely `SEO` but then after that initial page load, enjoy **smooth** `Single Page App` routing & navigation! 🧚‍♀️ 
1. If calling your API & already on the server, `call api endpoints as a function`, to **skip** HTTP, TCP & Serialization overhead! 🙌
1. On **update**... Only **update**... What **updated**  💪 all **thanks** to [Solid](https://www.solidjs.com/)! 🙏
1. **`In editor`**, **`autocomplete`** & **`typesafety`** @:
    - Anchor Tags 🔗
    - Frontend & Backend Redirects 🔀
    - API Requests started server side during page load 🌐
    - Async API Requests started in the browser after page load 💫

### Security
1. Smaller than a photo 📸 b/c even when **unminified** `Ace` is less then **`180 kB`**, requires **`0 dependencies`** & was built to be tree shaked! 🌳
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

export const GET = new API('/api/aloha')
  .resolve(async (be) => {
    return be.json({ aloha: true })
  })
```


### Params! 💜
- Required & optional params available @ `routes` & `apis`!
```tsx
import { API } from '@ace/api'

export const GET = new API('/api/aloha/:id')
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

export const GET = new API('/api/aloha')
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


export const POST = new API('/api/sign-in')
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


### Route w/ Async Data! 💫
- Async data requests (seen below @ `load()`) run simultaneously and populate in app once resolved!
- If this page is refreshed, data begins gathering on the server
- If this page is navigated to via a link w/in the app (SPA navigation), then the data request starts from the browser
- First w/in your API definition
    1. Specify `.fn('apiCharacter')`
    1. Place the function name you want in there
- & then to use it:
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


### Form! ✨
  ```tsx
  import { Title } from '@solidjs/meta'
  import { guestB4 } from '@src/lib/b4'
  import RootLayout from '../RootLayout'
  import { clear } from '@ace/clear'
  import { Route } from '@ace/route'
  import GuestLayout from './Guest.Layout'
  import { Submit } from '@ace/submit'
  import { Messages } from '@ace/messages'
  import { signUpSchema } from '@src/schemas/SignUpSchema'
  import { createOnSubmit } from '@ace/createOnSubmit'


  export default new Route('/sign-up/:sourceId?')
    .b4(guestB4) // run this asyc fn b4 route render
    .layouts([RootLayout, GuestLayout]) // Root wraps Guest, Guest wraps this Route!
    .component((fe) => {
      const onSubmit = createOnSubmit(async (fd) => { // createOnSubmit() places this async fn() into a try/catch for us & on fe or be catch, <Messages /> get populated below!
        const body = signUpSchema.parse({ // get parse & validate request body
          email: fd('email'), // fd() is a form data helper
          password: fd('password')
        }) 

        await fe.POST('/api/sign-up', { body, bitKey: 'signUp' }) // a bit is a boolean signal 💃 & this path & body have autocomplete!
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
- [Cloudflare](https://www.cloudflare.com/) offers free global hosting! 🥹
    - Create a GitHub account or Sign in
    - Push to a public or private repository
    - Create a Cloudlfare account or Sign in
    - Navigate to `Workers & Pages`
    - Add you Github account information
    - Do an initial push to main, aka deploy, just to get an env url
    - Add the env url to your `./ace.config.js`
    - Example:
      ```js
      envs: [
        { name: 'local', url: 'http://localhost:3000' },
        { name: 'prod', url: 'https://example.ace.workers.dev' },
      ]
      ```
    - 💖 Deploy!

![Bunnies writing code](https://i.imgur.com/d0wINvM.jpeg)


## 💖 FAQ
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

1. How to get the alter icon for `.tsx` files in VS Code
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

1. Gotta errors dictionary?
    -  [Yes please!](https://github.com/acets-team/ace/blob/main/README_ERRORS.md)
