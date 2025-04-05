require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const TESTIMONIALS_FILE = path.join(__dirname, 'test.json');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root
app.use('/api/', limiter);

// Initialize testimonials file if it doesn't exist
function initializeTestimonialsFile() {
  if (!fs.existsSync(TESTIMONIALS_FILE)) {
    const defaultData = {
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
    return JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading testimonials:', err);
    return null;
  }
}

// Write testimonials to file
function writeTestimonials(data) {
  try {
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving testimonials:', err);
    return false;
  }
}

// API Endpoints
app.get('/api/testimonials', (req, res) => {
  const data = readTestimonials();
  if (!data) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to load testimonials' 
    });
  }
  res.json(data);
});

app.post('/api/testimonials', (req, res) => {
  const { author, text } = req.body;
  
  // Basic validation
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
      message: 'Failed to load testimonials data' 
    });
  }

  // Add new testimonial
  const newTestimonial = {
    id: Date.now().toString(36),
    text: text.trim(),
    author: author.trim(),
    date: new Date().toISOString()
  };
  
  data.testimonials.unshift(newTestimonial);
  data.metadata.lastUpdated = new Date().toISOString();
  
  if (writeTestimonials(data)) {
    res.status(201).json({ 
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

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize and start server
initializeTestimonialsFile();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Testimonials data: ${TESTIMONIALS_FILE}`);
});
