import { handle } from 'hono/vercel'
import { buildApp } from '../src/server.js'
export const config = { runtime: 'edge' }
const { app } = typeof buildApp === 'function' ? buildApp() : buildApp;
export default handle(app)
