import express from 'express'
import { categoriesController } from './controllers/categoriesController.js'
import { coursesController } from './controllers/coursesController.js'
import { episodesController } from './controllers/episodesController.js'
import { authController } from './controllers/authController.js'
import { ensureAuth, ensureAuthViaQuery } from './middlewares/auth.js'
import { likesController } from './controllers/likesController.js'
import { favoritesController } from './controllers/favoriteController.js'
import { usersController } from './controllers/userController.js'

const router = express.Router()

router.post('/auth/register', authController.register)
router.post('/auth/login', authController.login)

router.get('/categories', categoriesController.index)
router.get('/categories/:id', categoriesController.show)

router.get('/courses/featured', coursesController.featured)
router.get('/courses/newest', coursesController.newest)
router.get('/courses/popular', ensureAuth, coursesController.popular)
router.get('/courses/search', coursesController.search)
router.get('/courses/:id', ensureAuth, coursesController.show)
router.get('/course/quizz/:id', coursesController.showQuizz)

router.get('/episodes/stream', ensureAuthViaQuery, episodesController.stream)
router.get('/episodes/:id/watchTime', ensureAuth, episodesController.getWatchTime)
router.post('/episodes/:id/watchTime', ensureAuth, episodesController.setWatchTime)
router.get('/episodes/:episodeId', ensureAuth, episodesController.show)
    
router.get('/favorites', ensureAuth, favoritesController.index)
router.post('/favorites', ensureAuth, favoritesController.save)
router.delete('/favorites/:id', ensureAuth, favoritesController.delete)

router.post('/likes', ensureAuth, likesController.save)
router.delete('/likes/:id', ensureAuth, likesController.delete)

router.get('/users/current', ensureAuth, usersController.show)
router.get('/users/current/watching', ensureAuth, usersController.watching)
router.put('/users/current', ensureAuth, usersController.update)
router.put('/users/current/password', ensureAuth, usersController.updatePassword)


export { router }