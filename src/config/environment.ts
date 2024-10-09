// import * as env from 'env-var'
import dotenv from 'dotenv'
dotenv.config()
import env from 'env-var'

export const DATABASE_URL = env.get("DATABASE_URL").required().asString()
export const ADMINJS_COOKIE_PASSWORD = env.get("ADMINJS_COOKIE_PASSWORD").required().asString()
export const JWT_KEY = env.get("JWT_KEY").required().asString()
export const STRIPE_API_KEY = env.get("STRIPE_API_KEY").required().asString()
export const STRIPE_PRICE_ID = env.get("STRIPE_PRICE_ID").required().asString()
export const STRIPE_WEBHOOK_SECRET = env.get("STRIPE_WEBHOOK_SECRET").required().asString()