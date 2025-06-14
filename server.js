import express from 'express';
import cors from 'cors';
import CharacterGenerator from './sources/api.js';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create a single instance of the generator
const generator = new CharacterGenerator();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate character endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const config = req.body;
    const result = await generator.generateCharacter(config);
    res.json(result);
  } catch (error) {
    console.error('Error generating character:', error);
    res.status(500).json({ 
      error: 'Failed to generate character',
      message: error.message 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/generate');
}); 