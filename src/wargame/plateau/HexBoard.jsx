import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, RegularPolygon, Group, Image } from 'react-konva';
import { axialToPixel, HEX_SIZE, hexDistance, getReachableTiles } from '../hooks/hexUtils';
import { useWG } from '../WarGameContext';
import { getHexagonPoints } from '../../civ/utils/hexUtils';

const SPRITE_SIZE = HEX_SIZE + 5;

const HexBoard = () => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const {
    phase,
    unitSelected, setSelectedUnit,
    userUnits, advUnits,
    attaque, moveUnit,
    setTileSelected,
    grid,
    explosionEffect,
    images,
  } = useWG();

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [reachableTiles, setReachableTiles] = useState([]);
  const [attackRangeTiles, setAttackRangeTiles] = useState([]);

  const handleClick = (hex) => {
    if (phase !== 'PLAYER_TURN') return;

    setTileSelected(hex);

    const foundUserUnit = userUnits.find(u => u.position.q === hex.q && u.position.r === hex.r);
    const foundAdvUnit = advUnits.find(u => u.position.q === hex.q && u.position.r === hex.r);

    // Clic sur unité alliée → sélectionner
    if (foundUserUnit) {
      setSelectedUnit(foundUserUnit);
      return;
    }

    // Clic sur case vide → déplacement si possible
    if (!foundAdvUnit) {
      if (unitSelected && !unitSelected.hasMoved) {
        if (reachableTiles.some(t => t.q === hex.q && t.r === hex.r)) {
          moveUnit(unitSelected, hex);
        } else {
          setSelectedUnit(null);
        }
      } else {
        setSelectedUnit(null);
      }
      return;
    }

    // Clic sur unité ennemie → attaque si possible
    if (foundAdvUnit && unitSelected && !unitSelected.hasAttacked) {
      const dist = hexDistance(unitSelected.position, foundAdvUnit.position);
      if (dist <= unitSelected.range) {
        attaque(unitSelected, foundAdvUnit);
      } else {
        setSelectedUnit(null);
      }
      return;
    }

    setSelectedUnit(null);
  };

  // Mesure du conteneur
  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    checkSize();
    const resizeObserver = new ResizeObserver(checkSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Cases accessibles au déplacement
  useEffect(() => {
    if (unitSelected && !unitSelected.hasMoved && grid) {
      setReachableTiles(getReachableTiles(unitSelected, grid));
    } else {
      setReachableTiles([]);
    }
  }, [unitSelected, grid]);

  // Cases à portée d'attaque depuis la position courante
  useEffect(() => {
    if (unitSelected && !unitSelected.hasAttacked && grid) {
      const tiles = Array.from(grid.values()).filter(t => {
        const d = hexDistance(t, unitSelected.position);
        return d > 0 && d <= unitSelected.range;
      });
      setAttackRangeTiles(tiles);
    } else {
      setAttackRangeTiles([]);
    }
  }, [unitSelected, grid]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(oldScale * (1 + direction * 0.01), 0.6), 2);

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const stageCenter = { x: stageSize.width / 2, y: stageSize.height / 2 };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}>
      <Stage ref={stageRef} width={stageSize.width} height={stageSize.height} draggable onWheel={handleWheel}>
        <Layer x={stageCenter.x} y={stageCenter.y}>

          {/* Tuiles de terrain */}
          {Array.from(grid.entries()).map(([key, hex]) => {
            const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
            return (
              <Group
                key={key}
                x={x}
                y={y}
                clipFunc={(ctx) => {
                  const points = getHexagonPoints(0, 0, HEX_SIZE);
                  ctx.beginPath();
                  ctx.moveTo(points[0].x, points[0].y);
                  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                  ctx.closePath();
                }}
              >
                <Image
                  x={-HEX_SIZE}
                  y={-HEX_SIZE}
                  width={HEX_SIZE * 2}
                  height={HEX_SIZE * 2}
                  image={images[hex.terrain]}
                  onClick={() => handleClick(hex)}
                  onMouseOver={e => { e.target.getStage().container().style.cursor = 'pointer'; }}
                  onMouseOut={e => { e.target.getStage().container().style.cursor = 'default'; }}
                />
                {reachableTiles.some(t => t.q === hex.q && t.r === hex.r) && (
                  <RegularPolygon
                    sides={6}
                    radius={HEX_SIZE * 0.9}
                    fill="rgba(0, 128, 255, 0.3)"
                    onClick={() => handleClick(hex)}
                  />
                )}
                {attackRangeTiles.some(t => t.q === hex.q && t.r === hex.r) && (
                  <RegularPolygon
                    sides={6}
                    radius={HEX_SIZE * 0.88}
                    fill="transparent"
                    stroke="rgba(255, 60, 60, 0.9)"
                    strokeWidth={2}
                    dash={[4, 3]}
                    onClick={() => handleClick(hex)}
                  />
                )}
              </Group>
            );
          })}

          {/* Unités joueur */}
          {userUnits.map((unit) => {
            const { x, y } = axialToPixel(unit.position.q, unit.position.r, HEX_SIZE);
            const exhausted = unit.hasMoved && unit.hasAttacked;
            const isSelected = unitSelected?.id === unit.id;
            const outlineColor = isSelected ? '#ff2222' : !exhausted ? '#44ff88' : null;

            return (
              <Group key={unit.id} x={x} y={y} onClick={() => handleClick(unit.position)}>
                {outlineColor && (
                  <RegularPolygon
                    sides={6}
                    radius={HEX_SIZE * 0.95}
                    fill="transparent"
                    stroke={outlineColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                )}
                <Image
                  x={-SPRITE_SIZE / 2}
                  y={-SPRITE_SIZE / 2}
                  width={SPRITE_SIZE}
                  height={SPRITE_SIZE}
                  image={images[unit.type]}
                  opacity={exhausted ? 0.4 : 1}
                />
              </Group>
            );
          })}

          {/* Unités ennemies */}
          {advUnits.map((unit) => {
            const { x, y } = axialToPixel(unit.position.q, unit.position.r, HEX_SIZE);

            // Forteresse : hexagone plein sombre + bordure rouge
            if (unit.isBase) {
              return (
                <Group key={unit.id} x={x} y={y} onClick={() => handleClick(unit.position)}>
                  <RegularPolygon
                    sides={6}
                    radius={HEX_SIZE * 0.85}
                    fill="rgba(60, 0, 0, 0.85)"
                    stroke="#cc0000"
                    strokeWidth={3}
                  />
                </Group>
              );
            }

            // Chef ennemi : sprite + contour doré
            if (unit.isChief) {
              return (
                <Group key={unit.id} x={x} y={y} onClick={() => handleClick(unit.position)}>
                  <RegularPolygon
                    sides={6}
                    radius={HEX_SIZE * 0.95}
                    fill="transparent"
                    stroke="gold"
                    strokeWidth={3}
                  />
                  <Image
                    x={-SPRITE_SIZE / 2}
                    y={-SPRITE_SIZE / 2}
                    width={SPRITE_SIZE}
                    height={SPRITE_SIZE}
                    image={images[unit.type]}
                  />
                </Group>
              );
            }

            return (
              <Image
                key={unit.id}
                x={x - SPRITE_SIZE / 2}
                y={y - SPRITE_SIZE / 2}
                width={SPRITE_SIZE}
                height={SPRITE_SIZE}
                image={images[unit.type]}
                onClick={() => handleClick(unit.position)}
              />
            );
          })}

          {/* Effet d'explosion (correction : conversion hex→pixel) */}
          {explosionEffect && (() => {
            const { x, y } = axialToPixel(explosionEffect.q, explosionEffect.r, HEX_SIZE);
            return (
              <Image
                x={x - SPRITE_SIZE / 2}
                y={y - SPRITE_SIZE / 2}
                width={SPRITE_SIZE}
                height={SPRITE_SIZE}
                image={images['explosion']}
              />
            );
          })()}

        </Layer>
      </Stage>
    </div>
  );
};

export default HexBoard;
