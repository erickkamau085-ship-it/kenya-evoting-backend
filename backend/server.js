const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage (for testing)
const users = [];
const otpStore = new Map();

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ========== ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'IEBC Kenya E-Voting Backend Running', timestamp: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, email, phone, national_id, voter_card_number, county, password } = req.body;
        
        console.log('📝 Registration request:', { full_name, email, voter_card_number });
        
        // Check if user exists
        const existingUser = users.find(u => u.email === email || u.voter_card_number === voter_card_number);
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        }
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            full_name,
            email,
            phone,
            national_id,
            voter_card_number,
            county,
            password, // In production, hash this!
            is_verified: false,
            has_voted: false,
            created_at: new Date().toISOString()
        };
        
        users.push(newUser);
        
        // Generate OTP
        const otp = generateOTP();
        otpStore.set(newUser.id.toString(), { code: otp, expires: Date.now() + 300000 });
        
        console.log(`📧 OTP for ${email}: ${otp}`);
        
        res.status(201).json({
            success: true,
            message: 'Registration successful. Check console for OTP.',
            userId: newUser.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        
        const stored = otpStore.get(userId.toString());
        
        if (!stored || stored.code !== otpCode || stored.expires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        
        // Update user as verified
        const user = users.find(u => u.id === parseInt(userId));
        if (user) {
            user.is_verified = true;
        }
        
        otpStore.delete(userId.toString());
        
        res.json({ success: true, message: 'Account verified successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { voter_card_number, password } = req.body;
        
        console.log('🔐 Login attempt:', voter_card_number);
        
        const user = users.find(u => u.voter_card_number === voter_card_number);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid Voter Card Number' });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        if (!user.is_verified) {
            return res.status(401).json({ error: 'Account not verified' });
        }
        
        // Generate OTP for 2FA
        const otp = generateOTP();
        otpStore.set(user.id.toString(), { code: otp, expires: Date.now() + 300000 });
        
        console.log(`🔐 2FA OTP for ${user.email}: ${otp}`);
        
        res.json({
            success: true,
            message: 'OTP sent. Check console for code.',
            userId: user.id,
            requires2FA: true
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify 2FA
app.post('/api/auth/verify-2fa', (req, res) => {
    try {
        const { userId, otpCode } = req.body;
        
        const stored = otpStore.get(userId.toString());
        
        if (!stored || stored.code !== otpCode || stored.expires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        
        otpStore.delete(userId.toString());
        
        const user = users.find(u => u.id === parseInt(userId));
        
        // Generate simple token
        const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                voter_card_number: user.voter_card_number,
                county: user.county,
                has_voted: user.has_voted
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Get elections
app.get('/api/elections', (req, res) => {
    const elections = [
        {
            id: 1,
            title: 'Kenya General Elections 2027',
            description: 'IEBC General Elections - Vote for your leaders',
            status: 'active',
            total_candidates: 4
        }
    ];
    res.json({ elections });
});

// Get single election
app.get('/api/elections/:id', (req, res) => {
    const positions = [
        {
            id: 1,
            title: 'President of Kenya',
            description: 'Vote for the next President',
            candidates: [
                { id: 1, full_name: 'William Ruto', party: 'UDA', party_color: '#1d4ed8', manifesto: 'Bottom-up economic model' },
                { id: 2, full_name: 'Raila Odinga', party: 'Azimio', party_color: '#dc2626', manifesto: 'Economic revival' },
                { id: 3, full_name: 'Kalonzo Musyoka', party: 'Wiper', party_color: '#16a34a', manifesto: 'National unity' }
            ]
        }
    ];
    res.json({ election: { id: 1, title: 'Kenya General Elections 2027' }, positions });
});

// Cast vote
app.post('/api/elections/:id/vote', (req, res) => {
    const { candidate_id, position_id } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('Vote cast:', { candidate_id, position_id });
    res.json({ success: true, message: 'Vote cast successfully' });
});

// Get results
app.get('/api/elections/:id/results', (req, res) => {
    const results = [
        { position: 'President of Kenya', candidate_name: 'William Ruto', party: 'UDA', vote_count: 2457890, percentage: 48.5 },
        { position: 'President of Kenya', candidate_name: 'Raila Odinga', party: 'Azimio', vote_count: 2356780, percentage: 46.2 },
        { position: 'President of Kenya', candidate_name: 'Kalonzo Musyoka', party: 'Wiper', vote_count: 267890, percentage: 5.3 }
    ];
    res.json({ results });
});

// Start server
app.listen(PORT, () => {
    console.log(`🇰🇪 IEBC Kenya E-Voting Backend Running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📝 Test API: http://localhost:${PORT}/api/health`);
});

module.exports = app;