import { Application } from 'https://deno.land/x/oak/mod.ts'
import { router } from './router.ts'

const PORT = 8007

const app = new Application()

app.addEventListener('error', (evt) => {
  console.log(evt.error)
})
app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: PORT })

