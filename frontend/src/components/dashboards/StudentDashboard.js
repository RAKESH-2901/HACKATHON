import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import './StudentDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const LectureModal = ({ lecture, onClose }) => {
    if (!lecture) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{lecture.title}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="lecture-content">
                        <section className="content-section">
                            <h3>Overview</h3>
                            <p>{lecture.content.overview}</p>
                        </section>

                        <section className="content-section">
                            <h3>Key Points</h3>
                            <ol className="key-points-list">
                                {lecture.content.keyPoints.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ol>
                        </section>

                        <section className="content-section">
                            <h3>Detailed Notes</h3>
                            {lecture.content.detailedNotes.map((section, index) => (
                                <div key={index} className="detailed-section">
                                    <h4>{section.title}</h4>
                                    <ul>
                                        {section.points.map((point, pointIndex) => (
                                            <li key={pointIndex}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const studentName = localStorage.getItem('userName') || 'Student';
    const [activeTab, setActiveTab] = useState('overview');
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/lectures`);
                // Filter only published lectures
                const publishedLectures = response.data.filter(lecture => lecture.published);
                setLectures(publishedLectures);
                setError(null);
            } catch (err) {
                setError('Failed to fetch lectures. Please try again later.');
                console.error('Error fetching lectures:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, []);

    const renderContent = () => {
        switch(activeTab) {
            case 'overview':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3>Today's Schedule</h3>
                            <div className="card-content">
                                <ul>
                                    <li>Mathematics - 9:00 AM</li>
                                    <li>Science - 10:30 AM</li>
                                    <li>English - 1:00 PM</li>
                                </ul>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Quick Stats</h3>
                            <div className="card-content stats-grid">
                                <div>
                                    <h4>Attendance</h4>
                                    <p>90%</p>
                                </div>
                                <div>
                                    <h4>Average Grade</h4>
                                    <p>A-</p>
                                </div>
                                <div>
                                    <h4>Pending Tasks</h4>
                                    <p>3</p>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Recent Lectures</h3>
                            <div className="card-content">
                                <div className="recent-lectures">
                                    {lectures.slice(0, 3).map(lecture => (
                                        <div key={lecture._id} className="recent-lecture-item">
                                            <h4>{lecture.title}</h4>
                                            <button onClick={() => setSelectedLecture(lecture)}>
                                                View Lecture
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'lectures':
                if (loading) {
                    return <div className="loading">Loading lectures...</div>;
                }

                if (error) {
                    return <div className="error">{error}</div>;
                }

                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card full-width">
                            <h3>Available Lectures</h3>
                            <div className="card-content">
                                <div className="lecture-list">
                                    {lectures.length === 0 ? (
                                        <div className="no-data">No lectures available yet.</div>
                                    ) : (
                                        lectures.map((lecture) => (
                                            <div key={lecture._id} className="lecture-item">
                                                <div className="lecture-info">
                                                    <h4>{lecture.title}</h4>
                                                    <p>{lecture.content.overview.substring(0, 150)}...</p>
                                                    <span>Published: {new Date(lecture.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                                <button 
                                                    className="view-button"
                                                    onClick={() => setSelectedLecture(lecture)}
                                                >
                                                    View Lecture
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'attendance':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card full-width">
                            <h3>Attendance Report</h3>
                            <div className="card-content">
                                <div className="attendance-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Total Classes</th>
                                                <th>Classes Attended</th>
                                                <th>Percentage</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Mathematics</td>
                                                <td>30</td>
                                                <td>28</td>
                                                <td>93.33%</td>
                                                <td><span className="status good">Good</span></td>
                                            </tr>
                                            <tr>
                                                <td>Physics</td>
                                                <td>25</td>
                                                <td>22</td>
                                                <td>88%</td>
                                                <td><span className="status good">Good</span></td>
                                            </tr>
                                            <tr>
                                                <td>Chemistry</td>
                                                <td>28</td>
                                                <td>20</td>
                                                <td>71.43%</td>
                                                <td><span className="status warning">Warning</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'marks':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card full-width">
                            <h3>Academic Performance</h3>
                            <div className="card-content">
                                <div className="marks-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Quiz 1</th>
                                                <th>Mid Term</th>
                                                <th>Quiz 2</th>
                                                <th>Final</th>
                                                <th>Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Mathematics</td>
                                                <td>90</td>
                                                <td>85</td>
                                                <td>88</td>
                                                <td>92</td>
                                                <td>A</td>
                                            </tr>
                                            <tr>
                                                <td>Physics</td>
                                                <td>85</td>
                                                <td>82</td>
                                                <td>88</td>
                                                <td>85</td>
                                                <td>A-</td>
                                            </tr>
                                            <tr>
                                                <td>Chemistry</td>
                                                <td>78</td>
                                                <td>75</td>
                                                <td>80</td>
                                                <td>82</td>
                                                <td>B+</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            case 'quiz':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3>Available Quizzes</h3>
                            <div className="card-content">
                                <div className="quiz-list">
                                    <div className="quiz-item">
                                        <h4>Mathematics Quiz 3</h4>
                                        <p>Topics: Integration, Differentiation</p>
                                        <div className="quiz-meta">
                                            <span>Duration: 30 mins</span>
                                            <span>Questions: 20</span>
                                        </div>
                                        <button className="start-quiz">Start Quiz</button>
                                    </div>
                                    <div className="quiz-item">
                                        <h4>Physics Quiz 2</h4>
                                        <p>Topics: Wave Motion, Sound</p>
                                        <div className="quiz-meta">
                                            <span>Duration: 25 mins</span>
                                            <span>Questions: 15</span>
                                        </div>
                                        <button className="start-quiz">Start Quiz</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="dashboard-card">
                            <h3>Recent Quiz Results</h3>
                            <div className="card-content">
                                <div className="quiz-results">
                                    <div className="result-item">
                                        <h4>Mathematics Quiz 2</h4>
                                        <p>Score: 18/20</p>
                                        <span className="score-percentage">90%</span>
                                    </div>
                                    <div className="result-item">
                                        <h4>Physics Quiz 1</h4>
                                        <p>Score: 14/15</p>
                                        <span className="score-percentage">93%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">Class Buddy</div>
                <div className="nav-user">
                    <span>Welcome, {studentName}</span>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}>Logout</button>
                </div>
            </nav>
            
            <div className="dashboard-content">
                <div className="tab-navigation">
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''} 
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'lectures' ? 'active' : ''} 
                        onClick={() => setActiveTab('lectures')}
                    >
                        Lectures
                    </button>
                    <button 
                        className={activeTab === 'attendance' ? 'active' : ''} 
                        onClick={() => setActiveTab('attendance')}
                    >
                        Attendance
                    </button>
                    <button 
                        className={activeTab === 'marks' ? 'active' : ''} 
                        onClick={() => setActiveTab('marks')}
                    >
                        Marks
                    </button>
                    <button 
                        className={activeTab === 'quiz' ? 'active' : ''} 
                        onClick={() => setActiveTab('quiz')}
                    >
                        Quiz
                    </button>
                </div>
                
                {renderContent()}
            </div>

            {selectedLecture && (
                <LectureModal 
                    lecture={selectedLecture} 
                    onClose={() => setSelectedLecture(null)} 
                />
            )}
        </div>
    );
};

export default StudentDashboard; 