import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { database } from './database/index.js'
import { adminJs, adminJsRouter } from './adminjs/index.js'
import { router } from './route.js'
import cors from 'cors'
import formidable from 'express-formidable'

const app = express()

const PORT = process.env.PORT || 3000 || 4040 || 8080

app.use(cors())
app.use(express.static('public'))
app.use(express.static('files'))
app.use((req, res, next) => {
    if (req.path.includes('/admin/api/resources/episodes/actions/new') && req.method === 'POST') {
        formidable({
            maxFileSize: 1024 * 1024 * 1024, // 1 GB
        })(req, res, next);
    } else {
        next();
    }
});
app.use(router)
app.use(express.json())
app.use(adminJs.options.rootPath, adminJsRouter)

app.listen(PORT, () => {
    database.authenticate().then(() => {
        console.log('DB connection succesful')
    })
    console.log(`Server succesfully started at port ${PORT}`)
})
