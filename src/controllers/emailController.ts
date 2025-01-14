import { Request, Response } from "express";
import { sendEmail } from "src/middlewares/mailtrap.js";


export const emailController = {
    sendEmail: async (req: Request, res: Response) => {
        const { to, subject, content } = req.body

        if (!to || !subject || !content) {
            return res.status(400).json({ error: 'Parâmetros inválidos' })
        }

        try {
            const emailContent = `
                <html>
                    <body>
                    <h1>${subject}</h1>
                    <p>${content}</p>
                    </body>
                </html>
            `

            await sendEmail({to, subject, html: emailContent})
            return res.status(200).json({message: 'Email enviado com sucesso.'})
        } catch (error) {
            return res.status(500).json({message: 'Erro ao enviar email.'})
        }
    }
}