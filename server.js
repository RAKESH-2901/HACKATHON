require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const lectureRoutes = require('./routes/lectures');
const studentRoutes = require('./routes/students');
const Student = require('./models/Student');
const quizRoutes = require('./routes/quizzes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/quizzes', quizRoutes);

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// MongoDB Connection with retry logic and debug info
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classbuddy');
        console.log('Connected to MongoDB successfully');
        
        // Check if we have any users
        const userCount = await User.countDocuments();
        console.log(`Current user count: ${userCount}`);
        
        if (userCount === 0) {
            console.log('No users found, creating default users...');
            
            // Create default users
            const users = [
                {
                    registerNumber: 'TEA001',
                    password: 'teacher123',
                    role: 'teacher',
                    name: 'Jane Smith',
                    email: 'jane.teacher@example.com'
                },
                {
                    registerNumber: 'STU001',
                    password: 'student123',
                    role: 'student',
                    name: 'John Doe',
                    email: 'john.student@example.com'
                },
                {
                    registerNumber: 'PAR001',
                    password: 'parent123',
                    role: 'parent',
                    name: 'Robert Johnson',
                    email: 'robert.parent@example.com'
                }
            ];

            for (const userData of users) {
                console.log(`Creating user: ${userData.registerNumber}`);
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);
                
                const user = await User.create({
                    ...userData,
                    password: hashedPassword
                });

                // If this is a parent user, create a sample student
                if (userData.role === 'parent') {
                    console.log('Creating sample student data...');
                    await Student.create({
                        registerNumber: 'STU001',
                        name: 'John Doe',
                        parentId: user._id,
                        marks: [
                            {
                                subject: 'Mathematics',
                                testName: 'Mid Term',
                                marksObtained: 85,
                                totalMarks: 100,
                                date: new Date()
                            },
                            {
                                subject: 'Science',
                                testName: 'Mid Term',
                                marksObtained: 90,
                                totalMarks: 100,
                                date: new Date()
                            },
                            {
                                subject: 'English',
                                testName: 'Mid Term',
                                marksObtained: 88,
                                totalMarks: 100,
                                date: new Date()
                            }
                        ],
                        attendance: [
                            {
                                subject: 'Mathematics',
                                totalClasses: 20,
                                classesAttended: 18,
                                month: 'March'
                            },
                            {
                                subject: 'Science',
                                totalClasses: 20,
                                classesAttended: 19,
                                month: 'March'
                            },
                            {
                                subject: 'English',
                                totalClasses: 20,
                                classesAttended: 17,
                                month: 'March'
                            }
                        ]
                    });
                    console.log('Sample student data created successfully');
                }
            }
            console.log('All default users created successfully');
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 