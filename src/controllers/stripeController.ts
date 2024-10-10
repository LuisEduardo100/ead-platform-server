import { Request, Response } from "express";
import { stripe } from "../services/stripeService.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";
import { STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET } from "../config/environment.js";

export const stripeController = {
    stripeSubscribe: async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?.id;

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

        await User.update({ sessionId: session.id }, { where: { id: userId } })

        return res.json({ url: session.url })
    },
    stripeCustomers: async (req: Request, res: Response) => {
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

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const subscriptionId = String(session.subscription);
                const customerId = String(session.customer);
                const user = await User.findOne({ where: { sessionId: session.id } });

                const customerEmail = String(session.customer_details?.email);
                const amountPaid = (Number(session.amount_total) / 100)
                const currency = session.currency!.toUpperCase();

                if (user) {
                    await user.update({
                        subscription: subscriptionId,
                        customerId: customerId,
                        hasFullAccess: true
                    });
                }

                console.log('Data collected: ', 
                    "customer email: ", customerEmail +
                    "amount paid: ", amountPaid + 
                    "currency: ", currency 
                );

                // sendConfirmationEmail(customerEmail, amountPaid, currency);
                
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                const subscriptionId = String(invoice.subscription);
                const user = await User.findOne({ where: { subscription: subscriptionId } });

                if (user) {
                    await user.update({ hasFullAccess: true });
                }

                console.log('Invoice paid');
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const user = await User.findOne({ where: { sessionId: invoice.id } });

                if (user) {
                    await user.update({ hasFullAccess: false });
                }

                console.log('Invoice payment failed!');
                break;
            }
        }
        res.send();
    }
}

