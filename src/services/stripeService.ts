import Stripe from 'stripe'


const STRIPE_API_KEY = 'sk_test_51PwAkMHQFoXB7Wmvc2BMOMmbsUprLuv5b0ZCbcDW4NVwW6oHxND87mvzMOolJzAunEsea9ImN4m87pqZM97t2FxI008Hec5GVM'

export const stripe = new Stripe(STRIPE_API_KEY, {
    apiVersion: '2024-06-20'
})