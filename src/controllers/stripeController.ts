import { Request, Response } from "express";
import { stripe } from "../services/stripeService.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";
import { STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET } from "../config/environment.js";
import { sendEmail } from "../middlewares/mailtrap.js";
import Stripe from "stripe";

export const stripeController = {
    stripeSubscribe: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const user = await User.findByPk(userId);

            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{
                    price: STRIPE_PRICE_ID,
                    quantity: 1
                }],
                customer_email: user?.email,
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
                metadata: { userId: userId.toString() }
            });

            await user!.update({ sessionId: session.id });
            return res.json({ url: session.url });

        } catch (error) {
            console.error('Subscription error:', error);
            return res.status(500).json({ error: 'Erro ao processar assinatura' });
        }
    },
    handleCancellation: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.id;
            const user = await User.findByPk(userId);

            if (!user?.subscriptionId) {
                return res.status(400).json({ error: 'Nenhuma assinatura ativa' });
            }

            const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
            const startDate = new Date(subscription.current_period_start * 1000);
            const daysSinceSignup = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceSignup > 7) {
                await user.update({ hasFullAccess: false });
                await sendEmail({
                    to: user.email,
                    subject: 'Cancelamento de Assinatura',
                    html: `<p>Seu acesso premium foi revogado, mas o reembolso não é mais possível.</p>`
                });
                return res.json({ message: 'Acesso revogado sem reembolso' });
            }

            // Processar reembolso dentro do período de 7 dias
            await stripe.refunds.create({
                charge: subscription.latest_invoice as string,
            });

            await user.update({ hasFullAccess: false, subscriptionId: null });

            await sendEmail({
                to: user.email,
                subject: 'Reembolso Efetuado',
                html: `<p>Seu reembolso foi processado e o acesso premium revogado.</p>`
            });

            res.json({ success: true });

        } catch (error) {
            console.error('Cancellation error:', error);
            res.status(500).json({ error: 'Erro ao processar cancelamento' });
        }
    },
    stripeCustomers: async (req: Request, res: Response) => {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ error: "customerId é obrigatório" }); // 👈 Use 400 para bad request
        }

        try {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${process.env.FRONTEND_URL}/profile`
            });

            res.json({ url: portalSession.url });
        } catch (error) {
            console.error('Erro no Stripe:', error); // Log detalhado
            res.status(500).json({
                error: 'Erro ao gerar link do portal',
                details: error instanceof Error ? error.message : 'Erro desconhecido' // 👈 Mensagem específica
            });
        }
    },
    stripeWebhook: async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature']!;
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object

                    let subscriptionRenewalDate: Date;
                    if (typeof session.subscription !== 'string' && session.subscription?.current_period_end) {
                        subscriptionRenewalDate = new Date(session.subscription.current_period_end * 1000);
                    } else {
                        const subscriptionData = await stripe.subscriptions.retrieve(String(session.subscription));
                        subscriptionRenewalDate = new Date(subscriptionData.current_period_end * 1000);
                    }

                    const user = await User.findOne({
                        where: {
                            id: session.metadata?.userId || undefined
                        }
                    });

                    if (user) {
                        await user.update({
                            stripeCustomerId: String(session.customer),
                            subscriptionId: String(session.subscription),
                            subscriptionStatus: 'active',
                            subscriptionStartDate: new Date(),
                            subscriptionRenewalDate: subscriptionRenewalDate,
                            sessionId: session.id,
                            latestInvoiceId: String(session.invoice),
                            paymentMethod: session.payment_method_types[0],
                            hasFullAccess: true,
                        });
                    }

                    // seja bem-vindo email
                    await sendEmail({
                        to: String(session.customer_details?.email),
                        subject: 'Seja bem-vindo! 🎉',
                        html: `<!DOCTYPE html>
                            <html lang="pt-BR">
                            <head>
                            <meta charset="UTF-8">
                            <title>Pagamento Confirmado 🎉</title>
                            <style>
                                body {
                                font-family: Arial, sans-serif;
                                background: #f6f9fc;
                                margin: 0;
                                padding: 0;
                                text-align: center;
                                color: #333;
                                }
                                .container {
                                max-width: 600px;
                                margin: 30px auto;
                                background: #fff;
                                border: 1px solid #e0e0e0;
                                border-radius: 8px;
                                padding: 30px;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                                }
                                h1 {
                                color: #2c3e50;
                                margin-bottom: 20px;
                                }
                                p {
                                line-height: 1.6;
                                margin: 15px 0;
                                }
                                a {
                                link-style: none;
                                color: white;
                                }
                                .button {
                                display: inline-block;
                                margin-top: 20px;
                                padding: 10px 20px;
                                background: #27ae60;
                                color: #fff;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                                }
                                .footer {
                                font-size: 0.8rem;
                                color: #999;
                                margin-top: 30px;
                                }
                            </style>
                            </head>
                            <body>
                            <div class="container">
                                <h1>🎉 Pagamento Confirmado! 🎉</h1>
                                <p>Prezado(a) responsável,</p>
                                <p>
                                É com grande alegria que confirmamos a ativação do <strong>Curso Nota Dez</strong>. Este curso foi cuidadosamente elaborado para oferecer suporte educacional de qualidade, com aulas interativas e conteúdos dinâmicos, garantindo uma aprendizagem enriquecedora e segura para o seu filho.
                                </p>
                                <p>
                                Nossa equipe está comprometida em proporcionar um ambiente estimulante e acolhedor, onde cada aluno poderá desenvolver seu potencial acadêmico e superar desafios com confiança. 📚👩‍🏫
                                </p>
                                <p>
                                Caso tenha alguma dúvida ou necessite de suporte, não hesite em entrar em contato conosco. Estamos sempre à disposição para ajudá-lo(a). 😊
                                </p>
                                <p>
                                Muito obrigado por confiar em nosso trabalho e investir no futuro do seu filho.
                                </p>
                                <p>
                                Atenciosamente,<br>
                                <strong>Equipe Reforço Nota Dez</strong><br>
                                <strong>(+55) 85 9412-3487</strong><br>
                                <a href="mailto:somosnotadez@gmail.com" style="color: #0070f3; text-decoration: none">
                                somosnotadez@gmail.com 
                                </a>
                                </p>
                                <a href="https://www.vocenotadez.com/login" class="button">Acessar Plataforma</a>
                                <div class="footer">
                                &copy; 2025 Reforço Nota Dez. Todos os direitos reservados.
                                </div>
                            </div>
                            </body>
                        </html>`
                    });
                    break;
                }

                case 'invoice.paid':
                    await handleInvoicePaid(event);
                    break;

                case 'invoice.payment_failed':
                    await handlePaymentFailed(event);
                    break;

                case 'charge.refunded': {
                    const charge = event.data.object;
                    // Adicione esta verificação para evitar conflitos
                    if (charge.refunded) {
                        await handleRefund(event);
                    }
                    break;
                }

                case 'customer.subscription.updated': {
                    const subscription = event.data.object as Stripe.Subscription;
                    await handleSubscriptionUpdate(subscription);
                    break;
                }
            }

            res.send();
        } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    verifyStripe: async (req: Request, res: Response) => {
        try {
            const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
                expand: ['customer', 'subscription']
            });

            if (!session.customer) throw new Error('Cliente não encontrado');

            res.json({
                success: true,
                customerId: session.customer,
                sessionDetails: {
                    amount: session.amount_total,
                    currency: session.currency,
                    expirationDate: new Date(
                        (session.subscription as Stripe.Subscription).current_period_end * 1000
                    ),
                    customerEmail: session.customer_details?.email
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Falha na verificação da sessão',
                code: 'VS001'
            });
        }
    }
};

// Helpers para organizar o webhook
async function handleInvoicePaid(event: any) {
    const invoice = event.data.object;
    const user = await User.findOne({ where: { subscriptionId: invoice.subscription } });

    if (user) {
        await user.update({ hasFullAccess: true });
    }
}

async function handlePaymentFailed(event: any) {
    const invoice = event.data.object;
    const user = await User.findOne({ where: { stripeCustomerId: invoice.customer } });

    if (user) {
        await user.update({ hasFullAccess: false });

        // customer invoice email payment failed
        await sendEmail({
            to: invoice.customer_email,
            subject: 'Pagamento Não Autorizado ❌',
            html: `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Pagamento Não Autorizado</title>
                <style>
                    /* Mesmo estilo base */
                    .badge { font-size: 3rem; color: #ffc107; margin-bottom: 20px; }
                    .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="badge">⚠️</div>
                    <h1>Opa, tivemos um problema!</h1>
                    <div class="alert-box">
                        <p>Motivo: ${invoice.last_payment_error?.message || 'Não especificado'}</p>
                    </div>
                    <p>Para manter o acesso completo ao Reforço Nota Dez, atualize os dados de pagamento:</p>
                    <a href="${process.env.FRONTEND_URL}/precos" class="button">Tente comprar novamente</a>
                    <p style="margin-top: 20px;">Qualquer dúvida, estamos disponíveis no WhatsApp: (+55) 85 9412-3487</p>
                    <div class="footer">
                        &copy; 2025 Reforço Nota Dez. Todos os direitos reservados.
                    </div>
                </div>
            </body>
            </html>`
        });
    }
}

async function handleRefund(event: any) {
    const charge = event.data.object;
    const user = await User.findOne({
        where: { stripeCustomerId: charge.customer as string }
    });

    if (user) {
        await user.update({
            hasFullAccess: false,
            subscriptionStatus: mapStripeStatus('refunded') // Novo status específico
        });

        // send email pagamento concluido
        await sendEmail({
            to: user.email,
            subject: 'Reembolso Concluído 💸',
            html: `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Reembolso Concluído</title>
        <style>
            .badge { font-size: 3rem; color: #007bff; margin-bottom: 20px; }
            .amount { font-size: 1.5rem; color: #28a745; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">✓</div>
            <h1>Reembolso Finalizado!</h1>
            <p>Valor reembolsado:</p>
            <div class="amount">
                ${(charge.amount_refunded / 100).toLocaleString('pt-BR', { style: 'currency', currency: charge.currency })}
            </div>
            <p>O valor pode levar até 5 dias úteis para aparecer em seu extrato.</p>
            <p>Agradecemos a oportunidade de contribuir com a educação do seu filho(a).</p>
            <div class="footer">
                &copy; 2025 Reforço Nota Dez. Todos os direitos reservados.
            </div>
        </div>
    </body>
    </html>`
        });
    }
}

function mapStripeStatus(stripeStatus: string): 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'inactive' {
    const statusMap = {
        'active': 'active',
        'trialing': 'trialing',
        'past_due': 'past_due',
        'canceled': 'canceled',
        'unpaid': 'unpaid',
        'incomplete': 'inactive',
        'incomplete_expired': 'inactive'
    } as const;

    return statusMap[stripeStatus as keyof typeof statusMap] || 'inactive';
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const user = await User.findOne({
        where: { stripeCustomerId: subscription.customer as string }
    });

    if (!user) return;

    // Atualiza status com base no estado da subscription
    const isCanceled = subscription.status === 'canceled' || subscription.status === 'incomplete_expired';


    await user.update({
        subscriptionStatus: mapStripeStatus(subscription.status),
        hasFullAccess: !isCanceled,
        subscriptionRenewalDate: new Date(subscription.current_period_end * 1000),
        ...(isCanceled && {
            subscriptionCanceledAt: new Date(), // 👈 Convertendo para string
            latestInvoiceId: null
        })
    });

    if (isCanceled) {
        await sendEmail({
            to: user.email,
            subject: 'Assinatura Cancelada 💔',
            html: `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Assinatura Cancelada</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background: #f7f7f7;
                        margin: 0;
                        padding: 0;
                        color: #444;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #fff;
                        border-radius: 10px;
                        box-shadow: 0 3px 15px rgba(0,0,0,0.1);
                        padding: 40px;
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #eee;
                        margin-bottom: 30px;
                    }
                    .badge {
                        background: #dc3545;
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        margin: 0 auto 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        color: white;
                    }
                    .details {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 25px 0;
                        text-align: center;
                    }
                    .cta {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        text-align: left;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 0.9em;
                        color: #777;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #27ae60;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="badge">✖</div>
                        <h1 style="color: #2c3e50; margin: 0">Assinatura Cancelada</h1>
                    </div>
        
                    <div class="details">
                        <p style="margin: 0">Prezado responsável,</p>
                        <p style="margin: 10px 0 0">
                            Recebemos o cancelamento da assinatura do <strong>Reforço Nota Dez</strong>.
                        </p>
                    </div>
        
                    <div class="cta">
                        <h3 style="margin: 0 0 10px 0; color: #856404;">Sua jornada não precisa acabar aqui!</h3>
                        <p style="margin: 0">Sabemos que imprevistos acontecem, mas a educação do seu filho(a) é prioridade. Por isso, temos uma oferta especial para você:</p>
                    </div>
        
                    <div style="text-align: center; line-height: 1.6">
                        <a href="${process.env.FRONTEND_URL}" class="button">Voltar para o site</a>
                        <p style="margin-top: 20px;">Não deixe de manter contato conosco: </p>
                        <p style="margin: 10px 0">
                            <a href="mailto:somosnotadez@gmail.com" style="color: #0070f3; text-decoration: none">
                                somosnotadez@gmail.com
                            </a>
                        </p>
                    </div>
        
                    <div class="footer">
                        <p style="margin: 5px 0">Atenciosamente,</p>
                        <p style="margin: 5px 0; font-weight: bold">Equipe Reforço Nota Dez</p>
                        <p style="margin: 15px 0 0; font-size: 0.9em">
                            Este é um e-mail automático, por favor não responda diretamente a esta mensagem.
                        </p>
                    </div>
                </div>
            </body>
            </html>`
        });
    }
}