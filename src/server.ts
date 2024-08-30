import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { database } from './database/index.js'
import { adminJs, adminJsRouter } from './adminjs/index.js'
import { router } from './route.js'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.static('public'))
app.use(express.static('files'))
app.use(express.json())
app.use(router)

app.use(adminJs.options.rootPath, adminJsRouter)

app.listen(PORT, () => {
    database.authenticate().then(() => {
        console.log('DB connection succesful')
    })
    console.log(`Server succesfully started at port ${PORT}`)
})