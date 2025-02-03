// src/services/recaptchaService.ts
import axios from 'axios';

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY!;

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: SECRET_KEY,
        response: token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Debug: exibe a resposta completa da API
    console.log('Resposta do reCAPTCHA:', response.data);

    // Verifica se a verificação foi bem-sucedida E se o score é aceitável
    return response.data.success && response.data.score >= 0.5;
    
  } catch (error) {
    console.error('Erro na verificação do reCAPTCHA:', error);
    // Se quiser logar mais detalhes do erro:
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return false;
  }
};