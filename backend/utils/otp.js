const { prisma } = require('../config/database');

/**
 * Generate random OTP code
 * @param {number} length - OTP code length
 * @returns {string} OTP code
 */
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Create and save OTP
 * @param {string} userId - User ID
 * @param {string} type - OTP type (VERIFICATION, PASSWORD_RESET, CONTACT_VERIFICATION)
 * @param {string} target - Email or phone number
 * @param {number} expiryMinutes - OTP expiry in minutes
 * @returns {Promise<object>} OTP record
 */
async function createOTP(userId, type, target = null, expiryMinutes = 10) {
  // Delete any existing OTP for the same user and type
  await prisma.otp.deleteMany({
    where: {
      userId,
      type,
      target
    }
  });

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const otp = await prisma.otp.create({
    data: {
      code,
      type,
      userId,
      target,
      expiresAt
    }
  });

  return otp;
}

/**
 * Verify OTP code
 * @param {string} userId - User ID
 * @param {string} code - OTP code
 * @param {string} type - OTP type
 * @param {string} target - Email or phone number
 * @returns {Promise<boolean>} Verification result
 */
async function verifyOTP(userId, code, type, target = null) {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      type,
      target,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!otp) {
    return false;
  }

  // Delete the OTP after successful verification
  await prisma.otp.delete({
    where: { id: otp.id }
  });

  return true;
}

/**
 * Clean up expired OTPs
 */
async function cleanupExpiredOTPs() {
  await prisma.otp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}

/**
 * Send OTP via email (mock implementation)
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP
 */
async function sendOTPEmail(email, otp, purpose = 'verification') {
  // In a real implementation, you would use an email service like SendGrid, SES, etc.
  console.log(`📧 Sending OTP email to ${email}:`);
  console.log(`Code: ${otp}`);
  console.log(`Purpose: ${purpose}`);
  
  // Mock successful send
  return true;
}

/**
 * Send OTP via SMS (mock implementation)
 * @param {string} phone - Recipient phone number
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP
 */
async function sendOTPSMS(phone, otp, purpose = 'verification') {
  // In a real implementation, you would use an SMS service like Twilio, SNS, etc.
  console.log(`📱 Sending OTP SMS to ${phone}:`);
  console.log(`Code: ${otp}`);
  console.log(`Purpose: ${purpose}`);
  
  // Mock successful send
  return true;
}

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  cleanupExpiredOTPs,
  sendOTPEmail,
  sendOTPSMS,
};