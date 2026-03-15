const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Allow Expo dev clients on local network
app.use(cors());

// Multer setup for single file field "image"
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Animal identifier API is running' });
});

app.post('/identify', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided (field name: image).' });
  }

  // In a real implementation, you would run the image through your AI model here.
  // For now, return a static but realistic example response.
  const demoResponse = {
    name: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    description: 'A migratory butterfly known for its striking orange and black wings.',
    habitat: 'Fields, meadows, and gardens across North America.',
    dangerLevel: 'Harmless',
    confidence: 0.96,
  };

  console.log(`Received image: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

  return res.json(demoResponse);
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Animal identifier API listening on http://localhost:${port}`);
});

