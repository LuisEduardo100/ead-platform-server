import AdminJS, { ComponentLoader } from 'adminjs'
import AdminJsExpress from '@adminjs/express'
import AdminJsSequelize from '@adminjs/sequelize'
import {database} from '../database/index.js'
import { adminJsResources } from './resources/index.js'
import { componentLoader } from './resources/episode.js'
import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import { locale } from './locale.js'
import { ADMINJS_COOKIE_PASSWORD } from '../config/environment.js'
import session from 'express-session'
import connectionSession from 'connect-session-sequelize'

//evitar que dados sejam armazenados na memória e armazená-los no banco de dados
const SequelizeStore = connectionSession(session.Store)
const store = new SequelizeStore({db: database})
store.sync()

const loader = new ComponentLoader()
AdminJS.registerAdapter(AdminJsSequelize)

export const adminJs = new AdminJS({
    databases: [database],
    rootPath: '/admin',
    componentLoader,
    locale: locale,
    resources: adminJsResources,
    branding: {
        companyName: 'VoceNotaDez',
        logo: '/vocenotadez.svg',
        // // theme: {
        //     colors: {
        //         primary100: '#ff0043',
        //         primary80: '#ff1a57',
        //         primary60: '#ff3369',
        //         primary40: '#ff4d7c',
        //         primary20: '#ff668f',
        //         grey100: '#151515',
        //         grey80: '#333333',
        //         grey60: '#4d4d4d',
        //         grey40: '#666666',
        //         grey20: '#dddddd',
        //         filterBg: '#F7F7E8',
        //         accent: '#F7F7E8',
        //         hoverBg: '#F7F7E8',
        //     }
        // }
    }
})

export const adminJsRouter = AdminJsExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
        const user = await User.findOne({where: {email}})
        if (user && user.role === 'admin') {
            const matched = await bcrypt.compare(password, user.password)
            if (matched){
                return user
            }
        }
        return false
    },
    cookiePassword: ADMINJS_COOKIE_PASSWORD
}, null, {
    resave: false,
    saveUninitialized: false,
    store: store,
    secret: ADMINJS_COOKIE_PASSWORD
})

adminJs.watch()