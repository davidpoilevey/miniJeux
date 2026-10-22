// Coordinates are in cells; y grows downwards. Rectangles use [x, y, width, height].
// '.' is air, '#' is diggable earth and 'X' is indestructible rock.
export const LEVELS = [{
  id: 'juste-la',
  title: 'La sortie est pourtant juste là',
  hint: 'Creuse la plateforme pour descendre, puis construis un escalier avant le ravin. Un bloqueur peut retenir les impatients.',
  width: 64,
  height: 36,
  terrain: [
    { rect: [0, 5, 2, 8], material: 'X' },
    { rect: [2, 10, 23, 3], material: '#' },
    { rect: [25, 5, 2, 8], material: 'X' },
    { rect: [0, 24, 31, 12], material: 'X' },
    { rect: [38, 24, 26, 12], material: 'X' },
  ],
  spawn: { x: 6, y: 3, direction: 1 },
  exit: { x: 55, y: 21, width: 3, height: 3 },
  total: 10,
  required: 8,
  releaseEvery: 24,
  timeSeconds: 180,
  skills: { blocker: 2, digger: 3, builder: 5 },
}];
