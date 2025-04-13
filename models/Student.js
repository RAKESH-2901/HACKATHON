const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    registerNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    marks: [{
        subject: String,
        testName: String,
        marksObtained: Number,
        totalMarks: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    attendance: [{
        subject: String,
        totalClasses: Number,
        classesAttended: Number,
        month: String
    }],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Student', studentSchema); 