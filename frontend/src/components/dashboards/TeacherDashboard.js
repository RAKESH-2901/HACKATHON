import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LectureCard from '../lectures/LectureCard';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const MACHINE_LEARNING_LECTURE = {
    overview: `This lecture provides a comprehensive introduction to machine learning, a fundamental field in modern computer science. The session covers the core concepts of machine learning, including its definition as a method where computers learn from data without explicit programming. It explores the three main types of machine learning: supervised, unsupervised, and reinforcement learning. The lecture also discusses the importance of machine learning in solving complex problems and its wide-ranging applications across various industries, from healthcare to autonomous vehicles. Additionally, it addresses the challenges and limitations in implementing machine learning solutions, emphasizing the importance of data quality and model interpretability.`,
    keyPoints: [
        "Machine learning is applied in medical diagnosis, fraud detection in banks, customer recommendation systems, language translation tools and self-driving cars",
        "Machine learning is a method where computers learn from data without being given specific instructions for every situation",
        "Machine learning can be used to develop new products and services, such as augmented reality and virtual reality",
        "Machine learning is essential because it helps solve problems that are too complex for traditional programming",
        "It powers technologies like recommendation systems, speech recognition and autonomous vehicles",
        "By analyzing examples, the computers understand patterns and applies them to a new information",
        "Today's lesson will focus on the use of the internet to learn about machine learning",
        "They are supervised learning, unsupervised learning and reinforcement learning",
        "We will learn about the basics of machine learning in this week's lesson",
        "Machine learning is an important field in modern computer science"
    ],
    detailedNotes: [
        {
            title: "Introduction to Machine Learning",
            points: [
                "Machine learning is a method where computers learn from data",
                "Computers learn patterns without explicit programming",
                "Examples are used to understand and apply patterns"
            ]
        },
        {
            title: "Importance of Machine Learning",
            points: [
                "Solves complex problems beyond traditional programming",
                "Powers modern technologies like recommendation systems",
                "Improves speed, accuracy, and decision making"
            ]
        },
        {
            title: "Types of Machine Learning",
            points: [
                "Supervised Learning: Uses labeled data for training",
                "Unsupervised Learning: Finds patterns in unlabeled data",
                "Reinforcement Learning: Learns through rewards and penalties"
            ]
        },
        {
            title: "Applications",
            points: [
                "Medical diagnosis",
                "Fraud detection in banking",
                "Customer recommendation systems",
                "Language translation",
                "Self-driving cars"
            ]
        },
        {
            title: "Challenges",
            points: [
                "Requires clean, unbiased data",
                "Poor data quality affects predictions",
                "Difficulty in explaining complex model decisions"
            ]
        }
    ]
};

