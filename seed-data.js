require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const sampleUsers = [
    {
        registerNumber: 'STU001',
        password: 'student123',
        role: 'student',
        name: 'John Doe',
        email: 'john.student@example.com'
    },
    {
        registerNumber: 'TEA001',
        password: 'teacher123',
        role: 'teacher',
        name: 'Jane Smith',
        email: 'jane.teacher@example.com'
    },
    {
        registerNumber: 'PAR001',
        password: 'parent123',
        role: 'parent',
        name: 'Robert Johnson',
        email: 'robert.parent@example.com'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Hash passwords and create users
        const hashedUsers = await Promise.all(
            sampleUsers.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        // Insert users
        await User.insertMany(hashedUsers);
        console.log('Sample users created successfully!');
        console.log('\nYou can now log in with these credentials:');
        console.log('Student: STU001 / student123');
        console.log('Teacher: TEA001 / teacher123');
        console.log('Parent: PAR001 / parent123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase(); 