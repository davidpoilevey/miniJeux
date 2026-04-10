// Stats humaines, 10..90 aléatoire par défaut
// overrides permet la transmission génétique future
export default function Stats(overrides = {}) {
  const rand = () => Math.floor(Math.random() * 80) + 10;
  return {
    force:        overrides.force        ?? rand(),
    intelligence: overrides.intelligence ?? rand(),
    charme:       overrides.charme       ?? rand(),
    perception:   overrides.perception   ?? rand(),
  };
}
