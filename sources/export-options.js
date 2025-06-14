import CharacterGenerator from './api.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportOptions() {
  try {
    const generator = new CharacterGenerator();
    const outputPath = join(__dirname, '..', 'available-options.json');
    await generator.exportOptionsToJson(outputPath);
  } catch (error) {
    console.error('Error exporting options:', error);
    process.exit(1);
  }
}

exportOptions(); 