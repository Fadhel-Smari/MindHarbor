import express from "express"
import dotenv from "dotenv"
import cors from "cors"
dotenv.config()

const app = express()
app.use(express.json())

app.use(cors())



const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`Serveur sur le http://localhost:${PORT}/`)
})