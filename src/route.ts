import express from 'express'
import { categoriesController } from './controllers/categoriesController.js'
import { coursesController } from './controllers/coursesController.js'
import { episodesController } from './controllers/episodesController.js'
import { authController } from './controllers/authController.js'
import { ensureAuth, ensureAuthViaQuery } from './middlewares/auth.js'
import { likesController } from './controllers/likesController.js'
import { favoritesController } from './controllers/favoriteController.js'
import { usersController } from './controllers/userController.js'
import { quizResultController } from './controllers/quizResultController.js'
import { stripeController } from './controllers/stripeController.js'


const router = express.Router()


router.get('/subscribe', ensureAuth, stripeController.stripeSubscribe)
router.get('/customers/:customerId', stripeController.stripeCustomers)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook)

router.post('/auth/register', express.json(), authController.register)
router.post('/auth/login', express.json(), authController.login)

router.get('/categories', express.json(), categoriesController.index)
router.get('/categories/:id', express.json(), categoriesController.show)

router.get('/courses/featured', express.json(), ensureAuth, coursesController.featured)
router.get('/courses/newest', express.json(), coursesController.newest)
router.get('/courses/popular', express.json(), ensureAuth, coursesController.popular)
router.get('/courses/search', express.json(), coursesController.search)
router.get('/courses/:id', express.json(), ensureAuth, coursesController.show)
router.get('/course/quizz/:id', express.json(), ensureAuth, coursesController.showQuizz)

router.get('/courses/:id/quizzResult', express.json(), ensureAuth, quizResultController.showQuizResult)
router.post('/courses/:id/quizzResult', express.json(), ensureAuth, quizResultController.setQuizResult)

router.get('/episodes/stream', express.json(), ensureAuthViaQuery, episodesController.stream)
router.get('/episodes/:id/watchTime', express.json(), ensureAuth, episodesController.getWatchTime)
router.post('/episodes/:id/watchTime', express.json(), ensureAuth, episodesController.setWatchTime)
router.get('/episodes/:episodeId', express.json(), ensureAuth, episodesController.show)

router.get('/favorites', express.json(), ensureAuth, favoritesController.index)
router.post('/favorites', express.json(), ensureAuth, favoritesController.save)
router.delete('/favorites/:id', express.json(), ensureAuth, favoritesController.delete)

router.post('/likes', express.json(), ensureAuth, likesController.save)
router.delete('/likes/:id', express.json(), ensureAuth, likesController.delete)

router.get('/users/current', express.json(), ensureAuth, usersController.show)
router.get('/users/current/watching', express.json(), ensureAuth, usersController.watching)
router.put('/users/current', express.json(), ensureAuth, usersController.update)
router.put('/users/current/password', express.json(), ensureAuth, usersController.updatePassword)


export { router }