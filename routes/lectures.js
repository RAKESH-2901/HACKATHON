const router = require('express').Router();
const Lecture = require('../models/Lecture');

// Get all lectures
router.get('/', async (req, res) => {
    try {
        const lectures = await Lecture.find().sort({ createdAt: -1 });
        res.json(lectures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new lecture
router.post('/', async (req, res) => {
    try {
        console.log('Received lecture creation request:', req.body);
        
        const lecture = new Lecture({
            title: req.body.title,
            content: {
                overview: req.body.content.overview || '',
                keyPoints: req.body.content.keyPoints || [],
                detailedNotes: req.body.content.detailedNotes || []
            }
        });

        console.log('Created lecture object:', lecture);

        const newLecture = await lecture.save();
        console.log('Saved lecture:', newLecture);
        
        res.status(201).json(newLecture);
    } catch (err) {
        console.error('Error creating lecture:', err);
        console.error('Request body:', req.body);
        res.status(400).json({ message: err.message });
    }
});

// Update a lecture
router.put('/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        lecture.content = req.body.content;
        lecture.updatedAt = Date.now();
        await lecture.save();

        res.json(lecture);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Publish a lecture
router.post('/:id/publish', async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        lecture.published = true;
        lecture.updatedAt = Date.now();
        await lecture.save();

        res.json(lecture);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete lecture
router.delete('/:id', async (req, res) => {
    try {
        const lecture = await Lecture.findByIdAndDelete(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        res.json({ message: 'Lecture deleted successfully' });
    } catch (err) {
        console.error('Error deleting lecture:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 