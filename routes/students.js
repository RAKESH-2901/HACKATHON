const router = require('express').Router();
const Student = require('../models/Student');

// Get student by register number
router.get('/:registerNumber', async (req, res) => {
    try {
        const student = await Student.findOne({ registerNumber: req.params.registerNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get student marks
router.get('/:registerNumber/marks', async (req, res) => {
    try {
        const student = await Student.findOne({ registerNumber: req.params.registerNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student.marks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get student attendance
router.get('/:registerNumber/attendance', async (req, res) => {
    try {
        const student = await Student.findOne({ registerNumber: req.params.registerNumber });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student.attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 