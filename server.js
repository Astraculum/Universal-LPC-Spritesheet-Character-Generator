import express from 'express';
import cors from 'cors';
import CharacterGenerator from './sources/api.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Create a single instance of the generator
const generator = new CharacterGenerator();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get available options endpoint
app.get('/api/options', async (req, res) => {
  try {
    const options = await generator.getAvailableOptions();
    res.json(options);
  } catch (error) {
    console.error('Error getting options:', error);
    res.status(500).json({
      error: 'Failed to get available options',
      details: error.message
    });
  }
});

// Generate character endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const config = req.body;
    
    // Validate required fields
    if (!config.bodyType) {
      return res.status(400).json({ error: 'bodyType is required' });
    }
    
    // Validate equipment paths
    // if (config.equipment) {
    //   for (const [type, variantInfo] of Object.entries(config.equipment)) {
    //     // Handle both string variants and nested variant objects
    //     const variant = typeof variantInfo === 'string' ? variantInfo : variantInfo.variant;
    //     const subvariant = typeof variantInfo === 'object' ? variantInfo.subvariant : null;
        
    //     // Build possible paths based on the variant structure
    //     const possiblePaths = [
    //       join(__dirname, 'spritesheets', type, variant, 'adult'),
    //       join(__dirname, 'spritesheets', type, variant, 'universal')
    //     ];
        
    //     if (subvariant) {
    //       possiblePaths.unshift(
    //         join(__dirname, 'spritesheets', type, variant, subvariant, 'adult'),
    //         join(__dirname, 'spritesheets', type, variant, subvariant, 'universal')
    //       );
    //     }
        
    //     // Check if at least one valid path exists
    //     let validPathFound = false;
    //     for (const path of possiblePaths) {
    //       try {
    //         await fs.access(path);
    //         validPathFound = true;
    //         break;
    //       } catch (error) {
    //         continue;
    //       }
    //     }
        
    //     if (!validPathFound) {
    //       return res.status(400).json({
    //         error: `Invalid equipment path: ${type}/${variant}${subvariant ? '/' + subvariant : ''}`,
    //         details: 'No valid equipment path found'
    //       });
    //     }
    //   }
    // }
    
    // Generate the character
    const result = await generator.generateCharacter(config);
    res.json(result);
  } catch (error) {
    console.error('Error generating character:', error);
    res.status(500).json({ 
      error: 'Failed to generate character',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/options');
  console.log('  POST /api/generate');
}); 