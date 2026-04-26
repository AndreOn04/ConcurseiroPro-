import { Resend } from "resend";

export async function enviarCodigoVerificacao(email: string, codigo: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ConcurseiroPro <onboarding@resend.dev>",
    to: email,
    subject: "Seu código de verificação - ConcurseiroPro",
    html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f172a; color: #fff; border-radius: 16px;">
                <h1 style="color: #818cf8; font-size: 24px; margin-bottom: 8px;">ConcurseiroPro</h1>
                <p style="color: #94a3b8; margin-bottom: 32px;">Sua plataforma gratuita de estudos para concursos</p>
                
                <h2 style="font-size: 18px; margin-bottom: 8px;">Confirme seu e-mail</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Use o código abaixo para verificar sua conta:</p>
                
                <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #818cf8;">
                    ${codigo}
                </span>
                </div>
                
                <p style="color: #94a3b8; font-size: 14px;">Este código expira em <strong style="color: #fff;">10 minutos</strong>.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 24px;">Se você não criou uma conta no ConcurseiroPro, ignore este e-mail.</p>
            </div>
        `,
  });
}
