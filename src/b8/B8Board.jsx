import React, { useState, useEffect, useRef } from "react";

import { Cyanobacterie, BacterieHerbivore, Bacille, Virus, Amibe, Nutrimentivore, Saprophyte } from "./Taxonomy";
import { ADNHandler, randomGenome } from "../genetic/ADNPlante";
import { Box, Button, Typography } from "@mui/material";
import { buildSpatialHash, ECO_HEIGHT, ECO_WIDTH, Ecosysteme, simulationStep } from "./ecosysteme";
import { Environnement } from "./taxonomy/Environnement";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getCouleur } from "./taxonomy/Organisme";
const buildRandomCreature = (BacterieType) => {
  const adn = randomGenome();
  const adnHandler = new ADNHandler(adn);
  return new BacterieType(adnHandler, Math.random() * ECO_WIDTH, Math.random() * ECO_HEIGHT);
}
const B8Board = () => {
  const [population, setPopulation] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1); // 1 = normal, 0.5 = ralenti, 2 = accéléré


  const [score, setScore] = useState({ c: 0, n: 0, h: 0, b: 0, v: 0, a: 0, s: 0 })
  const populationHistory = useRef([]);
  const envRef = useRef(new Environnement(ECO_WIDTH, ECO_HEIGHT));

  const init = () => {

    const initPop = [];
    for (let i = 0; i < 200; i++) {
      initPop.push(buildRandomCreature(Cyanobacterie));
    }
    for (let i = 0; i < 50; i++) initPop.push(buildRandomCreature(BacterieHerbivore));
    for (let i = 0; i < 50; i++) initPop.push(buildRandomCreature(Saprophyte));
    for (let i = 0; i < 50; i++) initPop.push(buildRandomCreature(Nutrimentivore));
    for (let i = 0; i < 20; i++) initPop.push(buildRandomCreature(Bacille));
    for (let i = 0; i < 10; i++) initPop.push(buildRandomCreature(Virus));
    for (let i = 0; i < 5; i++) initPop.push(buildRandomCreature(Amibe));
    setPopulation(initPop);
    envRef.current.reset();
    populationHistory.current = [];
  }

  // Initialisation
  useEffect(() => {
    init();
  }, []);

  const reset = (noWinner) => {
    if (noWinner === 'noWinner')
      return init();
    // on compte les + nombreux, c'est eux qui gagnent
    const [spatialHash, popu] = buildSpatialHash(population, 10);
    let max = 0, maxpopu = 'Personne';
    for (let key in popu) {
      if (popu[key] > max) {
        maxpopu = key;
        max = popu[key];
      }
    }
    const sc = { ...score };
    switch (maxpopu) {
      case 'Cyanobacterie': sc.c++; break;
      case 'Nutrimentivore': sc.n++; break;
      case 'Saprophyte': sc.s++; break;
      case 'BacterieHerbivore': sc.h++; break;
      case 'Bacille': sc.b++; break;
      case 'Virus': sc.v++; break;
      case 'Amibe': sc.a++; break;
      default:
    }
    setScore(sc);
    savescore(sc);
    init();
  }
  // Boucle d’animation
  useEffect(() => {
    const sc = loadScore();
    if (sc != null) setScore(sc);

    let frame;
    let accumulator = 0;
    const loop = (time) => {
      if (!isPaused) {
        accumulator += speed;
        if (accumulator >= 1) {
          setPopulation(prev =>
            simulationStep(envRef.current, [...prev], populationHistory)
          );
          accumulator -= 1;
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [isPaused, speed]); //


  return <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', margin: 2, gap: 10 }}>

      <Typography variant="h6">Full Ecosysteme</Typography>


      <Button onClick={() => setIsPaused(prev => !prev)}>
        {isPaused ? "▶️ Play" : "⏸ Pause"}
      </Button>
      <Button onClick={() => { reset('noWinner') }} variant="contained" size="large">Reset No winner</Button>
      <div>
        <Button variant={speed < 0.1 ? 'contained' : 'filled'}
          onClick={() => setSpeed(0.01)}>🐌 x0.01</Button>
        <Button variant={speed == 0.25 ? 'contained' : 'filled'} onClick={() => setSpeed(0.25)}>🐢 x0.25</Button>
        <Button variant={speed == 1 ? 'contained' : 'filled'} onClick={() => setSpeed(1)}>⚡ Max</Button>
      </div>
      <Button onClick={reset} variant="contained" size="large">Donner la victoire</Button>

    </Box>
    <Box sx={{display:'flex', overflow:'auto'}}>
      
    <Ecosysteme population={population} environnement={envRef.current} />
    <Box sx={{ top: 20, right: 20 }}>
      <PopulationChart populationHistory={populationHistory.current} score={score} />
    </Box>
    </Box>
  </Box>
}
export default B8Board;



const SPECIES_INFO = [
  {
    name: "Cyanobactérie",
    color: getCouleur({ type: 'Cyanobacterie' }),
    description:
      "Bougent lentement, se nourrissent de lumière, se reproduisent rapidement. Peuvent lâcher des toxines et migrer vers les zones plus ensoleillées."
  },
  {
    name: "Nutrivore",
    color: getCouleur({ type: 'Nutrimentivore' }),
    description:
      "Lents (un peu plus rapides que les cyano), se nourrissent de nutriments (issus des cadavres). Reproduction rapide. Peuvent lâcher des toxines et migrer si manque de nutriments."
  },
  {
    name: "Saprophytes",
    color: getCouleur({ type: 'Saprophyte' }),
    description:
      "Plus lent et passif. Se nourrissent de nutriments, plus resistant que les Nutrivore, peuvent lacher des toxines de repulsion qui eloignent les autres especes"
  },
  {
    name: "Herbivore",
    color: getCouleur({ type: 'BacterieHerbivore' }),
    description:
      "Rapides et prolifiques, mangent exclusivement les cyanobactéries."
  },
  {
    name: "Bacille",
    color: getCouleur({ type: 'Bacille' }),
    description:
      "Rapides, vision longue portée, vivent longtemps mais se reproduisent moins vite. Mangent herbivores et nutrivores."
  },
  {
    name: "Virus",
    color: getCouleur({ type: 'Virus' }),
    description:
      "Très rapides, reproduction fulgurante mais durée de vie très courte. Peuvent infecter et revenir subitement, très violents. Mangent bacilles, (et parfois Herbivore et parfois Nutrivore et parfois meme cannibales)"
  },
  {
    name: "Amibe",
    color: "black",
    description:
      "Très lentes mais puissantes.Mangent de tout Attaque de près (embuscade). Se reproduisent lentement mais vivent longtemps."
  }
];
export const PopulationChart = ({ populationHistory, score = { c: 0, n: 0, h: 0, b: 0, v: 0, a: 0 } }) => {

  const data = populationHistory;

  return data.length < 10 ? null : (
    <div style={{ width: 500, height: 450 }}>
      <h4>Évolution population </h4>
      <LineChart width={500} height={450} data={data}>
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis dataKey="tick" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cyano" stroke={getCouleur({ type: 'Cyanobacterie' })} connectNulls
          strokeWidth={2} dot={false} name={"Cyanobacterie " + score.c} />
        <Line type="monotone" dataKey="nutri" stroke={getCouleur({ type: 'Nutrimentivore' })}
          strokeWidth={2} connectNulls dot={false} name={"Nutrimentvore " + score.n} />
        <Line type="monotone" dataKey="sapro" stroke={getCouleur({ type: 'Saprophyte' })}
          strokeWidth={2} connectNulls dot={false} name={"Saprophyte " + score.n} />
        <Line type="monotone" dataKey="herbivore" stroke={getCouleur({ type: 'BacterieHerbivore' })}
          strokeWidth={2} dot={false} name={"Herbivore " + score.h} />
        <Line type="monotone" dataKey="bacille" stroke={getCouleur({ type: 'Bacille' })}
          strokeWidth={2} dot={false} name={"Bacille " + score.b} />
        <Line type="monotone" dataKey="virus" stroke={getCouleur({ type: 'Virus' })}
          strokeWidth={2} dot={false} name={"Virus " + score.v} />
        <Line type="monotone" dataKey="amibe" stroke={getCouleur({ type: 'Amibe' })}
          strokeWidth={2} dot={false} name={"Amibe " + score.a} />
      </LineChart>
      <div
        style={{
          height: "200px", // réduit pour forcer le scroll
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          background: "#fdfdfd",
          overflowY: "auto"
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "8px",
            textAlign: "center"
          }}
        >
          Espèces & comportements
        </div>
        {SPECIES_INFO.map((s) => (
          <div
            key={s.name}
            style={{
              marginBottom: "12px",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: s.color,
                  border: "1px solid black",
                  marginRight: "6px"
                }}
              />
              <span style={{ fontWeight: "bold", fontSize: "13px" }}>{s.name}</span>
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.2em", marginLeft: "18px" }}>
              {s.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



function savescore(world) {
  const data = JSON.stringify(world);
  localStorage.setItem("Bacterie8", data);
}
function loadScore() {
  const data = localStorage.getItem("Bacterie8");
  if (!data) {
    console.warn("Aucune sauvegarde trouvée.");
    return null;
  }
  const world = JSON.parse(data);
  return world;
}
