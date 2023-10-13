import { Hono } from 'hono'

import { banner } from "./banner";

const app = new Hono()

app.get('/', (c) => c.text(banner()));

export default app
