const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Lecture = require('../models/Lecture');

// Helper function to generate quiz questions from lecture content
const generateQuestionsFromContent = (content) => {
    const questions = [];
    
    // Generate a question from overview
    if (content.overview) {
        questions.push({
            question: "What is the main topic of this lecture?",
            options: [
                "Machine Learning",
                "Data Science",
                "Artificial Intelligence",
                "Computer Programming"
            ],
            correctAnswer: 0
        });
    }

    // Generate questions from key points
    content.keyPoints.slice(0, 3).forEach(point => {
        const question = {
            question: `Which of the following is true about machine learning?`,
            options: [
                point,
                "It only works with small datasets",
                "It requires manual programming for every scenario",
                "It cannot be used in real-world applications"
            ],
            correctAnswer: 0
        };
        questions.push(question);
    });

    // Generate questions from detailed notes
    content.detailedNotes.forEach(section => {
        if (section.points.length > 0) {
            const question = {
                question: `Regarding ${section.title}, which statement is correct?`,
                options: [
                    section.points[0],
                    "None of the above",
                    "All of the above",
                    "This topic is not covered in the lecture"
                ],
                correctAnswer: 0
            };
            questions.push(question);
        }
    });

    return questions;
};

// Generate quiz from lecture content
router.post('/generate/:lectureId', async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const questions = generateQuestionsFromContent(lecture.content);
        
        const quiz = new Quiz({
            title: `${lecture.title} Quiz`,
            lectureId: lecture._id,
            questions: questions
        });

        const savedQuiz = await quiz.save();
        res.status(201).json(savedQuiz);
    } catch (err) {
        console.error('Error generating quiz:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all quizzes
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('lectureId').sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all quizzes for a lecture
router.get('/lecture/:lectureId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ lectureId: req.params.lectureId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get a specific quiz
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a new quiz
router.post('/', async (req, res) => {
    try {
        const quiz = new Quiz({
            title: req.body.title,
            lectureId: req.body.lectureId,
            questions: req.body.questions
        });
        const newQuiz = await quiz.save();
        res.status(201).json(newQuiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a quiz
router.delete('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router; 