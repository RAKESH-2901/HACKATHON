import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const ParentDashboard = () => {
    const [activeTab, setActiveTab] = useState('marks');
    const [studentData, setStudentData] = useState({
        marks: [],
        attendance: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching student data...');
            
            // Get the parent's info from localStorage
            const parentId = localStorage.getItem('userId');
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
            
            // First fetch the student info
            console.log('Fetching student info...');
            const studentResponse = await axios.get(`${API_URL}/api/students/STU001`);
            console.log('Student info received:', studentResponse.data);
            setStudentInfo(studentResponse.data);

            console.log('Fetching marks and attendance...');
            const [marksResponse, attendanceResponse] = await Promise.all([
                axios.get(`${API_URL}/api/students/STU001/marks`),
                axios.get(`${API_URL}/api/students/STU001/attendance`)
            ]);
            console.log('Marks and attendance received');

            setStudentData({
                marks: marksResponse.data,
                attendance: attendanceResponse.data
            });
            setError(null);
        } catch (err) {
            console.error('Error details:', err.response || err);
            setError('Failed to fetch student data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, []);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchStudentData();
    };

    const renderMarks = () => {
        if (!studentData.marks || studentData.marks.length === 0) {
            return <div className="no-data">No marks data available</div>;
        }

        const subjects = studentData.marks.map(mark => mark.subject);
        const percentages = studentData.marks.map(mark => 
            ((mark.marksObtained / mark.totalMarks) * 100).toFixed(2)
        );

        const chartData = {
            labels: subjects,
            datasets: [
                {
                    label: 'Marks Percentage',
                    data: percentages,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Marks Distribution by Subject',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                },
            },
        };

        return (
            <div className="charts-container">
                <div className="chart-wrapper">
                    <Bar data={chartData} options={options} />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Test Name</th>
                            <th>Marks Obtained</th>
                            <th>Total Marks</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentData.marks.map((mark, index) => (
                            <tr key={index}>
                                <td>{mark.subject}</td>
                                <td>{mark.testName}</td>
                                <td>{mark.marksObtained}</td>
                                <td>{mark.totalMarks}</td>
                                <td>{((mark.marksObtained / mark.totalMarks) * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAttendance = () => {
        if (!studentData.attendance || studentData.attendance.length === 0) {
            return <div className="no-data">No attendance data available</div>;
        }

        const subjects = studentData.attendance.map(att => att.subject);
        const attendancePercentages = studentData.attendance.map(att => 
            ((att.classesAttended / att.totalClasses) * 100).toFixed(2)
        );

        const chartData = {
            labels: subjects,
            datasets: [
                {
                    data: attendancePercentages,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Attendance Distribution by Subject',
                },
            },
        };

        return (
            <div className="charts-container">
                <div className="chart-wrapper">
                    <Pie data={chartData} options={options} />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Total Classes</th>
                            <th>Classes Attended</th>
                            <th>Attendance Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentData.attendance.map((attendance, index) => (
                            <tr key={index}>
                                <td>{attendance.subject}</td>
                                <td>{attendance.totalClasses}</td>
                                <td>{attendance.classesAttended}</td>
                                <td>{((attendance.classesAttended / attendance.totalClasses) * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <nav className="dashboard-nav">
                    <div className="nav-brand">Class Buddy</div>
                </nav>
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading student data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <nav className="dashboard-nav">
                    <div className="nav-brand">Class Buddy</div>
                </nav>
                <div className="error-container">
                    <p className="error">{error}</p>
                    <button className="retry-button" onClick={handleRetry}>
                        Retry Loading Data
                    </button>
                    {retryCount > 0 && (
                        <p className="retry-count">
                            Retry attempt {retryCount} of 3
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-brand">Class Buddy</div>
                <div className="nav-user">
                    <span>Welcome, {localStorage.getItem('userName') || 'Parent'}</span>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                    }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                {studentInfo && (
                    <div className="student-info">
                        <h2>Student Information</h2>
                        <p>Name: {studentInfo.name}</p>
                        <p>Register Number: {studentInfo.registerNumber}</p>
                    </div>
                )}

                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'marks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('marks')}
                    >
                        Marks
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attendance')}
                    >
                        Attendance
                    </button>
                </div>

                <div className="dashboard-content">
                    {activeTab === 'marks' ? renderMarks() : renderAttendance()}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard; 