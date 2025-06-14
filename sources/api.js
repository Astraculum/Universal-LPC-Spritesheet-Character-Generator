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
   * @param {string[]} config.animations - List of animations to include
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
          animations: config.animations,
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
    
    if (!config.animations || !Array.isArray(config.animations)) {
      throw new Error('Animations must be provided as an array');
    }
    
    for (const anim of config.animations) {
      if (!this.animations[anim]) {
        throw new Error(`Invalid animation: ${anim}`);
      }
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
      zPos: 10,
      animations: config.animations
    });
    
    // Add equipment layers
    if (config.equipment) {
      for (const [type, variant] of Object.entries(config.equipment)) {
        this.itemsToDraw.push({
          type,
          variant,
          bodyType: config.bodyType,
          zPos: this.getZPosition(type),
          animations: config.animations
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
    
    // Draw each animation
    for (const anim of this.itemsToDraw[0].animations) {
      const animData = this.animations[anim];
      const rowOffset = animData.row * this.universalFrameSize;
      
      for (let frame = 0; frame < animData.frames; frame++) {
        const x = frame * this.universalFrameSize;
        const y = rowOffset;
        
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
      const anim = item.animations[0]; // Use the first animation for now
      return join(basePath, 'body', 'bodies', item.bodyType, `${anim}.png`);
    }
    
    // Special case for hair
    if (item.type === 'hair') {
      const anim = item.animations[0]; // Use the first animation for now
      return join(basePath, 'hair', item.variant, bodyTypeDir, `${anim}.png`);
    }
    
    // Special case for eyes
    if (item.type === 'eyes') {
      const anim = item.animations[0]; // Use the first animation for now
      return join(basePath, 'eyes', item.variant, bodyTypeDir, `${anim}.png`);
    }
    
    // For other equipment types
    const anim = item.animations[0]; // Use the first animation for now
    return join(basePath, item.type, item.variant, bodyTypeDir, `${anim}.png`);
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
      
      // Get variants for each equipment type
      const variants = {};
      for (const type of equipmentTypes) {
        variants[type] = await this.getVariants(join(basePath, type));
      }
      
      // Filter out invalid variants
      const validVariants = {};
      for (const [type, typeVariants] of Object.entries(variants)) {
        validVariants[type] = typeVariants.filter(variant => {
          // Check if the variant directory exists and has the required animation files
          const variantPath = join(basePath, type, variant, 'adult');
          try {
            return fs.existsSync(variantPath);
          } catch (error) {
            console.warn(`Warning: Could not check variant ${type}/${variant}: ${error.message}`);
            return false;
          }
        });
      }
      
      return {
        bodyTypes: this.bodyTypes,
        animations: Object.keys(this.animations),
        equipment: {
          types: equipmentTypes,
          variants: validVariants
        }
      };
    } catch (error) {
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
      const entries = await fs.readdir(typePath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      throw new Error(`Failed to get variants for ${typePath}: ${error.message}`);
    }
  }
}

// Export the API
export default CharacterGenerator; 