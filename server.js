const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/abb.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'abb.js'));
});
app.get('/api/reviews', (req, res) => {
  fs.readFile('test.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/reviews', (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'Name and text required' });

  fs.readFile('test.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading data' });
    
    const jsonData = JSON.parse(data);
    jsonData.testimonials.push({ text, author: name });

    fs.writeFile('test.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error saving data' });
      res.json({ success: true });
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
