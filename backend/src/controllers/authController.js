const User = require('../models/User');
const jwt = require('jsonwebtoken');

// OTP storage
const otpStore = new Map();

// REGISTER - Step 1
const register = async (req, res) => {
    try {
        const { voter_id, national_id, full_name, email, phone, date_of_birth, password } = req.body;
        
        console.log('📝 Registration attempt for:', email);
        
        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create new user
        const user = await User.create({
            voter_id, national_id, full_name, email, phone, date_of_birth, password
        });
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 300000; // 5 minutes
        
        // Store OTP
        otpStore.set(user.id.toString(), { code: otp, expires: expiresAt });
        
        console.log(`📧 OTP for ${email}: ${otp}`);
        console.log(`⏰ OTP expires in 5 minutes`);
        
        res.status(201).json({
            success: true,
            message: 'Registration successful! Check backend terminal for OTP.',
            userId: user.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
};

// VERIFY OTP - Step 2
const verifyOTP = async (req, res) => {
    try {
        let { userId, otpCode } = req.body;
        
        // Clean the inputs
        userId = String(userId).trim();
        otpCode = String(otpCode).trim();
        
        console.log('🔍 Verifying OTP for user:', userId);
        console.log('📝 Entered code:', otpCode);
        
        const stored = otpStore.get(userId);
        
        if (!stored) {
            console.log('❌ No OTP found for user:', userId);
            return res.status(400).json({ error: 'No OTP found. Please register again.' });
        }
        
        console.log('💾 Stored code:', stored.code);
        
        // Compare as strings
        if (String(stored.code).trim() !== otpCode) {
            console.log('❌ Code mismatch');
            return res.status(400).json({ error: 'Invalid OTP code' });
        }
        
        if (stored.expires < Date.now()) {
            console.log('❌ OTP expired');
            otpStore.delete(userId);
            return res.status(400).json({ error: 'OTP has expired. Please register again.' });
        }
        
        // Clear OTP
        otpStore.delete(userId);
        
        // Verify user in database
        const user = await User.verifyUser(userId);
        
        console.log('✅ OTP verified successfully for user:', userId);
        
        res.json({
            success: true,
            message: 'Account verified successfully! You can now login.'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Verification failed: ' + error.message });
    }
};

// LOGIN - Step 1
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt for:', email);
        
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isValid = await User.comparePassword(password, user.password_hash);
        if (!isValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        if (!user.is_verified) {
            console.log('❌ User not verified:', email);
            return res.status(401).json({ error: 'Please verify your email first' });
        }
        
        // Generate OTP for 2FA
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 300000;
        
        otpStore.set(user.id.toString(), { code: otp, expires: expiresAt });
        
        console.log(`🔐 2FA OTP for ${email}: ${otp}`);
        console.log(`⏰ OTP expires in 5 minutes`);
        
        res.json({
            success: true,
            message: 'OTP sent to your email. Check console for code.',
            userId: user.id,
            requires2FA: true
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed: ' + error.message });
    }
};

// VERIFY 2FA - Step 2
const verify2FA = async (req, res) => {
    try {
        let { userId, otpCode } = req.body;
        
        // Clean the inputs
        userId = String(userId).trim();
        otpCode = String(otpCode).trim();
        
        console.log('🔍 Verifying 2FA for user:', userId);
        console.log('📝 Entered code:', otpCode);
        
        const stored = otpStore.get(userId);
        
        if (!stored) {
            console.log('❌ No 2FA OTP found for user:', userId);
            return res.status(400).json({ error: 'No OTP found. Please login again.' });
        }
        
        console.log('💾 Stored code:', stored.code);
        
        // Compare as strings
        if (String(stored.code).trim() !== otpCode) {
            console.log('❌ Code mismatch');
            return res.status(400).json({ error: 'Invalid OTP code' });
        }
        
        if (stored.expires < Date.now()) {
            console.log('❌ OTP expired');
            otpStore.delete(userId);
            return res.status(400).json({ error: 'OTP has expired. Please login again.' });
        }
        
        // Clear OTP
        otpStore.delete(userId);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId, role: 'voter' },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );
        
        const user = await User.findById(userId);
        
        console.log('✅ 2FA verified successfully for user:', userId);
        
        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Verification failed: ' + error.message });
    }
};

module.exports = { register, verifyOTP, login, verify2FA };