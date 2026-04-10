import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Paper, Typography, Button, Grid } from "@mui/material";
import { ADNHandler, randomGenome } from "../genetic/ADNPlante";
import { Cell } from "./Cell";

// Classe pour gérer l'ADN cellulaire
class CellularGenome {
  constructor(genome = null) {
     const adn = randomGenome();
        this.adnHandler = new ADNHandler(adn);
    this.genome = genome || this.generateRandomGenome();
  }

  generateRandomGenome() {
    return {
      // Règles de division
      division: {
        energyThreshold: Math.random() * 80 + 20,  // 20-100
        maxNeighbors: Math.floor(Math.random() * 6) + 2, // 2-8
        divisionProbability: Math.random() * 0.2 + 0.1, // 0.1-0.3
        maxAge: Math.floor(Math.random() * 2000) + 500 // 50-250
      },
      
      // Règles de spécialisation
     specialization: {
  muscleThreshold: Math.random() * 0.8 + 0.2, // Plus difficile à atteindre
  adhesiveThreshold: Math.random() * 0.6 + 0.4, // Plus difficile
  deathThreshold: Math.random() * 0.05, // Moins de mort aléatoire
  specializationAge: Math.floor(Math.random() * 50) + 30 // Plus tardif (30-80)
},
      
      // Comportements spécialisés
      behavior: {
        muscleStrength: Math.random() * 2 + 0.5, // 0.5-2.5
        muscleFrequency: Math.random() * 3 + 1, // 1-4 Hz
        adhesiveStrength: Math.random() * 5 + 1, // 1-6
        energyConsumption: Math.random() * 2 + 0.5 // 0.5-2.5
      },
      
      // Métabolisme
      metabolism: {
        baseEnergyGain: Math.random() * 3 + 1, // 1-4 par tick
        efficiencyFactor: Math.random() * 0.5 + 0.5 // 0.5-1
      }
    };
  }

  mutate(mutationRate = 0.1) {
    const newGenome = JSON.parse(JSON.stringify(this.genome));
    
    const mutateValue = (value, range = 0.2) => {
      if (Math.random() < mutationRate) {
        const mutation = (Math.random() - 0.5) * range * value;
        return Math.max(0.01, value + mutation);
      }
      return value;
    };

    // Muter chaque catégorie
    Object.keys(newGenome).forEach(category => {
      Object.keys(newGenome[category]).forEach(trait => {
        newGenome[category][trait] = mutateValue(newGenome[category][trait]);
      });
    });

    return new CellularGenome(newGenome);
  }

  getGene(category, trait) {
    return this.genome[category][trait];
  }
}

// Classe représentant une cellule individuelle


// Composant principal
const CellularEvolutionSim = () => {
  const [cells, setCells] = useState([]);
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [stats, setStats] = useState({ stem: 0, muscle: 0, adhesive: 0, dead: 0 });
  const timeRef = useRef(0);

  // Initialisation
  const initialize = useCallback(() => {
    const initialGenome = new CellularGenome();
    const initialCell = new Cell(400, 200, initialGenome, 1);
    setCells([initialCell]);
    setGeneration(0);
    timeRef.current = 0;
  }, []);

  // Simulation tick
  useEffect(() => {
    if (!isRunning) return;
    let frame;
    const setInterval =() => {
      timeRef.current++;
      
      setCells(prevCells => {
        const newCells = [];
        const cellsToProcess = [...prevCells];
        
        cellsToProcess.forEach(cell => {
          const updateResult = cell.update(cellsToProcess, timeRef.current);
          
          // Division
          if (updateResult.shouldDivide) {
            const newCell = cell.divide(cellsToProcess);
            if (newCell) {
              newCells.push(newCell);
            }
          }
          
          // Survie
          if (true||!updateResult.shouldDie) {
            newCells.push(cell);
          }
        });

        // Limiter la population
        const maxCells = 150;
        if (newCells.length > maxCells) {
          // Garder les cellules les plus jeunes et énergiques
          return newCells
            .sort((a, b) => (b.energy - a.energy) + (a.age - b.age) * 0.1)
            .slice(0, maxCells);
        }

        return newCells;
      });
      frame = requestAnimationFrame(setInterval);
    }
    

    frame = requestAnimationFrame(setInterval);
    return () => cancelAnimationFrame(frame);
  }, [isRunning]);

  // Calcul des statistiques
  useEffect(() => {
    const newStats = cells.reduce((acc, cell) => {
      acc[cell.type] = (acc[cell.type] || 0) + 1;
      return acc;
    }, { stem: 0, muscle: 0, adhesive: 0, dead: 0 });
    setStats(newStats);
  }, [cells]);

  return (
   <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      {/* Header */}
      <Paper sx={{ mb: 6, p: 4, borderRadius: 2, bgcolor: "grey.100" }}>
        <Typography variant="h5" fontWeight="bold" mb={4}>
          Évolution Cellulaire - Développement Multicellulaire
        </Typography>

        {/* Boutons */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsRunning(!isRunning)}
            sx={{ px: 3, py: 1 }}
          >
            {isRunning ? "Pause" : "Démarrer"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={initialize}
            sx={{ px: 3, py: 1 }}
          >
            Nouvelle Colonie
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ fontSize: "0.9rem" }}>
          <Grid item xs={6} md={2}>
            <strong>Cellules:</strong> {cells.length}
          </Grid>
          <Grid item xs={6} md={2}>
            <strong>🌱 Souches:</strong> {stats.stem}
          </Grid>
          <Grid item xs={6} md={2}>
            <strong>💪 Muscles:</strong> {stats.muscle}
          </Grid>
          <Grid item xs={6} md={2}>
            <strong>🔗 Adhésives:</strong> {stats.adhesive}
          </Grid>
          <Grid item xs={6} md={2}>
            <strong>Temps:</strong> {timeRef.current}
          </Grid>
          <Grid item xs={6} md={2}>
            <strong>Génération:</strong> {generation}
          </Grid>
        </Grid>
      </Paper>

      {/* Zone de rendu SVG */}
      <Paper sx={{ border: "1px solid", borderColor: "grey.300", borderRadius: 2, overflow: "hidden" }}>
        <svg width="800" height="400">
          <defs>
            <pattern id="cellGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e0e0e0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cellGrid)" />

          {/* Rendu des cellules */}
          {cells.map((cell) => cell.render())}
        </svg>
      </Paper>

      {/* Légende */}
      <Grid container spacing={4} sx={{ mt: 4, fontSize: "0.9rem", color: "grey.700" }}>
        <Grid item xs={12} md={6}>
          <Typography>
            <strong>🌱 Cellules Souches (Vert):</strong> Se divisent et se spécialisent
          </Typography>
          <Typography>
            <strong>💪 Cellules Musculaires (Rouge):</strong> Se contractent et poussent les voisines
          </Typography>
          <Typography>
            <strong>🔗 Cellules Adhésives (Bleu):</strong> Maintiennent la cohésion
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography><strong>Mécanismes:</strong></Typography>
          <Typography>• Division basée sur énergie, espace et âge</Typography>
          <Typography>• Spécialisation selon le contexte local</Typography>
          <Typography>• Même ADN, expression différentielle</Typography>
          <Typography>• Comportements émergents multicellulaires</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CellularEvolutionSim;