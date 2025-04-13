const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        overview: {
            type: String,
            required: true
        },
        keyPoints: [{
            type: String,
            required: true
        }],
        detailedNotes: [{
            title: {
                type: String,
                required: true
            },
            points: [{
                type: String,
                required: true
            }]
        }]
    },
    published: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lecture', lectureSchema); 