import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import activitiesRoutes from "./routes/activities.routes.js"
import authRoutes from "./routes/auth.routes.js"
import groupsRoutes from "./routes/groups.routes.js"
import journalRoutes from "./routes/journal.routes.js"
import meRoutes from "./routes/me.routes.js"
import messagesRoutes from "./routes/messages.routes.js"
import postsRoutes from "./routes/posts.routes.js"
import resourcesRoutes from "./routes/resources.routes.js"
import usersRoutes from "./routes/users.routes.js"

dotenv.config()

const app = express()
app.use(express.json())

app.use(cors())

app.use("/activities", activitiesRoutes)
app.use("/auth", authRoutes)
app.use("/groups", groupsRoutes)
app.use("/journal", journalRoutes)
app.use("/me", meRoutes)
app.use("/messages", messagesRoutes)
app.use("/posts", postsRoutes)
app.use("/resources", resourcesRoutes)
app.use("/users", usersRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Serveur sur le http://localhost:${PORT}/`)
})