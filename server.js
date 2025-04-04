const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TESTIMONIALS_FILE = path.join(__dirname, 'test.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root directory

// Ensure testimonials file exists
function initializeTestimonialsFile() {
    if (!fs.existsSync(TESTIMONIALS_FILE)) {
        const defaultData = {
            intro: "Here's what people say about working with me:",
            testimonials: [],
            metadata: {
                createdAt: new Date().toISOString(),
                lastUpdated: null
            }
        };
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Read testimonials from file
function readTestimonials() {
    try {
        const data = fs.readFileSync(TESTIMONIALS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading testimonials file:', err);
        return null;
    }
}

// Write testimonials to file
function writeTestimonials(data) {
    try {
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing to testimonials file:', err);
        return false;
    }
}

// API Endpoints
app.get('/api/testimonials', (req, res) => {
    const data = readTestimonials();
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to load testimonials' 
        });
    }
});

app.post('/api/testimonials', (req, res) => {
    const { author, text } = req.body;
    
    if (!author || !text) {
        return res.status(400).json({ 
            success: false, 
            message: 'Both name and testimonial text are required' 
        });
    }

    const data = readTestimonials();
    if (!data) {
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to load existing testimonials' 
        });
    }

    const newTestimonial = { 
        text, 
        author,
        date: new Date().toISOString(),
        id: Date.now().toString()
    };
    
    data.testimonials.unshift(newTestimonial);
    data.metadata.lastUpdated = new Date().toISOString();
    
    const success = writeTestimonials(data);
    
    if (success) {
        res.json({ 
            success: true, 
            message: 'Testimonial added successfully!',
            testimonial: newTestimonial
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save testimonial' 
        });
    }
});

// Initialize file on startup
initializeTestimonialsFile();

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Testimonials stored in: ${TESTIMONIALS_FILE}`);
});