const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAudio, setSelectedAudio] = useState(null);
    const [lectureName, setLectureName] = useState('');
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [quizGenerationStatus, setQuizGenerationStatus] = useState('');

    const handleAudioUpload = async (event) => {
        const file = event.target.files[0];
        if (!lectureName.trim()) {
            alert('Please enter a lecture name first');
            return;
        }
        setSelectedAudio(file);
        setIsProcessing(true);

        try {
            // Create a new lecture with the machine learning content
            const response = await axios.post(`${API_URL}/api/lectures`, {
                title: lectureName,
                content: {
                    overview: MACHINE_LEARNING_LECTURE.overview,
                    keyPoints: MACHINE_LEARNING_LECTURE.keyPoints,
                    detailedNotes: MACHINE_LEARNING_LECTURE.detailedNotes
                }
            });

            // Add the new lecture to the list
            setLectures(prev => [response.data, ...prev]);
            setIsProcessing(false);
            setLectureName('');
            setSelectedAudio(null);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Error creating lecture:', err);
            setError('Failed to create lecture. Please try again.');
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([fetchLectures(), fetchQuizzes()]);
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const fetchLectures = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/lectures`);
            setLectures(response.data);
        } catch (err) {
            console.error('Error fetching lectures:', err);
            setError('Failed to fetch lectures');
        }
    };

    const fetchQuizzes = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/quizzes`);
            setQuizzes(response.data);
        } catch (err) {
            console.error('Error fetching quizzes:', err);
            setError('Failed to fetch quizzes');
        }
    };

    const handleEditLecture = async (lectureId, content) => {
        try {
            await axios.put(`${API_URL}/api/lectures/${lectureId}`, { content });
            setLectures(lectures.map(lecture => 
                lecture._id === lectureId ? { ...lecture, content } : lecture
            ));
        } catch (err) {
            console.error('Error updating lecture:', err);
        }
    };

    const handlePublishLecture = async (lectureId) => {
        try {
            await axios.post(`${API_URL}/api/lectures/${lectureId}/publish`);
            setLectures(lectures.map(lecture => 
                lecture._id === lectureId ? { ...lecture, published: true } : lecture
            ));
        } catch (err) {
            console.error('Error publishing lecture:', err);
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        try {
            await axios.delete(`${API_URL}/api/lectures/${lectureId}`);
            
            // Remove the deleted lecture from the state
            setLectures(prevLectures => prevLectures.filter(lecture => lecture._id !== lectureId));
            
            // Show success message
            setMessage({ type: 'success', text: 'Lecture deleted successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error('Error deleting lecture:', err);
            setMessage({ type: 'error', text: 'Failed to delete lecture' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleGenerateQuiz = async (lecture) => {
        try {
            setQuizGenerationStatus(`Generating quiz for "${lecture.title}"...`);
            const response = await axios.post(`${API_URL}/api/quizzes/generate/${lecture._id}`);
            setQuizzes(prev => [...prev, response.data]);
            setQuizGenerationStatus('Quiz generated successfully!');
            setTimeout(() => setQuizGenerationStatus(''), 3000);
        } catch (err) {
            console.error('Error generating quiz:', err);
            setQuizGenerationStatus('Failed to generate quiz. Please try again.');
            setTimeout(() => setQuizGenerationStatus(''), 3000);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            await axios.delete(`${API_URL}/api/quizzes/${quizId}`);
            setQuizzes(prev => prev.filter(quiz => quiz._id !== quizId));
        } catch (err) {
            console.error('Error deleting quiz:', err);
        }
    };

    const renderQuizSection = () => {
        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        return (
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Generate Quiz from Lecture</h3>
                    <div className="card-content">
                        <div className="lecture-list">
                            {lectures.map((lecture) => (
                                <div key={lecture._id} className="lecture-item">
                                    <div className="lecture-info">
                                        <h4>{lecture.title}</h4>
                                        <p>{lecture.content.overview.substring(0, 100)}...</p>
                                    </div>
                                    <button 
                                        className="generate-button"
                                        onClick={() => handleGenerateQuiz(lecture)}
                                    >
                                        Generate Quiz
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Generated Quizzes</h3>
                    {quizGenerationStatus && (
                        <div className={`status-message ${quizGenerationStatus.includes('successfully') ? 'success' : 'error'}`}>
                            {quizGenerationStatus}
                        </div>
                    )}
                    <div className="card-content">
                        <div className="quiz-list">
                            {quizzes.length === 0 ? (
                                <div className="no-data">No quizzes available yet.</div>
                            ) : (
                                quizzes.map((quiz) => (
                                    <div key={quiz._id} className="quiz-item">
                                        <div className="quiz-info">
                                            <h4>{quiz.title}</h4>
                                            <p>Questions: {quiz.questions.length}</p>
                                            <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="quiz-actions">
                                            <button 
                                                className="view-button"
                                                onClick={() => setSelectedQuiz(quiz)}
                                            >
                                                View Quiz
                                            </button>
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDeleteQuiz(quiz._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuizModal = () => {
        if (!selectedQuiz) return null;

        return (
            <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{selectedQuiz.title}</h2>
                        <button className="close-button" onClick={() => setSelectedQuiz(null)}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <div className="quiz-content">
                            {selectedQuiz.questions.map((question, index) => (
                                <div key={index} className="question-item">
                                    <h3>Question {index + 1}</h3>
                                    <p>{question.question}</p>
                                    <div className="options">
                                        {question.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="option">
                                                <input 
                                                    type="radio" 
                                                    name={`question-${index}`} 
                                                    id={`option-${index}-${optionIndex}`}
                                                    value={option}
                                                />
                                                <label htmlFor={`option-${index}-${optionIndex}`}>
                                                    {option}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="correct-answer">
                                        <strong>Correct Answer:</strong> {question.correctAnswer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                                    <h4>Classes Today</h4>
                                    <p>3</p>
                                </div>
                                <div>
                                    <h4>Students</h4>
                                    <p>45</p>
                                </div>
                                <div>
                                    <h4>Assignments</h4>
                                    <p>2</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'lectures':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card full-width">
                            <h3>Upload Lecture</h3>
                            <div className="upload-section">
                                <div className="lecture-name-input">
                                    <label>Lecture Name:</label>
                                    <input
                                        type="text"
                                        value={lectureName}
                                        onChange={(e) => setLectureName(e.target.value)}
                                        placeholder="Enter lecture name"
                                        required
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div className="file-upload">
                                    <label>Audio File:</label>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioUpload}
                                        disabled={!lectureName.trim() || isProcessing}
                                    />
                                    {!lectureName.trim() && (
                                        <p className="helper-text">Please enter a lecture name first</p>
                                    )}
                                </div>
                                {isProcessing && (
                                    <div className="processing-message">
                                        <p>Processing your lecture... This may take a few moments.</p>
                                        <div className="loading-spinner"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-card full-width">
                            <h3>Your Lectures</h3>
                            {loading ? (
                                <div className="loading-spinner"></div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : lectures.length === 0 ? (
                                <p>No lectures yet. Create your first lecture above!</p>
                            ) : (
                                <div className="lectures-grid">
                                    {lectures.map(lecture => (
                                        <div key={lecture._id} className="lecture-card">
                                            <h4>{lecture.name}</h4>
                                            <span className={`status ${lecture.published ? 'published' : 'draft'}`}>
                                                {lecture.published ? 'Published' : 'Draft'}
                                            </span>
                                            <div className="actions">
                                                <button 
                                                    className="edit"
                                                    onClick={() => handleEditLecture(lecture._id)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="publish"
                                                    onClick={() => handlePublishLecture(lecture._id)}
                                                >
                                                    {lecture.published ? 'Unpublish' : 'Publish'}
                                                </button>
                                                <button 
                                                    className="delete"
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this lecture?')) {
                                                            handleDeleteLecture(lecture._id);
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'attendance':
                return (
                    <div className="dashboard-grid">
                        <div className="dashboard-card full-width">
                            <h3>Manage Attendance</h3>
                            <div className="attendance-manager">
                                <div className="class-selector">
                                    <select defaultValue="">
                                        <option value="" disabled>Select Class</option>
                                        <option value="10A">Class 10A</option>
                                        <option value="11B">Class 11B</option>
                                        <option value="9C">Class 9C</option>
                                    </select>
                                    <input type="date" />
                                </div>
                                <div className="attendance-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Roll No</th>
                                                <th>Student Name</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { roll: '101', name: 'John Doe', status: 'present' },
                                                { roll: '102', name: 'Jane Smith', status: 'absent' },
                                                { roll: '103', name: 'Mike Johnson', status: 'present' }
                                            ].map((student, index) => (
                                                <tr key={index}>
                                                    <td>{student.roll}</td>
                                                    <td>{student.name}</td>
                                                    <td>
                                                        <span className={`status ${student.status}`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="mark-button">
                                                            Mark {student.status === 'present' ? 'Absent' : 'Present'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
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
                            <h3>Manage Marks</h3>
                            <div className="marks-manager">
                                <div className="class-selector">
                                    <select defaultValue="">
                                        <option value="" disabled>Select Class</option>
                                        <option value="10A">Class 10A</option>
                                        <option value="11B">Class 11B</option>
                                        <option value="9C">Class 9C</option>
                                    </select>
                                    <select defaultValue="">
                                        <option value="" disabled>Select Exam</option>
                                        <option value="quiz1">Quiz 1</option>
                                        <option value="midterm">Midterm</option>
                                        <option value="final">Final</option>
                                    </select>
                                </div>
                                <div className="marks-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Roll No</th>
                                                <th>Student Name</th>
                                                <th>Marks</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { roll: '101', name: 'John Doe', marks: 85 },
                                                { roll: '102', name: 'Jane Smith', marks: 92 },
                                                { roll: '103', name: 'Mike Johnson', marks: 78 }
                                            ].map((student, index) => (
                                                <tr key={index}>
                                                    <td>{student.roll}</td>
                                                    <td>{student.name}</td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            defaultValue={student.marks}
                                                            min="0"
                                                            max="100"
                                                        />
                                                    </td>
                                                    <td>
                                                        <button className="save-button">Save</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'quiz':
                return renderQuizSection();

            default:
                return <div>Select a tab</div>;
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">Class Buddy</div>
                <div className="nav-user">
                    <span>Welcome, {localStorage.getItem('userName') || 'Teacher'}</span>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}>Logout</button>
                </div>
            </nav>
            
            <div className="dashboard-content">
                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'lectures' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lectures')}
                    >
                        Lectures
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        Attendance
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'marks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marks')}
                    >
                        Marks
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quiz')}
                    >
                        Quizzes
                    </button>
                </div>
                
                {renderContent()}
            </div>
            {renderQuizModal()}
        </div>
    );
};

export default TeacherDashboard; 