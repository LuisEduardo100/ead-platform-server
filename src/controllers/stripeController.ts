import { Request, Response } from "express";
import { stripe } from "src/services/stripeService.js";
import { NextApiRequest } from 'next'
const STRIPE_PRICE_ID = 'price_1PywmvHQFoXB7WmvvG31yvHQ'
const STRIPE_WEBHOOK_SECRET = 'whsec_74d2c7b9555a7a89efb1b49d18e16d812da36f5284947fb853aff3385c5c7375'

export const stripeController = {
    stripeSubscribe: async (req: Request, res: Response) => {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price: STRIPE_PRICE_ID,
                    quantity: 1
                }
            ],
            success_url: `${process.env.FRONTEND_URL}/login?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/`
        })

        return res.json({ url: session.url })
    },
    stripeCustomers: async (req: Request, res: Response) => {
        console.log(req.headers)
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: req.params.customerId,
            return_url: `${process.env.FRONTEND_URL}/`
        })
        return res.json(portalSession.url)
    },
    stripeWebhook: async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig!, STRIPE_WEBHOOK_SECRET);
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            //Event when the subscription started
            case 'checkout.session.completed':
                console.log('New Subscription started!')
                console.log(event.data)
                break;

            // Event when the payment is successfull (every subscription interval)  
            case 'invoice.paid':
                console.log('Invoice paid')
                console.log(event.data)
                break;

            // Event when the payment failed due to card problems or insufficient funds (every subscription interval)  
            case 'invoice.payment_failed':
                console.log('Invoice payment failed!')
                console.log(event.data)
                break;

            // Event when subscription is updated  
            case 'customer.subscription.updated':
                console.log('Subscription updated!')
                console.log(event.data)
                break

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.send();
    }
}

