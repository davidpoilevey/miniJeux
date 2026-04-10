import React, { useState } from "react";
import { Group, Line, RegularPolygon, Text } from "react-konva";

const colorMap = {
  red: "#ee54ba",
  blue: "#3498db",
  green: "#27ae60",
  yellow: "#f1c40f",
  purple: "#db8cfa",
  black: "#2c3e50",
};

const symbolMap = {
  sun: "☀️",
  moon: "🌙",
  flower: "❀",
  wave: "≈",
  mountain: "▲",
  star: "★",
};


const KamonTile = ({
  hex,
  size,
  onClick,
  isCurrent = false,
  isAvailable = false,
  belongTo = null, // "user" | "ia" | null
}) => {
  const { color, symbol, joker, x, y } = hex;
  const [isHover, setIsHover] = useState(false);

  // Couleur de base
  const baseColor = joker ? "#ffffff" : colorMap[color] || "#ccc";

  // Couleur finale du fond
  const fill =  isAvailable
    ? baseColor + "89"
    : baseColor;

  // Bordure et effet
  const stroke =
    isCurrent ? "#fd0c0cff" : isAvailable ? "#fff71bff" : "black";

  const strokeWidth = (isCurrent) ? 6 : (isHover|| isAvailable) ? 3 : 1.5;

  const shadowBlur = isHover ? 10 : isCurrent ? 6 : 0;
  const shadowColor = isCurrent ? "#ff8800" : "#000";

  const symbolText = joker ? "?" : symbolMap[symbol] || "?";

  // Couleur de la croix selon le propriétaire
  const crossColor = belongTo === "player" ? "#ffffffdd" : "#33aaffdd";
  const crossSize = size * 1.2;

  // Interaction désactivée si la tuile appartient à quelqu’un
  const canInteract = !belongTo && isAvailable;

  return (
    <Group
      x={x}
      y={y}
      onClick={() => (canInteract ? onClick?.(hex) : null)}
      onTap={() => (canInteract ? onClick?.(hex) : null)}
      onMouseEnter={() => (canInteract ? setIsHover(true) : null)}
      onMouseLeave={() => (canInteract ? setIsHover(false) : null)}
    >
      <RegularPolygon
        sides={6}
        radius={size * 0.9}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        shadowBlur={shadowBlur}
        shadowColor={shadowColor}
        shadowOpacity={0.5}
      />
      <Text
        text={symbolText}
        fontSize={size * 0.6}
        fontStyle="bold"
        fill={isCurrent ? "#000" : "#111"}
        align="center"
        verticalAlign="middle"
        offsetX={size * 0.3}
        offsetY={size * 0.3}
      />

      {/* Croix de verrouillage */}
      {belongTo && (
        <Group>
          <Line
            points={[
              -crossSize / 2, -crossSize / 2,
              crossSize / 2, crossSize / 2,
            ]}
            stroke={crossColor}
            strokeWidth={6}
            lineCap="round"
          />
          <Line
            points={[
              crossSize / 2, -crossSize / 2,
              -crossSize / 2, crossSize / 2,
            ]}
            stroke={crossColor}
            strokeWidth={6}
            lineCap="round"
          />
        </Group>
      )}
    </Group>
  );
};
export default KamonTile;