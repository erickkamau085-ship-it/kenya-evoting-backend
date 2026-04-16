const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { voter_id, national_id, full_name, email, phone, date_of_birth, password } = userData;
        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (voter_id, national_id, full_name, email, phone, date_of_birth, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, full_name, email`,
            [voter_id, national_id, full_name, email, phone, date_of_birth, password_hash]
        );
        
        return result.rows[0];
    }
    
    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
    
    static async findById(id) {
        const result = await pool.query('SELECT id, full_name, email, role, has_voted FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
    
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
    
    static async verifyUser(userId) {
        const result = await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *', [userId]);
        return result.rows[0];
    }
}

module.exports = User;