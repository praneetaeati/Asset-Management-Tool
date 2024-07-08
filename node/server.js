const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Set up storage with multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory to save the file
    },
    filename: function (req, file, cb) {
        cb(null, file.Excel); // File name
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public')); // Serve static files from 'public' directory

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
