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
      "id": "body-Body_color_light",
      "parentName": "Body_color",
      "value": null,
      "matchBodyColor": "true",
      "supportedAnimations": [
        "shoot",
        "hurt",
      ],
      "layer_1": {
        "zPos": 10,
        "male": "body/bodies/zombie/",
        "female": "body/bodies/zombie/",
        "teen": "body/bodies/zombie/"
      },
      "variant": "zombie"
    },
    {
      "id": "dress_sleeves-Kimono_Sleeves_black",
      "parentName": "Kimono_Sleeves",
      "variant": "black",
      "value": null,
      "matchBodyColor": "false",
      "supportedAnimations": [
        "walk",
      ],
      "layer_1": {
        "zPos": 31,
        "female": "dress/kimono/sleeves/universal/female/",
        "teen": "dress/kimono/sleeves/universal/female/"
      },
      "layer_2": {
        "zPos": 145,
        "female": "dress/kimono/sleeves/universal/female_front/",
        "teen": "dress/kimono/sleeves/universal/female_front/"
      }
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
