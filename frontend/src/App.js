import React, { useState, useEffect } from 'react';

// ============================================
// API BASE URL - CHANGE THIS TO YOUR RENDER URL
// ============================================
const API_URL = 'https://kenya-evoting-backend.onrender.com/api';

// ============================================
// ELECTION COUNTDOWN COMPONENT
// ============================================
const ElectionCountdown = () => {
    const electionDate = new Date('2027-08-09T00:00:00');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = electionDate - now;
            
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (86400000)) / (3600000)),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000),
                });
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={countdownStyles.container}>
            <h3 style={countdownStyles.title}>🗳️ 2027 General Elections</h3>
            <div style={countdownStyles.timer}>
                <div style={countdownStyles.timeBlock}>
                    <span style={countdownStyles.number}>{timeLeft.days}</span>
                    <span style={countdownStyles.label}>Days</span>
                </div>
                <div style={countdownStyles.timeBlock}>
                    <span style={countdownStyles.number}>{timeLeft.hours}</span>
                    <span style={countdownStyles.label}>Hours</span>
                </div>
                <div style={countdownStyles.timeBlock}>
                    <span style={countdownStyles.number}>{timeLeft.minutes}</span>
                    <span style={countdownStyles.label}>Mins</span>
                </div>
                <div style={countdownStyles.timeBlock}>
                    <span style={countdownStyles.number}>{timeLeft.seconds}</span>
                    <span style={countdownStyles.label}>Secs</span>
                </div>
            </div>
        </div>
    );
};

const countdownStyles = {
    container: {
        textAlign: 'center',
        padding: '20px',
        background: '#000000',
        borderRadius: '10px',
        margin: '20px',
        border: '1px solid #F3A900',
    },
    title: {
        color: '#F3A900',
        marginBottom: '15px',
        fontSize: '18px',
    },
    timer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
    },
    timeBlock: {
        textAlign: 'center',
        minWidth: '70px',
    },
    number: {
        display: 'block',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#BE3F34',
    },
    label: {
        fontSize: '12px',
        color: '#fff',
    },
};

