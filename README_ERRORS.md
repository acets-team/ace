# 🚨 Error Dictionary!

    Anytime you see "Standard Fix" do this please

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