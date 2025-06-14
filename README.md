# Universal LPC Spritesheet Character Generator API

This API provides a clean interface for generating LPC (Liberated Pixel Cup) style character spritesheets programmatically. It allows you to create custom character spritesheets by combining different body types, colors, and equipment.

## Installation

```bash
npm install universal-lpc-spritesheet-generator
```

## Usage

```javascript
import CharacterGenerator from 'universal-lpc-spritesheet-generator';

// Create a new generator instance
const generator = new CharacterGenerator();

// Generate a character spritesheet
const result = await generator.generateCharacter({
  bodyType: 'male', // One of: male, female, teen, child, muscular, pregnant
  bodyColor: 'light', // Body color variant
  animations: ['idle', 'walk', 'run'], // Animations to include
  equipment: {
    hair: 'short_brown',
    eyes: 'blue',
    armor: 'leather',
    weapon: 'sword',
    shield: 'wooden',
    helmet: 'leather_cap',
    boots: 'leather_boots'
  }
});

// result.imageData contains the PNG data URL
// result.metadata contains information about the generated spritesheet
```

## Configuration Options

### Body Types
- `male` - Standard male character
- `female` - Standard female character
- `teen` - Teenage character
- `child` - Child character
- `muscular` - Muscular character
- `pregnant` - Pregnant female character

### Body Colors
- `light`
- `amber`
- `olive`
- `taupe`
- `bronze`
- `brown`
- `black`
- `lavender`
- `blue`
- `zombie_green`
- `green`
- `pale_green`
- `bright_green`
- `dark_green`
- `fur_black`
- `fur_brown`
- `fur_tan`
- `fur_copper`
- `fur_gold`
- `fur_grey`
- `fur_white`

### Available Animations
- `spellcast` (7 frames)
- `thrust` (8 frames)
- `walk` (9 frames)
- `slash` (6 frames)
- `shoot` (13 frames)
- `hurt` (6 frames)
- `climb` (6 frames)
- `idle` (2 frames)
- `jump` (5 frames)
- `sit` (3 frames)
- `emote` (3 frames)
- `run` (8 frames)
- `combat_idle` (2 frames)
- `backslash` (13 frames)
- `halfslash` (7 frames)

### Equipment Types
- `hair` - Hair style
- `eyes` - Eye color/style
- `mouth` - Mouth style
- `beard` - Beard style (male only)
- `armor` - Body armor
- `weapon` - Weapon
- `shield` - Shield
- `helmet` - Head armor
- `boots` - Footwear

## Output Format

The `generateCharacter()` method returns a Promise that resolves to an object with the following structure:

```javascript
{
  imageData: string, // PNG data URL
  metadata: {
    width: number, // Width of the spritesheet
    height: number, // Height of the spritesheet
    frameSize: number, // Size of each frame (64x64)
    animations: string[], // List of included animations
    credits: Array<{ // Attribution information
      file: string,
      authors: string[],
      licenses: string[],
      urls: string[]
    }>
  }
}
```

## Browser Support

This API requires a modern browser with support for:
- ES6+ features
- Canvas API
- Promise API
- async/await

## License

This project is licensed under the terms of the LPC license. See the LICENSE file for details.

## Credits

This project uses assets from the Liberated Pixel Cup project. All assets are licensed under the LPC license. See the CREDITS file for detailed attribution information.
