/**
 * WorldRenderer — rendu Konva du biome actif
 *
 * Entités NPC   : emoji species à grande taille (Konva Text)
 * Entités joueur : SVG composé en fonction des gènes (Konva Image, rechargé si gènes changent)
 * FoodSources   : cercles verts dont opacité et rayon reflètent l'énergie
 */

import { useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Circle, Rect } from 'react-konva';
import { BIOMES }  from '../data/biomes';
import { SPECIES } from '../data/species';
import { WORLD_W, WORLD_H } from '../ecs/Engine';
import { buildPlayerSpecies } from './buildPlayerSpecies';

// ── Taille du sprite joueur ────────────────────────────────────────────────────
// Le viewBox SVG est 80×70 → rendu à 0.6× = 48×42 px
const PLAYER_W  = 48;
const PLAYER_H  = 42;

// ── Taille des emoji NPC ────────────────────────────────────────────────────────
// Adapté par rôle pour donner une hiérarchie visuelle immédiate
const EMOJI_SIZE = {
  apex:      26,
  predator:  22,
  omnivore:  20,
  herbivore: 18,
};

// ── Couleurs ──────────────────────────────────────────────────────────────────
const FOOD_FILL   = '#44cc44';
const FOOD_STROKE = '#226622';

// ── Fond biome ────────────────────────────────────────────────────────────────
const TILE = 50; // px

/** Éclaircit un hex #rrggbb par `amt` (0–255). */
function lighten(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const h = v => Math.min(255, v + amt).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// ── Hook : charge le SVG joueur comme Image HTML ──────────────────────────────

function usePlayerImage(playerGenes) {
  const [img, setImg] = useState(null);

  // Ne recalcule que si les gènes changent réellement
  const src = useMemo(
    () => buildPlayerSpecies(playerGenes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify([...(playerGenes ?? [])].sort())],
  );

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setImg(image);
    image.src    = src;
    return () => { image.onload = null; };
  }, [src]);

  return img;
}

// ── Composant ─────────────────────────────────────────────────────────────────

const WorldRenderer = ({
  entities    = [],
  biomeId,
  playerGenes = [],
  width       = WORLD_W,
  height      = WORLD_H,
}) => {
  const playerImg = usePlayerImage(playerGenes);
  const bgColor   = BIOMES[biomeId]?.color ?? '#111122';
  const bgAlt     = useMemo(() => lighten(bgColor, 10), [bgColor]);

  const bgTiles = useMemo(() => {
    const tiles = [];
    const cols = Math.ceil(width  / TILE);
    const rows = Math.ceil(height / TILE);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({ x: c * TILE, y: r * TILE, alt: (r + c) % 2 === 1 });
      }
    }
    return tiles;
  }, [bgColor, width, height]); // eslint-disable-line react-hooks/exhaustive-deps

  const creatures   = entities.filter(e => !e.isFood);
  const foodSources = entities.filter(e => e.isFood);

  return (
    <Stage width={width} height={height}>

      {/* ── Fond biome — damier deux teintes ── */}
      <Layer>
        {bgTiles.map(t => (
          <Rect
            key={`bg-${t.x}-${t.y}`}
            x={t.x} y={t.y}
            width={TILE} height={TILE}
            fill={t.alt ? bgAlt : bgColor}
          />
        ))}
      </Layer>

      {/* ── FoodSources ── */}
      <Layer>
        {foodSources.map(e => {
          const ratio = e.foodEnergy / e.foodMaxEnergy;
          return (
            <Circle
              key={`food-${e.id}`}
              x={e.pos.x}
              y={e.pos.y}
              radius={8 + ratio * 14}
              fill={FOOD_FILL}
              stroke={FOOD_STROKE}
              strokeWidth={1}
              opacity={0.25 + ratio * 0.55}
            />
          );
        })}
      </Layer>

      {/* ── Créatures ── */}
      <Layer>
        {creatures.map(e => {
          const { pos, species } = e;

          if (species.isPlayer) {
            // Fallback : cercle cyan tant que l'image n'est pas chargée
            if (!playerImg) {
              return (
                <Circle
                  key={e.id}
                  x={pos.x} y={pos.y}
                  radius={10}
                  fill="#00ffaa"
                  stroke="#00cc88"
                  strokeWidth={1.5}
                />
              );
            }
            return (
              <KonvaImage
                key={e.id}
                image={playerImg}
                x={pos.x - PLAYER_W / 2}
                y={pos.y - PLAYER_H / 2}
                width={PLAYER_W}
                height={PLAYER_H}
              />
            );
          }

          // NPC : emoji centré
          const sp       = SPECIES[species.speciesId];
          const emoji    = sp?.emoji ?? '?';
          const fontSize = EMOJI_SIZE[species.role] ?? 18;
          const half     = fontSize / 2;

          return (
            <Text
              key={e.id}
              x={pos.x - half}
              y={pos.y - half}
              text={emoji}
              fontSize={fontSize}
            />
          );
        })}
      </Layer>

    </Stage>
  );
};

export default WorldRenderer;
