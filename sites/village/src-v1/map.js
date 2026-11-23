export const villageMap = {
  width: 680,
  height: 408,
  spawn: { x: 135, y: 165, facing: 'right' },
  obstacles: [{ x: 242, y: 75, width: 297, height: 154 }],
  doors: {
    pivot: {
      anchor: { x: 423, y: 229 },
      hitArea: { x: -25, y: -56, width: 50, height: 62 },
      approach: { x: 423, y: 249, radius: 30 },
      resume: { x: 423, y: 258, facing: 'up' },
    },
  },
};