// ============================================
// VOTER ANALYTICS COMPONENT
// ============================================
const VoterAnalytics = () => {
    const [stats, setStats] = useState({
        totalVoters: 0,
        totalVotes: 0,
        turnout: 0,
        votesByCounty: {},
        votesByPosition: {},
    });

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = () => {
        const allVotes = JSON.parse(localStorage.getItem('kenya_votes') || '{}');
        const totalVotes = Object.keys(allVotes).length;
        
        const countyVotes = {};
        Object.values(allVotes).forEach(vote => {
            countyVotes[vote.county] = (countyVotes[vote.county] || 0) + 1;
        });

        const positionVotes = { president: 0, governor: 0, mp: 0, womenRep: 0, senator: 0 };
        Object.values(allVotes).forEach(vote => {
            if (vote.votes.president) positionVotes.president++;
            if (vote.votes.governor) positionVotes.governor++;
            if (vote.votes.mp) positionVotes.mp++;
            if (vote.votes.womenRep) positionVotes.womenRep++;
            if (vote.votes.senator) positionVotes.senator++;
        });

        setStats({
            totalVoters: 5000000,
            totalVotes: totalVotes,
            turnout: ((totalVotes / 5000000) * 100).toFixed(2),
            votesByCounty: countyVotes,
            votesByPosition: positionVotes,
        });
    };

    return (
        <div style={analyticsStyles.container}>
            <h2 style={analyticsStyles.title}>📊 Voter Analytics Dashboard</h2>
            
            <div style={analyticsStyles.statsGrid}>
                <div style={analyticsStyles.statCard}>
                    <div style={analyticsStyles.statIcon}>👥</div>
                    <div style={analyticsStyles.statValue}>{stats.totalVoters.toLocaleString()}</div>
                    <div style={analyticsStyles.statLabel}>Registered Voters</div>
                </div>
                <div style={analyticsStyles.statCard}>
                    <div style={analyticsStyles.statIcon}>🗳️</div>
                    <div style={analyticsStyles.statValue}>{stats.totalVotes.toLocaleString()}</div>
                    <div style={analyticsStyles.statLabel}>Votes Cast</div>
                </div>
                <div style={analyticsStyles.statCard}>
                    <div style={analyticsStyles.statIcon}>📈</div>
                    <div style={analyticsStyles.statValue}>{stats.turnout}%</div>
                    <div style={analyticsStyles.statLabel}>Voter Turnout</div>
                </div>
            </div>

            <div style={analyticsStyles.chartsGrid}>
                <div style={analyticsStyles.chartCard}>
                    <h3 style={analyticsStyles.chartTitle}>Votes by County</h3>
                    <div style={analyticsStyles.countyList}>
                        {Object.entries(stats.votesByCounty).slice(0, 10).map(([county, count]) => (
                            <div key={county} style={analyticsStyles.countyRow}>
                                <span style={analyticsStyles.countyName}>{county}</span>
                                <div style={analyticsStyles.progressBar}>
                                    <div style={{ ...analyticsStyles.progressFill, width: `${(count / stats.totalVotes) * 100}%` }}></div>
                                </div>
                                <span style={analyticsStyles.countyVotes}>{count} votes</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={analyticsStyles.chartCard}>
                    <h3 style={analyticsStyles.chartTitle}>Votes by Position</h3>
                    {Object.entries(stats.votesByPosition).map(([position, count]) => {
                        const percentage = stats.totalVotes > 0 ? (count / stats.totalVotes) * 100 : 0;
                        const positionNames = {
                            president: '👑 President',
                            governor: '🏢 Governor',
                            mp: '🏛️ MP',
                            womenRep: '👩‍⚖️ Women Rep',
                            senator: '⚖️ Senator',
                        };
                        return (
                            <div key={position} style={analyticsStyles.positionRow}>
                                <span style={analyticsStyles.positionName}>{positionNames[position]}</span>
                                <div style={analyticsStyles.progressBar}>
                                    <div style={{ ...analyticsStyles.progressFill, width: `${percentage}%`, backgroundColor: '#BE3F34' }}></div>
                                </div>
                                <span style={analyticsStyles.positionVotes}>{count} votes</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={analyticsStyles.refreshNote}>
                <span>🔄 Data updates in real-time as votes are cast</span>
            </div>
        </div>
    );
};

const analyticsStyles = {
    container: {
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    title: {
        color: '#BE3F34',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '24px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: '#f8f8f8',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        border: '1px solid #e0e0e0',
    },
    statIcon: {
        fontSize: '36px',
        marginBottom: '10px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#008C51',
    },
    statLabel: {
        fontSize: '12px',
        color: '#666',
        marginTop: '5px',
    },
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
    },
    chartCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: '10px',
        padding: '15px',
        border: '1px solid #e0e0e0',
    },
    chartTitle: {
        color: '#333',
        marginBottom: '15px',
        fontSize: '16px',
        borderBottom: '2px solid #F3A900',
        paddingBottom: '8px',
    },
    countyList: {
        maxHeight: '300px',
        overflowY: 'auto',
    },
    countyRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderBottom: '1px solid #eee',
    },
    countyName: {
        width: '100px',
        fontSize: '13px',
        fontWeight: '500',
    },
    progressBar: {
        flex: 1,
        backgroundColor: '#e5e7eb',
        borderRadius: '10px',
        height: '8px',
        overflow: 'hidden',
    },
    progressFill: {
        backgroundColor: '#008C51',
        height: '100%',
        borderRadius: '10px',
        transition: 'width 0.3s ease',
    },
    countyVotes: {
        width: '70px',
        fontSize: '12px',
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#008C51',
    },
    positionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        borderBottom: '1px solid #eee',
    },
    positionName: {
        width: '130px',
        fontSize: '13px',
        fontWeight: '500',
    },
    positionVotes: {
        width: '70px',
        fontSize: '12px',
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#BE3F34',
    },
    refreshNote: {
        textAlign: 'center',
        padding: '15px',
        backgroundColor: '#e8f5e9',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#008C51',
    },
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [voterCard, setVoterCard] = useState('');
    const [password, setPassword] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [showVote, setShowVote] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState('Nairobi');
    const [votes, setVotes] = useState({
        president: null,
        governor: null,
        mp: null,
        womenRep: null,
        senator: null,
    });
    
    const [regData, setRegData] = useState({
        full_name: '',
        email: '',
        phone: '',
        national_id: '',
        voter_card_number: '',
        county: 'Nairobi',
        password: '',
        confirm_password: ''
    });

    const counties = [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Uasin Gishu', 'Kakamega', 'Machakos',
        'Kitui', 'Garissa', 'Turkana', 'Meru', 'Bungoma', 'Kilifi', 'Muranga', 'Kisii', 'Nyeri',
        'Baringo', 'Laikipia', 'Kwale', 'Tana River', 'Lamu', 'Taita Taveta', 'Samburu', 'Isiolo',
        'Marsabit', 'Wajir', 'Mandera', 'Embu', 'Tharaka Nithi', 'Nyandarua', 'Kirinyaga', 'Kericho',
        'Bomet', 'Kajiado', 'Narok', 'Trans Nzoia', 'West Pokot', 'Elgeyo Marakwet', 'Vihiga',
        'Siaya', 'Homa Bay', 'Migori', 'Busia', 'Nyamira'
    ];

    const [presidentialCandidates, setPresidentialCandidates] = useState([
        { id: 1, name: 'William Ruto', party: 'UDA', color: '#1d4ed8' },
        { id: 2, name: 'Raila Odinga', party: 'Azimio', color: '#dc2626' },
        { id: 3, name: 'Kalonzo Musyoka', party: 'Wiper', color: '#16a34a' },
        { id: 4, name: 'Musalia Mudavadi', party: 'ANC', color: '#f59e0b' },
    ]);

    const otherCandidates = [
        { name: 'Esther Passaris - ODM', position: 'mp' },
        { name: 'John Kiarie - UDA', position: 'mp' },
        { name: 'Millicent Omanga - UDA', position: 'women' },
        { name: 'Esther Passaris - ODM', position: 'women' },
        { name: 'Edwin Sifuna - ODM', position: 'senator' },
        { name: 'Bishop Margaret Wanjiru - UDA', position: 'senator' },
    ];

    useEffect(() => {
        const savedVotes = localStorage.getItem('kenya_votes');
        if (savedVotes && voterCard) {
            const votesData = JSON.parse(savedVotes);
            if (votesData[voterCard]) {
                setHasVoted(true);
            }
        }
    }, [voterCard]);

    const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

    const sendOTP = (email) => {
        const otp = generateOTP();
        setOtpCode(otp);
        alert(`📧 OTP sent to ${email}\n\nYour verification code is: ${otp}`);
        setShowOTPVerification(true);
    };

    const verifyOTP = () => {
        if (enteredOtp === otpCode) {
            setShowOTPVerification(false);
            setLoggedIn(true);
            alert('✅ Account verified successfully!');
        } else {
            alert('❌ Invalid OTP. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (voterCard && password && userEmail) {
            sendOTP(userEmail);
        } else {
            alert('Please fill in all fields');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regData.password !== regData.confirm_password) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regData)
            });
            const data = await response.json();
            if (response.ok) {
                alert('✅ Registration successful! Please login with your Voter Card Number.');
                setShowRegister(false);
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    };

    const handleRegChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    const handleSelect = (category, candidate) => {
        setVotes({ ...votes, [category]: candidate });
    };

    const handleSubmitVotes = () => {
        if (!votes.president || !votes.governor || !votes.mp || !votes.womenRep || !votes.senator) {
            alert('⚠️ Please vote for all 5 positions!');
            return;
        }

        if (localStorage.getItem(`vote_${voterCard}`)) {
            alert('❌ You have already voted! One voter, one vote.');
            return;
        }

        const voteRecord = {
            voterCard,
            timestamp: new Date().toISOString(),
            votes,
            county: selectedCounty,
        };

        const allVotes = JSON.parse(localStorage.getItem('kenya_votes') || '{}');
        allVotes[voterCard] = voteRecord;
        localStorage.setItem('kenya_votes', JSON.stringify(allVotes));
        localStorage.setItem(`vote_${voterCard}`, JSON.stringify(voteRecord));

        alert('✅ VOTES CAST SUCCESSFULLY!\n\n🇰🇪 Thank you for participating!');
        setHasVoted(true);
        setShowVote(false);
    };

    const calculateResults = () => {
        const allVotes = JSON.parse(localStorage.getItem('kenya_votes') || '{}');
        const results = { president: {}, governor: {}, mp: {}, womenRep: {}, senator: {} };

        Object.values(allVotes).forEach(vote => {
            if (vote.votes.president) results.president[vote.votes.president] = (results.president[vote.votes.president] || 0) + 1;
            if (vote.votes.governor) results.governor[vote.votes.governor] = (results.governor[vote.votes.governor] || 0) + 1;
            if (vote.votes.mp) results.mp[vote.votes.mp] = (results.mp[vote.votes.mp] || 0) + 1;
            if (vote.votes.womenRep) results.womenRep[vote.votes.womenRep] = (results.womenRep[vote.votes.womenRep] || 0) + 1;
            if (vote.votes.senator) results.senator[vote.votes.senator] = (results.senator[vote.votes.senator] || 0) + 1;
        });
        return results;
    };

    const printResults = () => {
        window.print();
    };

    const shareResults = (platform) => {
        const totalVotes = Object.keys(JSON.parse(localStorage.getItem('kenya_votes') || '{}')).length;
        const message = `🇰🇪 KENYA GENERAL ELECTIONS 2027 RESULTS\n\nTotal Votes Cast: ${totalVotes}\n\nIEBC Kenya - Your Vote, Your Future!`;
        const encodedMessage = encodeURIComponent(message);
        let url = '';
        if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=kenyaelections2027&quote=${encodedMessage}`;
        if (platform === 'whatsapp') url = `https://wa.me/?text=${encodedMessage}`;
        window.open(url, '_blank');
        setShowShareModal(false);
    };

    const addCandidate = () => {
        const name = prompt('Enter candidate name:');
        const party = prompt('Enter party name:');
        if (name && party) {
            const newCandidate = { id: Date.now(), name, party, color: '#8b5cf6' };
            setPresidentialCandidates([...presidentialCandidates, newCandidate]);
            alert(`✅ ${name} added as presidential candidate!`);
        }
    };

    const deleteCandidate = (id) => {
        if (window.confirm('Delete this candidate?')) {
            setPresidentialCandidates(presidentialCandidates.filter(c => c.id !== id));
            alert('✅ Candidate deleted!');
        }
    };

    const resetAllData = () => {
        if (window.confirm('⚠️ WARNING: This will delete ALL votes! Are you sure?')) {
            localStorage.removeItem('kenya_votes');
            alert('All election data has been reset!');
            window.location.reload();
        }
    };

    const currentResults = calculateResults();
    const totalVotes = Object.keys(JSON.parse(localStorage.getItem('kenya_votes') || '{}')).length;

    // OTP VERIFICATION PAGE
    if (showOTPVerification) {
        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.loginWrapper}>
                    <div style={styles.loginCard}>
                        <h1 style={styles.loginTitle}>KE IEBC Kenya</h1>
                        <p style={styles.loginSubtitle}>2027 General Elections - Voter Portal</p>
                        <h2 style={styles.formTitle}>Verify OTP</h2>
                        <p style={styles.formSubtitle}>Enter the 6-digit code sent to your email</p>
                        <input type="text" placeholder="Enter OTP Code" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} style={styles.loginInput} maxLength="6" />
                        <button onClick={verifyOTP} style={styles.loginButton}>Verify & Login</button>
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>
            </div>
        );
    }

    // REGISTER PAGE
    if (showRegister) {
        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.loginWrapper}>
                    <div style={styles.loginCard}>
                        <h1 style={styles.loginTitle}>KE IEBC Kenya</h1>
                        <p style={styles.loginSubtitle}>2027 General Elections - Voter Portal</p>
                        <h2 style={styles.formTitle}>Voter Registration</h2>
                        <p style={styles.formSubtitle}>Register to vote in the 2027 General Elections</p>
                        
                        <form onSubmit={handleRegister}>
                            <input type="text" name="full_name" placeholder="Full Name" value={regData.full_name} onChange={handleRegChange} style={styles.loginInput} required />
                            <input type="email" name="email" placeholder="Email Address" value={regData.email} onChange={handleRegChange} style={styles.loginInput} required />
                            <input type="tel" name="phone" placeholder="Phone Number" value={regData.phone} onChange={handleRegChange} style={styles.loginInput} required />
                            <input type="text" name="national_id" placeholder="National ID Number" value={regData.national_id} onChange={handleRegChange} style={styles.loginInput} required />
                            <input type="text" name="voter_card_number" placeholder="Voter Card Number" value={regData.voter_card_number} onChange={handleRegChange} style={styles.loginInput} required />
                            <select name="county" value={regData.county} onChange={handleRegChange} style={styles.loginInput}>
                                {counties.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type="password" name="password" placeholder="Password" value={regData.password} onChange={handleRegChange} style={styles.loginInput} required />
                            <input type="password" name="confirm_password" placeholder="Confirm Password" value={regData.confirm_password} onChange={handleRegChange} style={styles.loginInput} required />
                            <button type="submit" style={styles.loginButton}>Register to Vote</button>
                        </form>
                        
                        <p style={styles.switchText}>
                            Already have an account?{' '}
                            <button onClick={() => setShowRegister(false)} style={styles.switchButton}>Login Here</button>
                        </p>
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>
            </div>
        );
    }

    // LOGIN PAGE
    if (!loggedIn) {
        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.loginWrapper}>
                    <div style={styles.loginCard}>
                        <h1 style={styles.loginTitle}>KE IEBC Kenya</h1>
                        <p style={styles.loginSubtitle}>2027 General Elections - Voter Portal</p>
                        
                        <h2 style={styles.formTitle}>Voter Login</h2>
                        <p style={styles.formSubtitle}>Enter your IEBC Voter Card Number</p>
                        
                        <form onSubmit={handleLogin}>
                            <label style={styles.inputLabel}>Voter Card Number</label>
                            <input type="text" placeholder="e.g., IEBC2027001" value={voterCard} onChange={(e) => setVoterCard(e.target.value)} style={styles.loginInput} required />
                            
                            <label style={styles.inputLabel}>Email Address</label>
                            <input type="email" placeholder="Enter your email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} style={styles.loginInput} required />
                            
                            <label style={styles.inputLabel}>Password</label>
                            <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.loginInput} required />
                            
                            <button type="submit" style={styles.loginButton}>Login to Vote</button>
                        </form>
                        
                        <p style={styles.switchText}>
                            Don't have an account?{' '}
                            <button onClick={() => setShowRegister(true)} style={styles.switchButton}>Register Here</button>
                        </p>
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>
            </div>
        );
    }

    // ADMIN PANEL
    if (showAdmin) {
        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.navbar}>
                    <div style={styles.logo}>🇰🇪 IEBC Admin</div>
                    <div style={styles.navLinks}>
                        <button onClick={() => { setShowAdmin(false); setShowResults(false); setShowVote(false); }} style={styles.navLink}>Dashboard</button>
                        <button onClick={() => setShowAdmin(true)} style={styles.activeNavLink}>Admin</button>
                        <button onClick={() => setShowResults(true)} style={styles.navLink}>Results</button>
                        <button onClick={() => { setLoggedIn(false); setShowAdmin(false); }} style={styles.logoutBtn}>Logout</button>
                    </div>
                </div>
                <div style={styles.adminContainer}>
                    <h1 style={styles.adminTitle}>🗳️ IEBC Admin Panel</h1>
                    <div style={styles.adminGrid}>
                        <div style={styles.adminCard}>
                            <h3>👑 Add Presidential Candidate</h3>
                            <button onClick={addCandidate} style={styles.adminBtn}>+ Add New Candidate</button>
                        </div>
                        <div style={styles.adminCard}>
                            <h3>📊 Election Statistics</h3>
                            <p>Total Votes Cast: <strong>{totalVotes}</strong></p>
                            <button onClick={resetAllData} style={styles.dangerBtn}>Reset All Data</button>
                        </div>
                    </div>
                    <div style={styles.candidatesList}>
                        <h3>Current Presidential Candidates</h3>
                        {presidentialCandidates.map(c => (
                            <div key={c.id} style={styles.candidateListItem}>
                                <span><strong>{c.name}</strong> - {c.party}</span>
                                <button onClick={() => deleteCandidate(c.id)} style={styles.deleteBtn}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>
            </div>
        );
    }

    // RESULTS PAGE
    if (showResults) {
        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.navbar}>
                    <div style={styles.logo}>🇰🇪 IEBC Kenya</div>
                    <div style={styles.navLinks}>
                        <button onClick={() => { setShowResults(false); setShowVote(false); setShowAdmin(false); }} style={styles.navLink}>Dashboard</button>
                        <button onClick={() => setShowAdmin(true)} style={styles.navLink}>Admin</button>
                        <button onClick={() => setShowResults(true)} style={styles.activeNavLink}>Results</button>
                        <button onClick={() => { setLoggedIn(false); }} style={styles.logoutBtn}>Logout</button>
                    </div>
                </div>
                <div style={styles.resultsHeader}>
                    <h1 style={styles.resultsTitle}>🇰🇪 KENYA GENERAL ELECTIONS 2027</h1>
                    <p style={styles.resultsSubtitle}>Official IEBC Results - Real-time Vote Count</p>
                    <div style={styles.actionButtons}>
                        <button onClick={printResults} style={styles.printBtn}>🖨️ Print Results</button>
                        <button onClick={() => setShowShareModal(true)} style={styles.shareBtn}>📤 Share Results</button>
                    </div>
                    <div style={styles.totalVotesBadge}>🗳️ Total Votes Cast: {totalVotes.toLocaleString()}</div>
                </div>

                <div style={styles.resultsCard}>
                    <h2 style={styles.resultsCardTitle}>👑 President of Kenya</h2>
                    {presidentialCandidates.map((c, idx) => {
                        const voteCount = currentResults.president[c.name] || 0;
                        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
                        return (
                            <div key={idx} style={styles.resultsItem}>
                                <div style={styles.resultsItemHeader}>
                                    <span><strong>{c.name}</strong> - {c.party}</span>
                                    <span>{voteCount.toLocaleString()} votes ({percentage}%)</span>
                                </div>
                                <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${percentage}%`, backgroundColor: c.color }}></div></div>
                            </div>
                        );
                    })}
                </div>

                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>

                {showShareModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3>Share Election Results</h3>
                            <button onClick={() => shareResults('twitter')} style={styles.twitterBtn}>🐦 Twitter</button>
                            <button onClick={() => shareResults('facebook')} style={styles.facebookBtn}>📘 Facebook</button>
                            <button onClick={() => shareResults('whatsapp')} style={styles.whatsappBtn}>💚 WhatsApp</button>
                            <button onClick={() => setShowShareModal(false)} style={styles.closeModalBtn}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // VOTING PAGE
    if (showVote) {
        if (hasVoted) {
            return (
                <div style={styles.container}>
                    <div style={styles.flagStripe}></div>
                    <div style={styles.alreadyVotedCard}>
                        <h1>🗳️ You Have Already Voted</h1>
                        <p>One voter, one vote. Thank you for participating!</p>
                        <button onClick={() => setShowResults(true)} style={styles.button}>View Results</button>
                    </div>
                    <div style={styles.footer}>
                        <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                        <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                    </div>
                    <div style={styles.flagStripeBottom}></div>
                </div>
            );
        }

        const votedCount = Object.values(votes).filter(v => v !== null).length;
        const progress = (votedCount / 5) * 100;

        return (
            <div style={styles.container}>
                <div style={styles.flagStripe}></div>
                <div style={styles.navbar}>
                    <div style={styles.logo}>🇰🇪 IEBC Kenya</div>
                    <div style={styles.navLinks}>
                        <button onClick={() => { setShowResults(false); setShowVote(false); setShowAdmin(false); }} style={styles.navLink}>Dashboard</button>
                        <button onClick={() => setShowAdmin(true)} style={styles.navLink}>Admin</button>
                        <button onClick={() => setShowVote(true)} style={styles.activeNavLink}>Vote</button>
                        <button onClick={() => setShowResults(true)} style={styles.navLink}>Results</button>
                        <button onClick={() => { setLoggedIn(false); }} style={styles.logoutBtn}>Logout</button>
                    </div>
                </div>

                <div style={styles.voteHeader}>
                    <h1 style={styles.voteTitle}>🗳️ KENYA GENERAL ELECTIONS 2027</h1>
                    <div style={styles.progressCard}>
                        <span>{votedCount} of 5 positions voted</span>
                        <div style={styles.progressBarContainer}><div style={{ ...styles.progressBarFill, width: `${progress}%` }}></div></div>
                    </div>
                </div>

                <div style={styles.voteCard}>
                    <h2>👑 President of Kenya</h2>
                    {votes.president && <span style={styles.votedBadge}>✓ Voted</span>}
                    <div style={styles.candidatesGrid}>
                        {presidentialCandidates.map(c => (
                            <div key={c.id} onClick={() => handleSelect('president', c.name)} style={{ ...styles.candidateCard, border: votes.president === c.name ? '2px solid #F3A900' : '1px solid #ddd', background: votes.president === c.name ? '#fff8e7' : 'white' }}>
                                <div style={{ ...styles.candidateAvatar, backgroundColor: c.color }}>{c.name.charAt(0)}</div>
                                <h3>{c.name}</h3>
                                <p style={{ color: c.color }}>{c.party}</p>
                                {votes.president === c.name && <div style={styles.selectedMark}>✓ SELECTED</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.voteCard}>
                    <h2>🏢 County Governor - {selectedCounty}</h2>
                    {votes.governor && <span style={styles.votedBadge}>✓ Voted</span>}
                    <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} style={styles.select}>
                        {counties.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={styles.candidatesGrid}>
                        <div onClick={() => handleSelect('governor', `Candidate A - ${selectedCounty}`)} style={{ ...styles.candidateCard, border: votes.governor === `Candidate A - ${selectedCounty}` ? '2px solid #F3A900' : '1px solid #ddd' }}>
                            <div style={styles.candidateAvatar}>A</div>
                            <h3>Candidate A</h3>
                            {votes.governor === `Candidate A - ${selectedCounty}` && <div style={styles.selectedMark}>✓ SELECTED</div>}
                        </div>
                        <div onClick={() => handleSelect('governor', `Candidate B - ${selectedCounty}`)} style={{ ...styles.candidateCard, border: votes.governor === `Candidate B - ${selectedCounty}` ? '2px solid #F3A900' : '1px solid #ddd' }}>
                            <div style={styles.candidateAvatar}>B</div>
                            <h3>Candidate B</h3>
                            {votes.governor === `Candidate B - ${selectedCounty}` && <div style={styles.selectedMark}>✓ SELECTED</div>}
                        </div>
                    </div>
                </div>

                <div style={styles.voteCard}>
                    <h2>🏛️ Member of Parliament</h2>
                    {votes.mp && <span style={styles.votedBadge}>✓ Voted</span>}
                    <div style={styles.candidatesGrid}>
                        {otherCandidates.filter(c => c.position === 'mp').map((c, idx) => (
                            <div key={idx} onClick={() => handleSelect('mp', c.name)} style={{ ...styles.candidateCard, border: votes.mp === c.name ? '2px solid #F3A900' : '1px solid #ddd' }}>
                                <div style={styles.candidateAvatar}>{c.name.charAt(0)}</div>
                                <h3>{c.name}</h3>
                                {votes.mp === c.name && <div style={styles.selectedMark}>✓ SELECTED</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.voteCard}>
                    <h2>👩‍⚖️ Women Representative</h2>
                    {votes.womenRep && <span style={styles.votedBadge}>✓ Voted</span>}
                    <div style={styles.candidatesGrid}>
                        {otherCandidates.filter(c => c.position === 'women').map((c, idx) => (
                            <div key={idx} onClick={() => handleSelect('womenRep', c.name)} style={{ ...styles.candidateCard, border: votes.womenRep === c.name ? '2px solid #F3A900' : '1px solid #ddd' }}>
                                <div style={styles.candidateAvatar}>{c.name.charAt(0)}</div>
                                <h3>{c.name}</h3>
                                {votes.womenRep === c.name && <div style={styles.selectedMark}>✓ SELECTED</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.voteCard}>
                    <h2>⚖️ Senator</h2>
                    {votes.senator && <span style={styles.votedBadge}>✓ Voted</span>}
                    <div style={styles.candidatesGrid}>
                        {otherCandidates.filter(c => c.position === 'senator').map((c, idx) => (
                            <div key={idx} onClick={() => handleSelect('senator', c.name)} style={{ ...styles.candidateCard, border: votes.senator === c.name ? '2px solid #F3A900' : '1px solid #ddd' }}>
                                <div style={styles.candidateAvatar}>{c.name.charAt(0)}</div>
                                <h3>{c.name}</h3>
                                {votes.senator === c.name && <div style={styles.selectedMark}>✓ SELECTED</div>}
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={handleSubmitVotes} style={styles.submitButton}>🇰🇪 CAST YOUR VOTES</button>
                <div style={styles.footer}>
                    <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                    <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
                </div>
                <div style={styles.flagStripeBottom}></div>
            </div>
        );
    }

    // DASHBOARD PAGE
    return (
        <div style={styles.container}>
            <div style={styles.flagStripe}></div>
            <div style={styles.navbar}>
                <div style={styles.logo}>🇰🇪 IEBC Kenya</div>
                <div style={styles.navLinks}>
                    <button onClick={() => { setShowResults(false); setShowVote(false); setShowAdmin(false); }} style={styles.activeNavLink}>Dashboard</button>
                    <button onClick={() => setShowAdmin(true)} style={styles.navLink}>Admin</button>
                    <button onClick={() => setShowVote(true)} style={styles.navLink}>Vote</button>
                    <button onClick={() => setShowResults(true)} style={styles.navLink}>Results</button>
                    <button onClick={() => { setLoggedIn(false); }} style={styles.logoutBtn}>Logout</button>
                </div>
            </div>
            
            <ElectionCountdown />
            
            <div style={styles.dashboardContent}>
                <h1 style={styles.dashboardTitle}>🇰🇪 Welcome, Voter</h1>
                <p style={styles.dashboardSubtitle}>Voter Card: {voterCard}</p>
                <div style={styles.dashboardCards}>
                    <div style={styles.dashboardCard} onClick={() => setShowVote(true)}>
                        <div style={styles.dashboardCardIcon}>🗳️</div>
                        <h3>Cast Your Vote</h3>
                        <p>Vote for your leaders</p>
                        <button style={styles.dashboardCardBtn}>Vote Now →</button>
                    </div>
                    <div style={styles.dashboardCard} onClick={() => setShowResults(true)}>
                        <div style={styles.dashboardCardIcon}>📊</div>
                        <h3>Election Results</h3>
                        <p>View live results</p>
                        <button style={styles.dashboardCardBtn}>View Results →</button>
                    </div>
                    <div style={styles.dashboardCard} onClick={() => setShowAdmin(true)}>
                        <div style={styles.dashboardCardIcon}>⚙️</div>
                        <h3>Admin Panel</h3>
                        <p>Manage elections</p>
                        <button style={styles.dashboardCardBtn}>Admin →</button>
                    </div>
                </div>
            </div>
            
            <VoterAnalytics />
            
            <div style={styles.footer}>
                <p>Independent Electoral and Boundaries Commission - IEBC Kenya</p>
                <p>Your Vote, Your Future | Integrity, Transparency, Credibility</p>
            </div>
            <div style={styles.flagStripeBottom}></div>
        </div>
    );
}

// ============================================
// STYLES
// ============================================

const styles = {
    container: {
        minHeight: '100vh',
        background: '#FFFFFF',
    },
    flagStripe: {
        height: '8px',
        background: 'linear-gradient(90deg, #000000 0%, #BE3F34 33%, #008C51 66%, #F3A900 100%)',
    },
    flagStripeBottom: {
        height: '4px',
        background: 'linear-gradient(90deg, #F3A900 0%, #008C51 33%, #BE3F34 66%, #000000 100%)',
    },
    loginWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
        padding: '40px 20px',
    },
    loginCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        border: '1px solid #e0e0e0',
    },
    loginTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#BE3F34',
        marginBottom: '8px',
        letterSpacing: '1px',
    },
    loginSubtitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '30px',
        paddingBottom: '15px',
        borderBottom: '2px solid #008C51',
        display: 'inline-block',
    },
    formTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    formSubtitle: {
        fontSize: '13px',
        color: '#888',
        marginBottom: '25px',
    },
    inputLabel: {
        display: 'block',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '500',
        color: '#555',
        marginBottom: '5px',
    },
    loginInput: {
        width: '100%',
        padding: '12px 15px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    loginButton: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
    },
    switchText: {
        marginTop: '25px',
        fontSize: '14px',
        color: '#666',
    },
    switchButton: {
        background: 'none',
        border: 'none',
        color: '#BE3F34',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
    navbar: {
        backgroundColor: '#000000',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
    },
    logo: {
        color: '#F3A900',
        fontSize: '20px',
        fontWeight: 'bold',
    },
    navLinks: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    navLink: {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        borderRadius: '8px',
    },
    activeNavLink: {
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    logoutBtn: {
        backgroundColor: '#BE3F34',
        color: 'white',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    dashboardContent: {
        textAlign: 'center',
        padding: '40px 20px 20px',
    },
    dashboardTitle: {
        color: '#BE3F34',
        fontSize: '32px',
        marginBottom: '10px',
    },
    dashboardSubtitle: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '30px',
    },
    dashboardCards: {
        display: 'flex',
        justifyContent: 'center',
        gap: '25px',
        flexWrap: 'wrap',
    },
    dashboardCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: '12px',
        padding: '25px',
        width: '220px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        border: '1px solid #e0e0e0',
    },
    dashboardCardIcon: {
        fontSize: '40px',
        marginBottom: '10px',
    },
    dashboardCardBtn: {
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        marginTop: '10px',
        cursor: 'pointer',
    },
    voteHeader: {
        textAlign: 'center',
        padding: '20px',
        background: '#000000',
        color: 'white',
    },
    voteTitle: {
        fontSize: '24px',
        marginBottom: '15px',
        color: '#F3A900',
    },
    progressCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '15px',
        maxWidth: '400px',
        margin: '0 auto',
    },
    progressBarContainer: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: '10px',
        height: '8px',
        marginTop: '8px',
    },
    progressBarFill: {
        backgroundColor: '#F3A900',
        height: '100%',
        borderRadius: '10px',
        transition: 'width 0.3s ease',
    },
    voteCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '15px',
        padding: '20px',
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
    },
    votedBadge: {
        position: 'absolute',
        top: '15px',
        right: '20px',
        backgroundColor: '#008C51',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
    },
    candidatesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '15px',
    },
    candidateCard: {
        padding: '15px',
        borderRadius: '10px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        backgroundColor: '#fafafa',
    },
    candidateAvatar: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 10px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
    },
    selectedMark: {
        marginTop: '8px',
        color: '#F3A900',
        fontWeight: 'bold',
        fontSize: '12px',
    },
    select: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    submitButton: {
        display: 'block',
        width: '90%',
        margin: '20px auto',
        padding: '14px',
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    resultsHeader: {
        textAlign: 'center',
        padding: '20px',
        background: '#000000',
        color: 'white',
    },
    resultsTitle: {
        fontSize: '24px',
        marginBottom: '5px',
        color: '#F3A900',
    },
    resultsSubtitle: {
        fontSize: '12px',
        marginBottom: '15px',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '15px',
    },
    printBtn: {
        backgroundColor: '#4a5568',
        color: 'white',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    shareBtn: {
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    totalVotesBadge: {
        display: 'inline-block',
        backgroundColor: '#F3A900',
        color: '#000',
        padding: '8px 20px',
        borderRadius: '20px',
        fontWeight: 'bold',
    },
    resultsCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '15px auto',
        padding: '20px',
        maxWidth: '700px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    resultsCardTitle: {
        fontSize: '20px',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #F3A900',
    },
    resultsItem: {
        marginBottom: '15px',
    },
    resultsItemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
        fontSize: '14px',
    },
    progressBar: {
        backgroundColor: '#e5e7eb',
        borderRadius: '10px',
        height: '6px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        transition: 'width 0.5s ease',
        borderRadius: '10px',
    },
    alreadyVotedCard: {
        textAlign: 'center',
        padding: '50px',
        backgroundColor: 'white',
        borderRadius: '12px',
        margin: '40px auto',
        maxWidth: '400px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    button: {
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '15px',
    },
    adminContainer: {
        padding: '30px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    adminTitle: {
        textAlign: 'center',
        color: '#BE3F34',
        fontSize: '28px',
        marginBottom: '20px',
    },
    adminGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    adminCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    adminBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#008C51',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    dangerBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#BE3F34',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    candidatesList: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    candidateListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #eee',
    },
    deleteBtn: {
        backgroundColor: '#BE3F34',
        color: 'white',
        border: 'none',
        padding: '5px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        textAlign: 'center',
        minWidth: '250px',
    },
    twitterBtn: {
        display: 'block',
        width: '100%',
        margin: '8px 0',
        padding: '10px',
        backgroundColor: '#1DA1F2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    facebookBtn: {
        display: 'block',
        width: '100%',
        margin: '8px 0',
        padding: '10px',
        backgroundColor: '#4267B2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    whatsappBtn: {
        display: 'block',
        width: '100%',
        margin: '8px 0',
        padding: '10px',
        backgroundColor: '#25D366',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    closeModalBtn: {
        display: 'block',
        width: '100%',
        margin: '8px 0',
        padding: '10px',
        backgroundColor: '#666',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    footer: {
        textAlign: 'center',
        padding: '20px',
        color: '#666',
        fontSize: '12px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #e0e0e0',
    },
};

export default App;