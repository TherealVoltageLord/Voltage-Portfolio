const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = 'test.json';

app.use(express.json());
app.use(cors());

app.post('/add-review', (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).json({ error: 'Name and review text are required.' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading file' });

    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
      if (!Array.isArray(jsonData.testimonials)) {
        jsonData.testimonials = [];
      }
    } catch (error) {
      return res.status(500).json({ error: 'Invalid JSON structure' });
    }

    jsonData.testimonials.push({ author, text });

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error saving review' });

      res.json({ message: 'Review added successfully!', newReview: { author, text } });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
