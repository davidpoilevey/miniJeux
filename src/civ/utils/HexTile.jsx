// components/HexTile.jsx
import { RegularPolygon, Image as KonvaImage, Text, Circle } from 'react-konva';
import { hexToPixel } from './hexUtils';

export const HexTile = ({
  tile,
  images,
  onClick,
  isAssigned,
  showCitoyen = false,
  positionOverride = null,
  size = 60,
}) => {
  const { x, y } = positionOverride || hexToPixel(tile, size);
  const terrainImage = images[tile.type];
  const featureImage = tile.feature ? images[tile.feature] : null;

  return (
    <>
      {terrainImage && (
        <KonvaImage
          image={terrainImage}
          x={x - size}
          y={y - size}
          width={size * 2}
          height={size * 2}
          onClick={onClick}
        />
      )}
      {featureImage && (
        <KonvaImage
          image={featureImage}
          x={x - 12}
          y={y - 12}
          width={24}
          height={24}
        />
      )}
      {isAssigned && (
        <Circle x={x-20} y={y-10} radius={8} fill="gold" stroke="black" strokeWidth={1} />
      )}
      {showCitoyen && (
        <Text x={x - 20} y={y - 10} text="👷" fontSize={36} />
      )}
    </>
  );
};
