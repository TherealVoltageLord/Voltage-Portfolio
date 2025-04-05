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
const DATA_DIR = path.join(__dirname, 'data');
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'test.json');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', limiter);

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize testimonials file
function initializeTestimonialsFile() {
  ensureDataDirectory();
  
  if (!fs.existsSync(TESTIMONIALS_FILE)) {
    const defaultData = {
      intro: "Here are some feedbacks📜 from people we worked together",
      testimonials: [],
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: null,
        version: '1.0.0'
      }
    };
    writeTestimonials(defaultData);
  }
}

// Read testimonials with backup
function readTestimonials() {
  try {
    const data = fs.readFileSync(TESTIMONIALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading testimonials:', err);
    return null;
  }
}

// Atomic write operation
function writeTestimonials(data) {
  try {
    const tempFile = TESTIMONIALS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, TESTIMONIALS_FILE);
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
      message: 'Failed to load testimonials',
      error: 'Server error'
    });
  }
  res.json(data);
});

app.post('/api/testimonials', (req, res) => {
  const { author, text } = req.body;
  
  // Input validation
  if (!author || !text) {
    return res.status(400).json({ 
      success: false, 
      message: 'Both name and testimonial text are required',
      fields: {
        author: !author ? 'Missing' : 'Valid',
        text: !text ? 'Missing' : 'Valid'
      }
    });
  }

  if (author.length > 100 || text.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: {
        author: author.length > 100 ? 'Max 100 characters' : null,
        text: text.length > 500 ? 'Max 500 characters' : null
      }
    });
  }

  const data = readTestimonials() || {
    intro: "Here are some feedbacks📜 from people we worked together",
    testimonials: [],
    metadata: {
      createdAt: new Date().toISOString(),
      lastUpdated: null,
      version: '1.0.0'
    }
  };

  const newTestimonial = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    text: text.trim(),
    author: author.trim(),
    date: new Date().toISOString(),
    ip: req.ip
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
      message: 'Failed to save testimonial',
      error: 'Server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize and start server
initializeTestimonialsFile();
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`Testimonials storage: ${TESTIMONIALS_FILE}`);
});
