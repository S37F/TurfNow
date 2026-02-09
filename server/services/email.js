import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

// Create transporter
let transporter;

// Check if email credentials are configured
const isEmailConfigured = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('📧 Email service configured');
} else {
  console.warn('⚠️  Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
  console.warn('   Emails will be logged to console instead of being sent.');
}

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} [text] - Plain text version (optional)
 */
export const sendEmail = async (to, subject, html, text = '') => {
  const mailOptions = {
    from: `"TurfNow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@turfnow.com'}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('📧 Email error:', error);
      throw error;
    }
  } else {
    // Log email to console when not configured
    console.log('\n📧 [EMAIL PREVIEW - Not sent]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Content: ${html.substring(0, 200)}...`);
    console.log('');
    return { success: true, preview: true };
  }
};

// Email templates
export const emailTemplates = {
  // Booking confirmation email
  bookingConfirmation: ({ customerName, turfName, date, time, amount, bookingId }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #666; }
        .value { font-weight: 600; color: #333; }
        .amount { font-size: 24px; color: #DC2626; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .btn { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏟️ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Your turf booking has been confirmed! Here are the details:</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Booking ID</span>
              <span class="value">#${bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Turf</span>
              <span class="value">${turfName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date</span>
              <span class="value">${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time Slot</span>
              <span class="value">${time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount Paid</span>
              <span class="value amount">₹${amount}</span>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/booking" class="btn">View My Bookings</a>
          </p>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Please arrive 10 minutes before your slot</li>
            <li>Carry a valid ID for verification</li>
            <li>Show this confirmation at the venue</li>
          </ul>
        </div>
        <div class="footer">
          <p>Thank you for choosing TurfNow!</p>
          <p>Questions? Reply to this email or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Payment success email
  paymentSuccess: ({ customerName, amount, transactionId, date }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 36px; color: #10B981; font-weight: bold; text-align: center; margin: 20px 0; }
        .info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Successful</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Your payment has been processed successfully!</p>
          
          <div class="amount">₹${amount}</div>
          
          <div class="info">
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Status:</strong> <span style="color: #10B981;">Completed</span></p>
          </div>
          
          <p>A detailed receipt has been attached to your booking confirmation.</p>
        </div>
        <div class="footer">
          <p>TurfNow - Book Instantly, Play Instantly!</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Booking cancellation email
  bookingCancellation: ({ customerName, turfName, date, time, refundAmount, refundStatus }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .btn { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div class="info">
            <p><strong>Turf:</strong> ${turfName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            ${refundAmount ? `<p><strong>Refund Amount:</strong> ₹${refundAmount}</p>` : ''}
            ${refundStatus ? `<p><strong>Refund Status:</strong> ${refundStatus}</p>` : ''}
          </div>
          
          <p>If you have any questions about your refund, please contact our support team.</p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/turf" class="btn">Book Another Turf</a>
          </p>
        </div>
        <div class="footer">
          <p>We hope to see you again soon!</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Owner registration pending
  ownerRegistrationPending: ({ fullName, businessName }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏟️ Welcome to TurfNow!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Thank you for registering <strong>${businessName}</strong> on TurfNow!</p>
          
          <div class="status">
            <p style="margin: 0; font-size: 18px;">📋 <strong>Application Status: Pending Review</strong></p>
          </div>
          
          <p>Our team will review your application and verify your business details. This usually takes 1-2 business days.</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>We'll verify your business information</li>
            <li>Once approved, you'll receive an email notification</li>
            <li>You can then start adding your turfs and accepting bookings!</li>
          </ul>
          
          <p>If you have any questions, feel free to reply to this email.</p>
        </div>
        <div class="footer">
          <p>TurfNow - Connecting Players with Turfs</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Owner approved
  ownerApproved: ({ fullName, businessName }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: #D1FAE5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .btn { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Great news! Your owner account for <strong>${businessName}</strong> has been approved!</p>
          
          <div class="status">
            <p style="margin: 0; font-size: 18px;">✅ <strong>Account Status: Approved</strong></p>
          </div>
          
          <p><strong>You can now:</strong></p>
          <ul>
            <li>Add your turfs to the platform</li>
            <li>Set pricing and availability</li>
            <li>Receive and manage bookings</li>
            <li>Track your earnings</li>
          </ul>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/owner/dashboard" class="btn">Go to Owner Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>Welcome to the TurfNow family! 🏟️</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Owner rejected
  ownerRejected: ({ fullName, reason }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason { background: #FEE2E2; border: 1px solid #EF4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Thank you for your interest in becoming a TurfNow partner. After reviewing your application, we're unable to approve it at this time.</p>
          
          <div class="reason">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          
          <p>If you believe this was a mistake or if you have additional information to share, please reply to this email and we'll be happy to reconsider.</p>
          
          <p>You're welcome to submit a new application with updated information.</p>
        </div>
        <div class="footer">
          <p>TurfNow Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Booking reminder (can be sent 1 day before)
  bookingReminder: ({ customerName, turfName, date, time, address }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder { background: #DBEAFE; border: 1px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Booking Reminder</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>This is a friendly reminder about your upcoming turf booking!</p>
          
          <div class="reminder">
            <h2 style="margin: 0 0 15px 0;">${turfName}</h2>
            <p style="font-size: 20px; margin: 10px 0;"><strong>${date}</strong></p>
            <p style="font-size: 24px; color: #2563EB; margin: 10px 0;"><strong>${time}</strong></p>
            ${address ? `<p style="color: #666;">📍 ${address}</p>` : ''}
          </div>
          
          <p><strong>Remember:</strong></p>
          <ul>
            <li>Arrive 10 minutes early</li>
            <li>Bring appropriate sports gear</li>
            <li>Stay hydrated!</li>
          </ul>
        </div>
        <div class="footer">
          <p>Have a great game! 🏆</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export default { sendEmail, emailTemplates };
