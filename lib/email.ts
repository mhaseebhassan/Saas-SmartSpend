import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendBudgetAlertOptions {
  to: string;
  categoryName: string;
  percentUsed: number;
  amountSpent: number;
  budgetLimit: number;
  currency?: string;
}

export async function sendBudgetAlert({
  to,
  categoryName,
  percentUsed,
  amountSpent,
  budgetLimit,
  currency = "$",
}: SendBudgetAlertOptions) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not defined. Skipping budget alert email send.");
    return { success: false, error: "RESEND_API_KEY is missing" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SmartSpend Budget Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
        
        <!-- Header with SmartSpend Branding -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">SmartSpend</h1>
          <p style="margin: 4px 0 0 0; font-size: 16px; color: #e0e7ff; font-weight: 500;">Intelligent Budget Alerts</p>
        </div>
        
        <!-- Content Section -->
        <div style="padding: 40px 32px; color: #1f2937;">
          <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700; color: #111827;">Budget Alert: Limit Approaching</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            You are receiving this alert because your monthly spending in the <strong style="color: #111827;">${categoryName}</strong> category has reached or exceeded <strong style="color: #ef4444;">${percentUsed.toFixed(1)}%</strong> of your limit.
          </p>
          
          <!-- Statistics Card -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Category</td>
                <td style="padding: 12px 0; text-align: right; font-size: 15px; color: #111827; font-weight: 700;">${categoryName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Spent So Far</td>
                <td style="padding: 12px 0; text-align: right; font-size: 15px; color: #ef4444; font-weight: 700;">${currency}${amountSpent.toFixed(2)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Monthly Limit</td>
                <td style="padding: 12px 0; text-align: right; font-size: 15px; color: #111827; font-weight: 700;">${currency}${budgetLimit.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Usage Percentage</td>
                <td style="padding: 12px 0; text-align: right; font-size: 15px; color: #ef4444; font-weight: 700;">${percentUsed.toFixed(1)}%</td>
              </tr>
            </table>
          </div>
          
          <!-- Progress Bar Visual Representation -->
          <div style="width: 100%; background-color: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 32px;">
            <div style="width: ${Math.min(percentUsed, 100)}%; background-color: #ef4444; height: 100%; border-radius: 6px;"></div>
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
              Manage Your Budgets
            </a>
          </div>
          
          <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 40px; margin-bottom: 0;">
            Need to adjust your alert thresholds? Go to Preferences in your dashboard.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0;">&copy; 2026 SmartSpend Inc. All rights reserved.</p>
          <p style="margin: 0;">You are receiving this automated alert because you subscribed to budget notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "SmartSpend Alerts <onboarding@resend.dev>",
      to: [to],
      subject: `[ALERT] Budget usage exceeded for ${categoryName}`,
      html: html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return { success: false, error };
  }
}
