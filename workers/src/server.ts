import { serve } from "@hono/node-server"
import app from "./index"

const port = parseInt(process.env.PORT || "8080", 10)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Titanium Gym API running on port ${info.port}`)
})
