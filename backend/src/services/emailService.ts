import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Standalone Email Service for Password Reset
 * Completely isolated from existing services
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Try Gmail OAuth first (if configured)
      if (this.isGmailOAuthConfigured()) {
        this.transporter = await this.createGmailOAuthTransporter();
        console.log('✅ Email service initialized with Gmail OAuth');
        return;
      }

      // Fall back to SMTP (Gmail app password, SendGrid, etc.)
      if (this.isSMTPConfigured()) {
        this.transporter = this.createSMTPTransporter();
        console.log('✅ Email service initialized with SMTP');
        return;
      }

      // Development mode - use Ethereal for testing
      if (process.env['NODE_ENV'] === 'development') {
        this.transporter = await this.createEtherealTransporter();
        console.log('✅ Email service initialized with Ethereal (development)');
        return;
      }

      console.warn('⚠️  Email service not configured - emails will not be sent');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  private isGmailOAuthConfigured(): boolean {
    return !!(
      process.env['GMAIL_CLIENT_ID'] &&
      process.env['GMAIL_CLIENT_SECRET'] &&
      process.env['GMAIL_REFRESH_TOKEN'] &&
      process.env['GMAIL_USER_EMAIL']
    );
  }

  private isSMTPConfigured(): boolean {
    return !!(
      process.env['SMTP_HOST'] &&
      process.env['SMTP_PORT'] &&
      process.env['SMTP_USER'] &&
      process.env['SMTP_PASS']
    );
  }

  private async createGmailOAuthTransporter(): Promise<nodemailer.Transporter> {
    const oauth2Client = new google.auth.OAuth2(
      process.env['GMAIL_CLIENT_ID'],
      process.env['GMAIL_CLIENT_SECRET'],
      'https://developers.google.com/oauthplayground'
    );

    const refreshToken = process.env['GMAIL_REFRESH_TOKEN'];
    if (!refreshToken) {
      throw new Error('Gmail refresh token not configured');
    }

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env['GMAIL_USER_EMAIL'],
        clientId: process.env['GMAIL_CLIENT_ID'],
        clientSecret: process.env['GMAIL_CLIENT_SECRET'],
        refreshToken: process.env['GMAIL_REFRESH_TOKEN'],
        accessToken: accessToken.token || '',
      },
    });
  }

  private createSMTPTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: process.env['SMTP_SECURE'] === 'true',
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });
  }

  private async createEtherealTransporter(): Promise<nodemailer.Transporter> {
    const account = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email service not initialized');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env['EMAIL_FROM'] || process.env['SMTP_USER'] || 'noreply@restaurantrecipefinder.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log('✅ Email sent successfully:', info.messageId);
      
      // In development with Ethereal, log preview URL
      if (process.env['NODE_ENV'] === 'development' && nodemailer.getTestMessageUrl(info)) {
        console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Source+Serif+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet">
        <style>
          /* Flambé Brand Variables */
          :root {
            --flambé-cream: #F7F5F3;
            --flambé-stone: #E8E4E0;
            --flambé-sage: #A8B5A0;
            --flambé-charcoal: #2C2C2C;
            --flambé-ash: #6B6B6B;
            --flambé-ember: #D4A574;
            --flambé-smoke: #9B9B9B;
            --flambé-forest: #4A5D3A;
            --flambé-rust: #A67C52;
            --flambé-fog: #F0EFED;
          }
          
          body { 
            font-family: 'Source Serif Pro', serif; 
            line-height: 1.6; 
            color: #2C2C2C; 
            background-color: #F7F5F3;
            margin: 0;
            padding: 0;
            letter-spacing: 0.01em;
          }
          
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #F7F5F3;
          }
          
          .header { 
            text-align: center; 
            padding: 40px 0 30px; 
            border-bottom: 1px solid #E8E4E0;
          }
          
          .logo {
            font-family: 'Crimson Text', serif;
            font-size: 2.2rem;
            font-weight: 400;
            color: #2C2C2C;
            margin: 0;
            letter-spacing: 0.02em;
          }
          
          .flame-emoji {
            font-size: 2.5rem;
            vertical-align: middle;
            margin-right: 8px;
          }
          
          .content { 
            padding: 40px 0; 
            background-color: #F7F5F3;
          }
          
          .content h2 {
            font-family: 'Crimson Text', serif;
            font-size: 1.8rem;
            font-weight: 600;
            color: #2C2C2C;
            margin-bottom: 20px;
            letter-spacing: 0.01em;
          }
          
          .content p {
            font-family: 'Source Serif Pro', serif;
            font-weight: 300;
            color: #6B6B6B;
            margin-bottom: 20px;
            letter-spacing: 0.005em;
          }
          
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: #2C2C2C; 
            color: #F7F5F3; 
            text-decoration: none; 
            border-radius: 2px; 
            font-family: 'Source Serif Pro', serif;
            font-weight: 400;
            letter-spacing: 0.01em;
            transition: all 0.2s ease;
            border: 1px solid #2C2C2C;
          }
          
          .button:hover {
            background-color: #4A5D3A;
            border-color: #4A5D3A;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(44, 44, 44, 0.15);
          }
          
          .button-container {
            text-align: center; 
            margin: 40px 0;
          }
          
          .url-container {
            background: #F0EFED; 
            padding: 20px; 
            border-radius: 2px; 
            word-break: break-all;
            border: 1px solid #E8E4E0;
            margin: 20px 0;
          }
          
          .url-container p {
            margin: 0;
            font-family: 'Source Serif Pro', serif;
            font-weight: 300;
            color: #6B6B6B;
            font-size: 0.9rem;
          }
          
          .warning { 
            background: #F0EFED; 
            padding: 24px; 
            border-radius: 2px; 
            margin: 30px 0; 
            border-left: 4px solid #A8B5A0;
          }
          
          .warning strong {
            color: #2C2C2C;
            font-family: 'Source Serif Pro', serif;
            font-weight: 400;
          }
          
          .warning ul {
            margin: 12px 0 0 0;
            padding-left: 20px;
          }
          
          .warning li {
            font-family: 'Source Serif Pro', serif;
            font-weight: 300;
            color: #6B6B6B;
            margin-bottom: 8px;
            letter-spacing: 0.005em;
          }
          
          .footer { 
            text-align: center; 
            padding: 30px 0 20px; 
            border-top: 1px solid #E8E4E0; 
            color: #9B9B9B; 
            font-size: 0.9rem;
          }
          
          .footer p {
            font-family: 'Source Serif Pro', serif;
            font-weight: 300;
            letter-spacing: 0.005em;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">
              <span class="flame-emoji">🔥</span>Restaurant Recipe Finder
            </h1>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="url-container">
              <p>${resetUrl}</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This link will expire in 1 hour for your security</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from Restaurant Recipe Finder</p>
            <p>If you have any questions, contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Reset Your Password - Restaurant Recipe Finder
      
      You requested to reset your password. Visit this link to set a new password:
      ${resetUrl}
      
      This link will expire in 1 hour for security.
      If you didn't request this, please ignore this email.
      Never share this link with anyone.
    `;

    return this.sendEmail({
      to: email,
      subject: '🔥 Reset Your Password - Restaurant Recipe Finder',
      html,
      text,
    });
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }
}

// Export singleton instance
export const emailService = new EmailService(); 