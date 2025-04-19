const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Storage for uploaded files
const upload = multer({ dest: 'uploads/' });

// In-memory quiz storage (for demo)
let quizzes = {};

// Serve home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Save quiz endpoint
app.post('/api/quiz/save', (req, res) => {
    const { id, quiz } = req.body;
    if (!id || !quiz) {
        return res.status(400).json({ error: 'Missing id or quiz data' });
    }
    quizzes[id] = quiz;
    res.json({ message: 'Quiz saved successfully' });
});

// Load quiz endpoint
app.get('/api/quiz/load/:id', (req, res) => {
    const id = req.params.id;
    if (!quizzes[id]) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ quiz: quizzes[id] });
});

// Upload DOC/PDF and simulate AI processing
app.post('/api/quiz/import', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Simulate AI processing by reading file content (for demo only)
    const filePath = path.join(__dirname, req.file.path);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read uploaded file' });
        }
        // Simulate quiz generation from file content
        const sentences = data.split(/(?<=[.?!])\s+/);
        const generatedQuiz = sentences.map((sentence, idx) => ({
            text: sentence,
            type: 'Multiple Choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A'
        }));
        // Delete uploaded file after processing
        fs.unlink(filePath, () => {});
        res.json({ quiz: generatedQuiz });
    });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Quiz Creator backend listening at http://localhost:${port}`);
});
