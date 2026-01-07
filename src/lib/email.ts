import sgMail from '@sendgrid/mail';

// SendGrid initialisieren
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sendet eine E-Mail über SendGrid
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.warn('SendGrid nicht konfiguriert. E-Mail wird nicht gesendet.');
    return false;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    console.log(`E-Mail gesendet an: ${options.to}`);
    return true;
  } catch (error) {
    console.error('E-Mail-Versand fehlgeschlagen:', error);
    return false;
  }
};

/**
 * Sendet eine Vertrags-Erinnerung
 */
export const sendContractReminder = async (
  email: string,
  contractTitle: string,
  contractNumber: string,
  daysUntilDeadline: number,
  deadlineType: 'termination' | 'expiry'
): Promise<boolean> => {
  const deadlineText =
    deadlineType === 'termination' ? 'Kündigungsfrist' : 'Vertragsende';

  const subject = `[Vertragscontrolling] ${deadlineText} in ${daysUntilDeadline} Tagen: ${contractTitle}`;

  const text = `
Erinnerung: ${deadlineText} naht

Vertrag: ${contractTitle}
Vertragsnummer: ${contractNumber}
${deadlineText}: In ${daysUntilDeadline} Tagen

Bitte prüfen Sie den Vertrag und ergreifen Sie ggf. erforderliche Maßnahmen.

---
Diese E-Mail wurde automatisch vom Vertragscontrolling-System gesendet.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #be004a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .info { background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .warning { color: #be004a; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Vertragscontrolling</h2>
      <p style="margin: 5px 0 0 0;">${deadlineText}-Erinnerung</p>
    </div>
    <div class="content">
      <p class="warning">⚠️ ${deadlineText} in ${daysUntilDeadline} Tagen</p>
      
      <div class="info">
        <p><strong>Vertrag:</strong> ${contractTitle}</p>
        <p><strong>Vertragsnummer:</strong> ${contractNumber}</p>
      </div>
      
      <p>Bitte prüfen Sie den Vertrag und ergreifen Sie ggf. erforderliche Maßnahmen.</p>
      
      <div class="footer">
        <p>Diese E-Mail wurde automatisch vom Vertragscontrolling-System gesendet.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

