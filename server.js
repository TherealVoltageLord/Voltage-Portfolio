const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TESTIMONIALS_FILE = path.join(__dirname, 'test.json');

// Create test.json if it doesn't exist
if (!fs.existsSync(TESTIMONIALS_FILE)) {
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify({
        intro: "Here's what people say about working with Voltage Lord:",
        testimonials: []
    }, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper function to read testimonials
const getTestimonials = () => {
    try {
        const rawData = fs.readFileSync(TESTIMONIALS_FILE);
        return JSON.parse(rawData);
    } catch (err) {
        console.error('Error reading testimonials:', err);
        return {
            intro: "Here's what people say about working with Voltage Lord:",
            testimonials: []
        };
    }
};

// Helper function to save testimonials
const saveTestimonials = (data) => {
    try {
        fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving testimonials:', err);
        return false;
    }
};

// API Endpoints

// Get all testimonials
app.get('/api/testimonials', (req, res) => {
    const testimonials = getTestimonials();
    res.json(testimonials);
});

// Add new testimonial
app.post('/api/testimonials', (req, res) => {
    const { author, text } = req.body;
    
    if (!author || !text) {
        return res.status(400).json({ 
            success: false, 
            message: 'Both name and testimonial text are required' 
        });
    }

    const testimonialsData = getTestimonials();
    const newTestimonial = { text, author };
    
    // Add new testimonial
    testimonialsData.testimonials.push(newTestimonial);
    
    if (saveTestimonials(testimonialsData)) {
        res.json({ 
            success: true, 
            message: 'Testimonial added successfully',
            testimonial: newTestimonial
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save testimonial' 
        });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Testimonials file: ${TESTIMONIALS_FILE}`);
});
