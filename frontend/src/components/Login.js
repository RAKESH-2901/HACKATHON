import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Login = () => {
    const [role, setRole] = useState('student');
    const [registerNumber, setRegisterNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                registerNumber,
                password,
                role
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('userName', response.data.user.name);
            window.location.href = `/dashboard/${response.data.role}`;
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            console.error('Login error:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <h1>Class Buddy</h1>
                <p>See your stuff, track your time — minus the hallway hustle.</p>
                <div className="illustration">
                    {/* You can add your illustration image here */}
                </div>
            </div>
            <div className="login-right">
                <div className="login-box">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account</p>
                    
                    <div className="role-selector">
                        <button 
                            type="button"
                            className={role === 'student' ? 'active' : ''} 
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button 
                            type="button"
                            className={role === 'teacher' ? 'active' : ''} 
                            onClick={() => setRole('teacher')}
                        >
                            Teacher
                        </button>
                        <button 
                            type="button"
                            className={role === 'parent' ? 'active' : ''} 
                            onClick={() => setRole('parent')}
                        >
                            Parent
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Register Number</label>
                            <input
                                type="text"
                                value={registerNumber}
                                onChange={(e) => setRegisterNumber(e.target.value)}
                                placeholder="Enter your register number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <a href="/forgot-password" className="forgot-password">
                                Forgot password?
                            </a>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="sign-in-button">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 