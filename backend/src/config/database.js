const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'evoting_db',
    user: 'postgres',
    password: 'admin123',
});

pool.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to database!');
    }
});

module.exports = pool;