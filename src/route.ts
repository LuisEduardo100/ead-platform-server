import express from 'express'
import { categoriesController } from './controllers/categoriesController.js'
import { coursesController } from './controllers/coursesController.js'
import { episodesController } from './controllers/episodesController.js'
import { authController } from './controllers/authController.js'
import { ensureAuth, ensureAuthViaQuery, requirePremium } from './middlewares/auth.js'
import { likesController } from './controllers/likesController.js'
import { favoritesController } from './controllers/favoriteController.js'
import { usersController } from './controllers/userController.js'
import { quizResultController } from './controllers/quizResultController.js'
import { stripeController } from './controllers/stripeController.js'
import { emailController } from './controllers/emailController.js'
import { filesController } from './controllers/filesController.js'


const router = express.Router()

router.post('/emailSend', express.json(), emailController.sendEmail)
router.get('/subscribe', ensureAuth, stripeController.stripeSubscribe)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.stripeWebhook)
router.get('/customers/:customerId', express.json(), ensureAuth, stripeController.stripeCustomers)
router.get('/apostilas', express.json(), filesController.allFiles)
router.get('/verify-session/:sessionId', express.json(), stripeController.verifyStripe)

router.post('/auth/register', express.json(), authController.register)
router.post('/auth/login', express.json(), authController.login)
router.post('/users/forgotPassword', express.json(), authController.forgotPassword)
router.post('/confirmEmail', express.json(), authController.confirmEmail)

router.get('/categories', express.json(), categoriesController.index)
router.get('/categories/:id', express.json(), categoriesController.show)

router.get('/courses/featured', express.json(), ensureAuth, coursesController.featured)
router.get('/courses/newest', express.json(), coursesController.newest)
router.get('/courses/popular', express.json(), ensureAuth, coursesController.popular)
router.get('/courses/search', express.json(), coursesController.search)
router.get('/courses/gsearch', express.json(), coursesController.generalSearch)
router.get('/courses/:id', express.json(), ensureAuth, coursesController.show)

router.get('/episodes/stream', express.json(), ensureAuthViaQuery, episodesController.stream)
router.get('/episodes/:id/watchTime', express.json(), ensureAuth, episodesController.getWatchTime)
router.post('/episodes/:id/watchTime', express.json(), ensureAuth, episodesController.setWatchTime)
router.get('/episodes/:episodeId', express.json(), ensureAuth, episodesController.show)

router.get('/episodes/:id/questoes', express.json(), ensureAuth, episodesController.showQuizz)
router.get('/episodes/:id/quizzResult', express.json(), ensureAuth, quizResultController.showQuizResult)
router.post('/episodes/:id/quizzResult', express.json(), ensureAuth, quizResultController.setQuizResult)

router.get('/favorites', express.json(), ensureAuth, favoritesController.index)
router.post('/favorites', express.json(), ensureAuth, favoritesController.save)
router.delete('/favorites/:id', express.json(), ensureAuth, favoritesController.delete)

router.post('/likes', express.json(), ensureAuth, likesController.save)
router.delete('/likes/:id', express.json(), ensureAuth, likesController.delete)

router.get('/users/current', express.json(), ensureAuth, usersController.show)
router.get('/users/changePasswordUser', express.json(), usersController.show)
router.get('/users/current/watching', express.json(), ensureAuth, usersController.watching)
router.put('/users/current', express.json(), ensureAuth, usersController.update)
router.put('/users/current/password', express.json(), ensureAuth, usersController.updatePassword)
router.post('/users/current/profileImage', express.json(), ensureAuth, usersController.uploadProfilePicture);
router.post('/users/current/recoverPassword', express.json(), usersController.recoverPassword)

export { router }