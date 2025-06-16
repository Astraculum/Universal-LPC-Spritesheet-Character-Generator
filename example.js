const SpriteRenderer = require('./sources/spriteRenderer');
const path = require('path');

async function main() {
  // Create renderer instance
  const renderer = new SpriteRenderer({
    frameSize: 64,
    sheetWidth: 832,
    sheetHeight: 3456,
    basePath: path.join(__dirname, 'spritesheets')
  });

  // Example items to draw
  const items = [
    {
      fileName: 'body/bodies/male/idle/brown.png',
      zPos: 0,
    },
    {
      fileName: 'head/heads/human/male/idle/brown.png',
      zPos: 10,
    }
  ];

  try {
    // Draw items
    await renderer.drawItems(items);
    
    // Save to file
    const outputPath = path.join(__dirname, 'output.png');
    await renderer.saveToFile(outputPath);
    console.log(`Sprite sheet saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 
