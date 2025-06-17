const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

class SpriteRenderer {
  constructor(options = {}) {
    this.frameSize = options.frameSize || 64;
    this.sheetWidth = options.sheetWidth || 832;
    this.sheetHeight = options.sheetHeight || 3456;
    this.basePath = options.basePath || 'spritesheets';
    
    // Create main canvas
    this.canvas = createCanvas(this.sheetWidth, this.sheetHeight);
    this.ctx = this.canvas.getContext('2d');
    
    // Animation definitions
    this.baseAnimations = {
      spellcast: 0,
      thrust: 4 * this.frameSize,
      walk: 8 * this.frameSize,
      slash: 12 * this.frameSize,
      shoot: 16 * this.frameSize,
      hurt: 20 * this.frameSize,
      climb: 21 * this.frameSize,
      idle: 22 * this.frameSize,
      jump: 26 * this.frameSize,
      sit: 30 * this.frameSize,
      emote: 34 * this.frameSize,
      run: 38 * this.frameSize,
      combat_idle: 42 * this.frameSize,
      backslash: 46 * this.frameSize,
      halfslash: 50 * this.frameSize
    };

    this.animationFrameCounts = {
      spellcast: 7,
      thrust: 8,
      walk: 9,
      slash: 6,
      shoot: 13,
      hurt: 6,
      climb: 6,
      idle: 2,
      jump: 5,
      sit: 3,
      emote: 3,
      run: 8,
      combat_idle: 2,
      backslash: 13,
      halfslash: 7
    };

    // Store loaded images
    this.images = new Map();
  }

  async loadImage(relativePath) {
    const fullPath = path.join(this.basePath, relativePath);
    
    if (this.images.has(fullPath)) {
      return this.images.get(fullPath);
    }
    
    try {
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Image file not found: ${fullPath}`);
      }

      const image = await loadImage(fullPath);
      this.images.set(fullPath, image);
      return image;
    } catch (error) {
      console.error(`Failed to load image: ${fullPath}`, error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  }

  async drawItems(items) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Sort items by z-index
    items.sort((a, b) => {
      const aZPos = a.layer_1?.zPos || 0;
      const bZPos = b.layer_1?.zPos || 0;
      return aZPos - bZPos;
    });

    // Draw each item
    for (const item of items) {
      const { supportedAnimations, layer_1, variant } = item;

      if (!supportedAnimations) {
        throw new Error(`Missing supportedAnimations for item`);
      }

      if (!layer_1) {
        throw new Error(`Missing layer_1 configuration for item`);
      }

      if (!variant) {
        throw new Error(`Missing variant for item`);
      }

      // Get the appropriate path based on gender (defaulting to male if not specified)
      const basePath = layer_1.male || layer_1.female || layer_1.teen;
      if (!basePath) {
        throw new Error(`No valid path found in layer_1 configuration`);
      }

      // Load and draw each animation
      for (const [animName, yOffset] of Object.entries(this.baseAnimations)) {
        if (supportedAnimations.includes(animName)) {
          // Construct the full path: basePath + animation name + variant + .png
          const animPath = `${basePath}/${animName}/${variant}.png`;

          try {
            const image = await this.loadImage(animPath);
            if (image) {
              this.ctx.drawImage(image, 0, yOffset);
            }
          } catch (error) {
            console.warn(`Failed to draw animation ${animName} for ${basePath}/${animName}/${variant}:`, error);
          }
        }
      }
    }

    return this.canvas;
  }

  async saveToFile(outputPath) {
    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(outputPath);
      const stream = this.canvas.createPNGStream();
      
      stream.pipe(out);
      
      out.on('finish', () => {
        console.log(`Successfully saved sprite sheet to: ${outputPath}`);
        resolve();
      });
      
      out.on('error', (error) => {
        console.error(`Error saving sprite sheet: ${error}`);
        reject(error);
      });
    });
  }
}

module.exports = SpriteRenderer; 
