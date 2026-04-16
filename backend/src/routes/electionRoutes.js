const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Middleware to verify token (simplified version)
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all elections
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, 
                   COUNT(DISTINCT c.id) as total_candidates
            FROM elections e
            LEFT JOIN candidates c ON e.id = c.election_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `);
        res.json({ elections: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single election with positions and candidates
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get election
        const electionResult = await pool.query('SELECT * FROM elections WHERE id = $1', [id]);
        if (electionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Election not found' });
        }
        
        // Get positions with candidates
        const positionsResult = await pool.query(`
            SELECT p.*, 
                   COALESCE(json_agg(json_build_object(
                       'id', c.id,
                       'full_name', c.full_name,
                       'party', c.party,
                       'manifesto', c.manifesto
                   )) FILTER (WHERE c.id IS NOT NULL), '[]') as candidates
            FROM positions p
            LEFT JOIN candidates c ON c.position_id = p.id AND c.election_id = $1
            WHERE p.election_id = $1
            GROUP BY p.id
            ORDER BY p.priority
        `, [id]);
        
        res.json({
            election: electionResult.rows[0],
            positions: positionsResult.rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cast vote
router.post('/:id/vote', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { candidate_id, position_id } = req.body;
        const voter_id = req.userId;
        
        // Check if already voted for this position
        const existing = await pool.query(
            'SELECT id FROM votes WHERE election_id = $1 AND voter_id = $2 AND position_id = $3',
            [id, voter_id, position_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Already voted for this position' });
        }
        
        // Cast vote
        await pool.query(
            `INSERT INTO votes (election_id, voter_id, candidate_id, position_id)
             VALUES ($1, $2, $3, $4)`,
            [id, voter_id, candidate_id, position_id]
        );
        
        res.json({ success: true, message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get results
router.get('/:id/results', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT 
                p.title as position,
                c.full_name as candidate_name,
                c.party,
                COUNT(v.id) as vote_count,
                ROUND(COUNT(v.id)::numeric / NULLIF(SUM(COUNT(v.id)) OVER (PARTITION BY p.id), 0) * 100, 2) as percentage
            FROM positions p
            LEFT JOIN candidates c ON c.position_id = p.id AND c.election_id = $1
            LEFT JOIN votes v ON v.candidate_id = c.id
            WHERE p.election_id = $1
            GROUP BY p.id, p.title, c.id, c.full_name, c.party
            ORDER BY p.priority, vote_count DESC
        `, [id]);
        
        res.json({ results: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
// Cast vote - REPLACE this entire section
router.post('/:id/vote', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { candidate_id, position_id } = req.body;
        const voter_id = req.userId;
        
        console.log('Casting vote:', { election_id: id, voter_id, candidate_id, position_id });
        
        // Check if already voted for this position
        const existing = await pool.query(
            'SELECT id FROM votes WHERE election_id = $1 AND voter_id = $2 AND position_id = $3',
            [id, voter_id, position_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Already voted for this position' });
        }
        
        // Cast vote
        await pool.query(
            `INSERT INTO votes (election_id, voter_id, candidate_id, position_id)
             VALUES ($1, $2, $3, $4)`,
            [id, voter_id, candidate_id, position_id]
        );
        
        console.log('Vote cast successfully');
        res.json({ success: true, message: 'Vote cast successfully' });
    } catch (error) {
        console.error('Error casting vote:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get results - REPLACE this entire section
router.get('/:id/results', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Fetching results for election:', id);
        
        // First, check if there are any votes
        const voteCheck = await pool.query('SELECT COUNT(*) FROM votes WHERE election_id = $1', [id]);
        console.log('Total votes in database:', voteCheck.rows[0].count);
        
        // Get results with proper vote counting
        const result = await pool.query(`
            SELECT 
                p.title as position,
                c.id as candidate_id,
                c.full_name as candidate_name,
                c.party,
                COUNT(v.id) as vote_count
            FROM positions p
            CROSS JOIN candidates c
            LEFT JOIN votes v ON v.candidate_id = c.id AND v.position_id = p.id
            WHERE p.election_id = $1 AND c.election_id = $1 AND c.position_id = p.id
            GROUP BY p.id, p.title, c.id, c.full_name, c.party
            ORDER BY p.priority, vote_count DESC
        `, [id]);
        
        // Calculate percentages
        const positionTotals = {};
        result.rows.forEach(row => {
            if (!positionTotals[row.position]) {
                positionTotals[row.position] = 0;
            }
            positionTotals[row.position] += parseInt(row.vote_count);
        });
        
        const resultsWithPercentage = result.rows.map(row => ({
            ...row,
            total_votes: positionTotals[row.position],
            percentage: positionTotals[row.position] > 0 
                ? ((row.vote_count / positionTotals[row.position]) * 100).toFixed(2)
                : 0
        }));
        
        console.log('Results:', resultsWithPercentage);
        res.json({ results: resultsWithPercentage });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: error.message });
    }
});