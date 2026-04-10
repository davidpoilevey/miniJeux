import { Box } from "@mui/material";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';


export default function GodPlantLayer({ plants, tileSize }) {
  return (
    <>
      {plants.map((plant, index) => (
        <Box
          key={index}
          style={{
            position: "absolute",
            left: plant.x * tileSize + tileSize * 0.25,
            top: plant.y * tileSize + tileSize * 0.25,
            width: tileSize * 0.5,
            height: tileSize * 0.5,
            backgroundColor: "green",
            borderRadius: "50%",
            zIndex: 1,
          }}
        />
      ))}
    </>
  );
}

export function GodCorpseLayer({ corpses, tileSize }) {
  return (
    <>
      {corpses.map((corpse, index) => (
        <Box
          key={corpse.id || index}
          style={{
            position: "absolute",
            left: corpse.x * tileSize + tileSize * 0.2,
            top: corpse.y * tileSize + tileSize * 0.2,
            width: tileSize * 0.6,
            height: tileSize * 0.6,
background: "radial-gradient(circle, #8b6f5e 0%, #3b2d24 100%)",
boxShadow: "0 0 4px 1px rgba(0,0,0,0.4)",

            borderRadius: "50%",
            opacity: 0.6,
            zIndex: 0.5,
          }}
        />
      ))}
    </>
  );
}


export const PopulationChart = ({state, width=400, height=200}) => {
  const data = state.populationHistory;
  return (
     <div style={{ width: 500, height: 250 }}>
      <h4>Évolution population {state.creatures.length}/ plantes {state.plants.length}</h4>
      <LineChart width={500} height={250} data={data}>
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis dataKey="tick" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="population" stroke="#00bcd4" strokeWidth={2} dot={false} name="Population" />
        <Line type="monotone" dataKey="plantes" stroke="#8bc34a" strokeWidth={2} dot={false} name="Plantes" />
      </LineChart>
    </div>
  );
};

