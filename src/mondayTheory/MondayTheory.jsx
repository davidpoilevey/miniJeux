import { useEffect, useState } from "react";
import { cellToWorld, createNavigationGrid, createWorld, update } from "./ECS";
import { Box } from "@mui/material";
import { addAllEntities, addAllSystems, addAllWalls } from "./WorldDesc";
import { SpriteRegistry } from "./data";


import { SpeedMonday } from "./SpeedMonday";
import { EntityRenderer } from "./EntityManager";

const MondayTheory = () => {
  const [world] = useState(() => createWorld());
  const [, forceUpdate] = useState(0);


  useEffect(() => {
    world.entities={};
    world.systems=[];
    world.navigation = createNavigationGrid(25, 50);//25 cell width, 50 cell height

    addAllSystems(world);
    addAllEntities(world);
    addAllWalls(world);

    let last = performance.now();

    function loop(now) {
      const delta = now - last;
      last = now;

      update(world, delta);
      forceUpdate(v => v + 1);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }, []);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#eaeaea"
      }}
    >
      {/* HUD */}
      <SpeedMonday world={world} />

      {/* Viewport scrollable */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          position: "relative"
        }}
      >
        {/* World */}
        <Box
          sx={{
            width: 1000,
            height: 2000,
            position: "relative",
            border: '5px ridge black',

            bgcolor: "#f5f5f5"
          }}
        >
          {world.navigation.staticGrid.map((row, y) =>
            row.map((cell, x) => {
              if (cell !== 1) return null;
              const { x: wx, y: wy } = cellToWorld(world, x, y);
              return (
                <Box
                  key={`wall-${x}-${y}`}
                  sx={{
                    position: "absolute", left: wx,
                    top: wy,
                    width: world.navigation.cellSize,
                    height: world.navigation.cellSize,

                    bgcolor: "black"
                  }}
                />
              );
            })
          )}

          {Object.entries(world.entities).map(([id, entity]) => {
            return <EntityRenderer
  key={id}
  entity={entity}
  cellSize={world.cellSize}
/>

          })}
        </Box>
      </Box>
    </Box>
  );

}


export default MondayTheory;

