/**
 * Universal LPC Spritesheet Character Generator API
 * This module provides a clean interface for generating character spritesheets
 */

import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CharacterGenerator {
  constructor() {
    this.canvas = createCanvas(832, 3456);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.images = {};
    this.itemsToDraw = [];
    this.itemsMeta = {};
    this.sheetCredits = [];
    
    // Constants
    this.universalFrameSize = 64;
    this.universalSheetWidth = 832;
    this.universalSheetHeight = 3456;
    
    // Available body types
    this.bodyTypes = ['male', 'female', 'teen', 'child', 'muscular', 'pregnant'];
    
    // Available animations
    this.animations = {
      spellcast: { frames: 7, row: 0 },
      thrust: { frames: 8, row: 4 },
      walk: { frames: 9, row: 8 },
      slash: { frames: 6, row: 12 },
      shoot: { frames: 13, row: 16 },
      hurt: { frames: 6, row: 20 },
      climb: { frames: 6, row: 21 },
      idle: { frames: 2, row: 22 },
      jump: { frames: 5, row: 26 },
      sit: { frames: 3, row: 30 },
      emote: { frames: 3, row: 34 },
      run: { frames: 8, row: 38 },
      combat_idle: { frames: 2, row: 42 },
      backslash: { frames: 13, row: 46 },
      halfslash: { frames: 7, row: 50 }
    };

    // Map body types to their corresponding directories
    this.bodyTypeMap = {
      male: 'adult',
      female: 'adult',
      teen: 'teen',
      child: 'child',
      muscular: 'adult',
      pregnant: 'adult'
    };
  }

  /**
   * Generate a character spritesheet based on the provided configuration
   * @param {Object} config - Character configuration object
   * @param {string} config.bodyType - Body type (male, female, teen, child, muscular, pregnant)
   * @param {string} config.bodyColor - Body color variant
   * @param {Object} config.equipment - Equipment configuration
   * @returns {Promise<Object>} - Generated spritesheet data and metadata
   */
  async generateCharacter(config) {
    try {
      // Validate configuration
      this.validateConfig(config);
      
      // Reset state
      this.itemsToDraw = [];
      this.itemsMeta = {};
      this.sheetCredits = [];
      
      // Set up canvas
      this.canvas.width = this.universalSheetWidth;
      this.canvas.height = this.universalSheetHeight;
      
      // Prepare drawing data
      await this.prepareDrawingData(config);
      
      // Draw the spritesheet
      await this.drawSpritesheet();
      
      // Return the result
      return {
        imageData: this.canvas.toDataURL('image/png'),
        metadata: {
          width: this.canvas.width,
          height: this.canvas.height,
          frameSize: this.universalFrameSize,
          credits: this.sheetCredits
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate character: ${error.message}`);
    }
  }

  /**
   * Validate the provided configuration
   * @private
   */
  validateConfig(config) {
    if (!config.bodyType || !this.bodyTypes.includes(config.bodyType)) {
      throw new Error(`Invalid body type. Must be one of: ${this.bodyTypes.join(', ')}`);
    }
  }

  /**
   * Prepare the drawing data based on configuration
   * @private
   */
  async prepareDrawingData(config) {
    // Add body layer
    this.itemsToDraw.push({
      type: 'body',
      variant: config.bodyColor,
      bodyType: config.bodyType,
      zPos: 10
    });
    
    // Add equipment layers
    if (config.equipment) {
      for (const [type, variantInfo] of Object.entries(config.equipment)) {
        // Handle both string variants and nested variant objects
        const variant = typeof variantInfo === 'string' ? variantInfo : variantInfo.variant;
        const subvariant = typeof variantInfo === 'object' ? variantInfo.subvariant : null;
        
        this.itemsToDraw.push({
          type,
          variant,
          subvariant,
          bodyType: config.bodyType,
          zPos: this.getZPosition(type)
        });
      }
    }
    
    // Load all required images
    await this.loadImages();
  }

  /**
   * Load all required images for the spritesheet
   * @private
   */
  async loadImages() {
    const imagePromises = this.itemsToDraw.map(async item => {
      try {
        const imagePath = this.getImagePath(item);
        console.log(`Loading image from: ${imagePath}`); // Debug log
        const img = await loadImage(imagePath);
        this.images[item.type] = img;
      } catch (error) {
        throw new Error(`Failed to load image for ${item.type}: ${error.message}`);
      }
    });
    
    await Promise.all(imagePromises);
  }

  /**
   * Draw the complete spritesheet
   * @private
   */
  async drawSpritesheet() {
    // Sort items by z-position
    this.itemsToDraw.sort((a, b) => a.zPos - b.zPos);
    
    // Draw each frame
    for (let frame = 0; frame < 8; frame++) {
      const x = frame * this.universalFrameSize;
      const y = 0;
      
      // Draw each layer
      for (const item of this.itemsToDraw) {
        const img = this.images[item.type];
        if (img) {
          this.ctx.drawImage(
            img,
            x, y, this.universalFrameSize, this.universalFrameSize,
            x, y, this.universalFrameSize, this.universalFrameSize
          );
        }
      }
    }
  }

  /**
   * Get the z-position for a layer type
   * @private
   */
  getZPosition(type) {
    const zPositions = {
      body: 10,
      hair: 20,
      eyes: 30,
      mouth: 40,
      beard: 50,
      armor: 60,
      weapon: 70,
      shield: 80,
      helmet: 90,
      boots: 100
    };
    
    return zPositions[type] || 0;
  }

  /**
   * Get the image path for an item
   * @private
   */
  getImagePath(item) {
    const basePath = join(__dirname, '..', 'spritesheets');
    const bodyTypeDir = this.bodyTypeMap[item.bodyType] || 'adult';
    
    // Special case for body
    if (item.type === 'body') {
        return join(basePath, 'body', 'bodies', item.bodyType, 'idle.png');
    }
    
    // Handle equipment with nested variants
    if (item.subvariant) {
        const possiblePaths = [
            // Standard path with subvariant
            join(basePath, item.type, item.variant, item.subvariant, bodyTypeDir, 'idle.png'),
            // Universal path with subvariant
            join(basePath, item.type, item.variant, item.subvariant, 'universal', 'idle.png'),
            // Background path with subvariant
            join(basePath, item.type, item.variant, item.subvariant, 'background', 'idle.png'),
            // Foreground path with subvariant
            join(basePath, item.type, item.variant, item.subvariant, 'foreground', 'idle.png'),
            // Simple path with subvariant
            join(basePath, item.type, item.variant, item.subvariant, 'idle.png'),
            // Fallback to variant-only path
            join(basePath, item.type, item.variant, bodyTypeDir, 'idle.png')
        ];
        
        // Return the first path that exists
        for (const path of possiblePaths) {
            try {
                if (fs.existsSync(path)) {
                    return path;
                }
            } catch (error) {
                console.warn(`Could not check path ${path}: ${error.message}`);
            }
        }
        
        return possiblePaths[0];
    }
    
    // For simple equipment types (no subvariants)
    const possiblePaths = [
        // Standard path
        join(basePath, item.type, item.variant, bodyTypeDir, 'idle.png'),
        // Universal path
        join(basePath, item.type, item.variant, 'universal', 'idle.png'),
        // Background path
        join(basePath, item.type, item.variant, 'background', 'idle.png'),
        // Foreground path
        join(basePath, item.type, item.variant, 'foreground', 'idle.png'),
        // Simple path
        join(basePath, item.type, item.variant, 'idle.png')
    ];
    
    // Return the first path that exists
    for (const path of possiblePaths) {
        try {
            if (fs.existsSync(path)) {
                return path;
            }
        } catch (error) {
            console.warn(`Could not check path ${path}: ${error.message}`);
        }
    }
    
    return possiblePaths[0];
}

  /**
   * Get all available options for character generation
   * @returns {Promise<Object>} Object containing all available options
   */
  async getAvailableOptions() {
    const basePath = join(__dirname, '..', 'spritesheets');
    
    try {
      // Get all equipment types (directories in spritesheets)
      const equipmentTypes = await this.getEquipmentTypes(basePath);
      console.log('Found equipment types:', equipmentTypes);
      
      // Get variants for each equipment type
      const variants = {};
      for (const type of equipmentTypes) {
        const typePath = join(basePath, type);
        variants[type] = await this.getVariants(typePath);
        console.log(`Variants for ${type}:`, variants[type]);
      }
      
      return {
        bodyTypes: this.bodyTypes,
        equipment: {
          types: equipmentTypes,
          variants: variants
        }
      };
    } catch (error) {
      console.error('Error in getAvailableOptions:', error);
      throw new Error(`Failed to get available options: ${error.message}`);
    }
  }

  /**
   * Get all equipment types from spritesheets directory
   * @private
   */
  async getEquipmentTypes(basePath) {
    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory() && entry.name !== 'body') // Exclude body directory
        .map(entry => entry.name);
    } catch (error) {
      throw new Error(`Failed to get equipment types: ${error.message}`);
    }
  }

  /**
   * Get all variants for a specific equipment type
   * @private
   */
  async getVariants(typePath) {
    try {
      // First check if the directory exists
      try {
        await fs.access(typePath);
      } catch (error) {
        console.warn(`Directory not found: ${typePath}`);
        return [];
      }

      const entries = await fs.readdir(typePath, { withFileTypes: true });
      const variants = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      // For each variant, recursively check subdirectories
      const validVariants = {};
      for (const variant of variants) {
        const variantPath = join(typePath, variant);
        try {
          const variantEntries = await fs.readdir(variantPath, { withFileTypes: true });
          
          // Check if it has any subdirectories
          const subdirectories = variantEntries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
          
          if (subdirectories.length > 0) {
            // Recursively get subvariants
            validVariants[variant] = await this.getVariants(variantPath);
          } else {
            // If no subdirectories, just add the variant name
            validVariants[variant] = [];
          }
        } catch (error) {
          console.warn(`Could not read variant directory ${variantPath}: ${error.message}`);
        }
      }

      console.log(`Found variants for ${typePath}:`, validVariants);
      return validVariants;
    } catch (error) {
      console.error(`Error getting variants for ${typePath}: ${error.message}`);
      return {};
    }
  }

  /**
   * Export all available options to a JSON file
   * @param {string} outputPath - Path where the JSON file should be saved
   * @returns {Promise<void>}
   */
  async exportOptionsToJson(outputPath) {
    try {
      const options = await this.getAvailableOptions();
      const jsonContent = JSON.stringify(options, null, 2);
      await fs.writeFile(outputPath, jsonContent, 'utf8');
      console.log(`Options exported successfully to ${outputPath}`);
    } catch (error) {
      throw new Error(`Failed to export options to JSON: ${error.message}`);
    }
  }
}

// Export the API
export default CharacterGenerator; 