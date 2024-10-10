import { STRIPE_API_KEY } from '../config/environment.js'
import Stripe from 'stripe'

export const stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20'
})