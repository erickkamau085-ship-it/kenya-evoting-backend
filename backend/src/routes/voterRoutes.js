const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Temporary OTP storage
const otpStore = new Map();

// REGISTER VOTER - Step 1
router.post('/register-voter', async (req, res) => {
    try {
        const { full_name, email, phone, national_id, voter_card_number, county, constituency, ward, password } = req.body;
        
        // Check if voter already exists
        const existing = await pool.query(
            'SELECT id FROM voters WHERE email = $1 OR voter_card_number = $2 OR national_id = $3',
            [email, voter_card_number, national_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Voter already registered with this email, ID, or Voter Card' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Insert voter
        const result = await pool.query(
            `INSERT INTO voters (full_name, email, phone, national_id, voter_card_number, county, constituency, ward, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [full_name, email, phone, national_id, voter_card_number, county, constituency, ward, password_hash]
        );
        
        const voterId = result.rows[0].id;
        const otp = generateOTP();
        otpStore.set(voterId.toString(), { code: otp, expires: Date.now() + 300000 });
        
        console.log(`📧 OTP for ${email}: ${otp}`);
        
        res.status(201).json({ success: true, message: 'Registration successful', voterId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// VERIFY OTP - Step 2
router.post('/verify-voter-otp', async (req, res) => {
    try {
        const { voterId, otpCode } = req.body;
        const stored = otpStore.get(voterId.toString());
        
        if (!stored || stored.code !== otpCode || stored.expires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        
        await pool.query('UPDATE voters SET is_verified = TRUE WHERE id = $1', [voterId]);
        otpStore.delete(voterId.toString());
        
        res.json({ success: true, message: 'Account verified' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// LOGIN with Voter Card Number
router.post('/login-voter', async (req, res) => {
    try {
        const { voter_card_number, password } = req.body;
        
        const result = await pool.query(
            'SELECT * FROM voters WHERE voter_card_number = $1',
            [voter_card_number]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid Voter Card Number' });
        }
        
        const voter = result.rows[0];
        const isValid = await bcrypt.compare(password, voter.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        if (!voter.is_verified) {
            return res.status(401).json({ error: 'Account not verified' });
        }
        
        const token = jwt.sign(
            { voterId: voter.id, role: 'voter' },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            voter: {
                id: voter.id,
                full_name: voter.full_name,
                voter_card_number: voter.voter_card_number,
                county: voter.county
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;