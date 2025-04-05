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
app.use(express.static(__dirname));

// Initialize testimonials file
function initializeTestimonialsFile() {
    if (!fs.existsSync(TESTIMONIALS_FILE)) {
        const defaultData = {
            intro: "Here are some feed backs📜 from people we worked together",
            testimonials: [],
            metadata: {
                createdAt: new Date().toISOString(),
                lastUpdated: null
            }
        };
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Read testimonials
function readTestimonials() {
    try {
        return JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf8'));
    } catch (err) {
        console.error('Error reading testimonials:', err);
        return null;
    }
}

// Write testimonials
function writeTestimonials(data) {
    try {
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving testimonials:', err);
        return false;
    }
}

// Generate a random ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
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

    const data = readTestimonials() || {
        intro: "Here are some feed backs📜 from people we worked together",
        testimonials: [],
        metadata: {
            createdAt: new Date().toISOString(),
            lastUpdated: null
        }
    };

    const newTestimonial = {
        id: generateId(),
        text,
        author,
        date: new Date().toISOString() // Real-time timestamp
    };
    
    data.testimonials.unshift(newTestimonial); // Add to beginning
    data.metadata.lastUpdated = new Date().toISOString();
    
    if (writeTestimonials(data)) {
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

// Initialize and start server
initializeTestimonialsFile();
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Testimonials file: ${TESTIMONIALS_FILE}`);
});
