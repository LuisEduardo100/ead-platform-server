import nodemailer from 'nodemailer'

export async function sendConfirmationEmail(email: string, amount: number, currency: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'luiseduardopro2@gmail.com',
            pass: '@AlfredinA1945',
        },
    });

    const mailOptions = {
        from: 'luiseduardopro2@gmail.com',
        to: email,
        subject: 'Confirmação da compra ✔ - Upgrade para Premium',
        text: `Obrigado por sua compra! Você agora é um usuário Premium. 
        Detalhes da compra: 
        - Valor pago: ${amount} ${currency}
        - Data: ${new Date().toLocaleDateString()}
        Aproveite o acesso Premium!`,
        html: `<p>Obrigado por sua compra! Você agora é um usuário <strong>Premium</strong>.</p>
        <p><strong>Detalhes da compra:</strong></p>
        <ul>
          <li>Valor pago: ${amount} ${currency}</li>
          <li>Data: ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>Aproveite o acesso Premium!</p>`
    };

    const info = transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    console.log("Email enviado: ", info)
}
