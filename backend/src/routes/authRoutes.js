const { sendOTPEmail } = require('../utils/emailService');

// In register route, after creating user:
await sendOTPEmail(email, otp, full_name);

// In login route:
await sendOTPEmail(email, otp, voter.full_name);