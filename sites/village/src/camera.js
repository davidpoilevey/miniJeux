import { useEffect, useState } from 'react';
import { villageMap } from './map.js';

// Sur téléphone, la vue est plus étroite et plus haute : on voit moins de rues, mais tout est plus gros.
export const views = {
  large: { width: 680, height: 408 },
  small: { width: 380, height: 440 },
};
const narrow = window.matchMedia('(max-width: 42rem)');

export function useView() {
  const [small, setSmall] = useState(narrow.matches);
  useEffect(() => {
    const update = (event) => setSmall(event.matches);
    narrow.addEventListener('change', update);
    return () => narrow.removeEventListener('change', update);
  }, []);
  return small ? views.small : views.large;
}

// Coin haut-gauche de la vue, centré sur les pieds du personnage et borné à la carte.
export function cameraFor(player, view) {
  const clamp = (value, max) => Math.round(Math.max(0, Math.min(value, max)));
  return {
    x: clamp(player.x - view.width / 2, villageMap.width - view.width),
    y: clamp(player.y - view.height * 0.55, villageMap.height - view.height),
  };
}
