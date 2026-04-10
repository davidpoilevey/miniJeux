import { Box, Button, Paper, Typography } from "@mui/material";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ADNHandler, randomGenome } from "../genetic/ADNPlante";

// Classe pour gérer l'ADN plus structuré
class GenomeManager {
  constructor(genome = null) {
    const adn = randomGenome();
    this.adnHandler = new ADNHandler(adn);
    this.genome = genome || this.generateRandomGenome();
    this.readIndex = 0;
  }

  generateRandomGenome() {
    // Un génome plus structuré avec des gènes spécifiques
    return {
      morphology: {
        numSegments: this.adnHandler.readFloat('nbSegment'),
        baseRadius: this.adnHandler.readFloat('baseRadius'),
        flexibility: this.adnHandler.readFloat('flexibility'),
        asymmetry: this.adnHandler.readFloat('asymmetry'),
        nbPattes: this.adnHandler.readFloat('nbPattes'),
        tension: this.adnHandler.readFloat('tension')
      },
      locomotion: {
        contractionStrength: this.adnHandler.readFloat('contractionStrength'),
        contractionFrequency: this.adnHandler.readFloat('frequency'),
        phaseShift: this.adnHandler.readFloat('shift'),
        directionBias: this.adnHandler.readFloat('bias') * 2 - 1 // -1 à 1
      },
      behavior: {
        explorationTendency: this.adnHandler.readFloat('exploration'),
        energyEfficiency: this.adnHandler.readFloat('efficiency'),
        adaptability: this.adnHandler.readFloat('adaptability'),
      }
    };
  }

  crossover(otherGenome, mutationRate = 0.1) {
    const newGenome = {};
    for (const category in this.genome) {
      newGenome[category] = {};
      for (const trait in this.genome[category]) {
        // Croisement : moyenne pondérée + mutation
        const parent1 = this.genome[category][trait];
        const parent2 = otherGenome.genome[category][trait];
        let value = (parent1 + parent2) / 2;

        // Mutation
        if (Math.random() < mutationRate) {
          value += (Math.random() - 0.5) * 0.2;
          value = Math.max(0, Math.min(1, value));
        }

        newGenome[category][trait] = value;
      }
    }
    return new GenomeManager(newGenome);
  }

  getGene(category, trait) {
    return this.genome[category][trait];
  }
}

// Composant Blob individuel
const EvolutionBlob = ({ genome, onPositionUpdate, startPosition = { x: 100, y: 200 } }) => {
  const [segments, setSegments] = useState([]);
  const [position, setPosition] = useState(startPosition);
  const [groundY, setGroundY] = useState(startPosition.y + 50); // Sol initial
  const timeRef = useRef(0);
  const genomeRef = useRef(genome);
  const totalDistanceRef = useRef(0);

  // Génération de la morphologie basée sur l'ADN
  const generateMorphology = useCallback(() => {
    const numSegs = Math.floor(genomeRef.current.getGene('morphology', 'numSegments') * 12) + 16;
    const baseRadius = genomeRef.current.getGene('morphology', 'baseRadius') * 30 + 30;
    const asymmetry = genomeRef.current.getGene('morphology', 'asymmetry');
    const nbAngles = genomeRef.current.getGene('morphology', 'nbPattes') * 5 + 1;

    const segs = [];
    for (let i = 0; i < numSegs; i++) {
      const angle = (i / numSegs) * Math.PI * 2;
      const radiusVariation = 1 + asymmetry * 0.5 * Math.sin(angle * nbAngles);
      segs.push({
        angle,
        baseRadius: baseRadius * radiusVariation,
        phase: (Math.PI * 2 * i) / numSegs,
        flexibility: genomeRef.current.getGene('morphology', 'flexibility'),
        tension: 0.5 + genomeRef.current.getGene('morphology', 'tension') * 0.8  // ← AJOUTER CETTE LIGNE
      });
    }
    return segs;
  }, []);

  // Initialisation
  useEffect(() => {
    const morphology = generateMorphology();
    setSegments(morphology);
  }, [generateMorphology]);

  // Animation et locomotion
  useEffect(() => {
    let frame;
    const loop = () => {
      timeRef.current += 0.1;

      const contractionStr = genomeRef.current.getGene('locomotion', 'contractionStrength');
      const frequency = genomeRef.current.getGene('locomotion', 'contractionFrequency') * 2 + 1.5;
      const phaseShift = genomeRef.current.getGene('locomotion', 'phaseShift') * Math.PI;
      const directionBias = genomeRef.current.getGene('locomotion', 'directionBias') * 2;

      const contractions = segments.map((seg, i) => {
        const segmentTension = seg.tension; // ← Utiliser la tension du segment
        const segmentBias = Math.cos(seg.angle) * directionBias;

        const baseContraction = Math.sin(timeRef.current * frequency + seg.phase + phaseShift);
        const biasedContraction = baseContraction * segmentTension * (1 + segmentBias * 0.5);

        return contractionStr * biasedContraction;
      });

      // Calcul du mouvement basé sur la déformation
      // Dans setPosition, remplacer tout le contenu :
      setPosition(prevPos => {
        // 1. Calculer les nouvelles positions des segments
        const segmentPositions = segments.map((seg, i) => ({
          x: prevPos.x + (seg.currentRadius || seg.baseRadius) * Math.cos(seg.currentAngle || seg.angle),
          y: prevPos.y + (seg.currentRadius || seg.baseRadius) * Math.sin(seg.currentAngle || seg.angle),
          force: contractions[i] * seg.tension
        }));

        // 2. Trouver les segments qui touchent/dépassent le sol
        const groundContacts = segmentPositions.filter(segPos => segPos.y >= groundY);

        let deltaX = 0;
        let deltaY = 0;

        if (groundContacts.length > 0) {
          // 3. Redistribuer les forces des segments au sol
          const totalGroundForce = groundContacts.reduce((sum, contact) => sum + Math.abs(contact.force), 0);

          if (totalGroundForce > 0) {
            // Calculer la poussée moyenne des contacts au sol
            const avgContactX = groundContacts.reduce((sum, contact) => sum + contact.x, 0) / groundContacts.length;
            const pushDirection = avgContactX - prevPos.x; // Direction de la poussée

            // Réaction : l'organisme bouge dans la direction opposée
            deltaX = -pushDirection * totalGroundForce * 0.1;
            // Ajustement vertical pour maintenir le contact
            const lowestY = Math.max(...segmentPositions.map(s => s.y));
            if (lowestY >= groundY + 10) {
              deltaY = groundY - lowestY;
            }
          }
        }
        else {
          // Si aucun segment ne touche le sol, appliquer une légère gravité
          deltaY += 1; // Gravité
        }

        const newPos = {
          x: prevPos.x + deltaX,
          y: prevPos.y + deltaY
        };

        // Calcul distance
        const distance = deltaX;
        totalDistanceRef.current += distance;

        if (onPositionUpdate) {
          onPositionUpdate(newPos, totalDistanceRef.current);
        }

        return newPos;
      });

      setSegments(prevSegments => {
        return prevSegments.map((seg, i) => {

          return {
            ...seg,
            currentRadius: seg.baseRadius * (1 + contractions[i] * 0.6),
            currentAngle: seg.angle + directionBias * contractions[i] * 0.05
          };
        });
      });
      frame = requestAnimationFrame(loop);

    }

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [segments, onPositionUpdate]);

  // Rendu du blob
  const renderBlob = () => {
    if (segments.length === 0) return null;

    const points = segments.map(seg => ({
      x: position.x + (seg.currentRadius || seg.baseRadius) * Math.cos(seg.currentAngle || seg.angle),
      y: position.y + (seg.currentRadius || seg.baseRadius) * Math.sin(seg.currentAngle || seg.angle)
    }));

    const pathData = points.reduce((path, point, i) => {
      return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '') + ' Z';

    // Couleur basée sur les gènes
    const hue = genomeRef.current.getGene('behavior', 'explorationTendency') * 360;
    const saturation = genomeRef.current.getGene('locomotion', 'contractionStrength') * 80 + 20;

    return (
      <>

        <line x1={position.x - Math.abs(Math.round(totalDistanceRef.current))} y1={groundY} x2={position.x + 100} y2={groundY} stroke="#8B4513" strokeWidth="3" />
        <text x={position.x - Math.round(totalDistanceRef.current)} y={groundY - 20} fontSize="12" fill="#8B4513">Sol</text>
        <text x={position.x + 20} y={groundY - 20} fontSize="12" fill="#2316afff">{Math.round(totalDistanceRef.current)}mm</text>
        <path
          d={pathData}
          fill={`hsl(${hue}, ${saturation}%, 60%)`}
          stroke={`hsl(${hue}, ${saturation}%, 40%)`}
          strokeWidth="1"
          opacity="0.8"
        />
      </>
    );
  };

  return renderBlob();
};

// Composant principal de simulation
const EvolutionSimulator = () => {
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bestDistance, setBestDistance] = useState(0);
  const [bestSpeed, setBestSpeed] = useState(0);
  const populationSize = 15;
  const simulationTime = 10000; // 10 secondes par génération

  const blobStats = useRef({});
  const simulationTimer = useRef(null);
  const speedTimer = useRef(null);

  // Initialisation de la première génération
  const initializePopulation = useCallback(() => {
    const newPop = [];
    for (let i = 0; i < populationSize; i++) {
      const genome = new GenomeManager();
      newPop.push({
        id: i,
        genome,
        startPosition: {
          x: 100,
          y: 100 + Math.floor(i % 4) * 100
        },
        fitness: 0
      });
    }
    setPopulation(newPop);
    speedTimer.current = Date.now();
    setGeneration(g => g + 1);
    blobStats.current = {};
  }, [populationSize, setPopulation]);


  // Evolution vers la génération suivante
  const evolveGeneration = useCallback(() => {
    if (population.length === 0) return;
    const sortedPop = [...population].sort((a, b) =>
      (blobStats.current[b.id]?.distance || 0) - (blobStats.current[a.id]?.distance || 0)
    );

    const bestDist = blobStats.current[sortedPop[0]?.id]?.distance || 0;
    setBestDistance(prev => Math.max(prev, bestDist));
    if (bestDist > 0 && speedTimer.current) {
      const timeTaken = (Date.now() - speedTimer.current) / 1000; // en secondes
      const speed = bestDist / timeTaken; // mm/s
      setBestSpeed(speed);
    }
    speedTimer.current = Date.now();
    // Sélection des meilleurs (top 25%)
    const survivors = sortedPop.slice(0, Math.max(2, Math.floor(populationSize / 4)));

    // Création de la nouvelle génération
    const newPop = [];
    for (let i = 0; i < populationSize - 1; i++) {
      let newGenome;
      if (i < survivors.length) {
        // Garder les meilleurs
        newGenome = survivors[i].genome;
      } else {
        // Croisement des meilleurs
        const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
        const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
        newGenome = parent1.genome.crossover(parent2.genome, 0.5);
      }

      newPop.push({
        id: i,
        genome: newGenome,
        startPosition: {
          x: 100,
          y: 100 + Math.floor(i % 4) * 100
        },
        fitness: 0
      });
    }
    // and a last one random
    const genome = new GenomeManager();
    newPop.push({
      id: 'toto' + generation,
      genome,
      startPosition: {
        x: 100,
        y: 100
      },
      fitness: 0
    });

    setPopulation(newPop);
    setGeneration(g => g + 1);
    blobStats.current = {};
  }, [population, setPopulation, populationSize]);

  // Mise à jour des stats d'un blob
  const updateBlobStats = useCallback((blobId, position, distance) => {
    if (distance > 1200)
      evolveGeneration();
    blobStats.current[blobId] = { position, distance };
  }, [evolveGeneration]);
  
  // Cycle de simulation
  useEffect(() => {
    if (isRunning && population.length > 0) {
      simulationTimer.current = setTimeout(() => {
        evolveGeneration();
      }, simulationTime);

      return () => {
        if (simulationTimer.current) {
          clearTimeout(simulationTimer.current);
        }
      };
    }
  }, [isRunning, population, evolveGeneration]);

  // Interface utilisateur
  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5">Simulateur d'Evolution de Blobs</Typography>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 4 }}>
          <Button
            onClick={() => {
              if (!isRunning) initializePopulation();
              setIsRunning(!isRunning);
            }}
            variant="contained" color={isRunning ? "secondary" : "primary"}
          >
            {isRunning ? 'Pause' : 'Démarrer'}
          </Button>
          <Button
            onClick={initializePopulation}
            variant="contained" color="success"
          >
            Nouvelle Population
          </Button>
          <Button
            onClick={evolveGeneration}
            variant="contained"
            color="warning"
            disabled={!population.length}
          >
            Evolution Manuelle
          </Button>
          <Box sx={{ display: 'flex', gap: 4, fontSize: '1.2rem' }}>
            <div><strong>Génération:</strong> {generation}</div>
            <div><strong>Best vitesse:</strong> {bestSpeed.toFixed(1)}</div>
            <div><strong>Best distance:</strong> {bestDistance.toFixed(1)}</div>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ border: '1px solid gray', borderRadius: 5 }}>

        <svg width="1500" height="600" className="bg-gradient-to-b from-sky-100 to-green-100">
          {/* Grille de référence */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e0e0e0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Rendu des blobs */}
          {population.map(blob => (
            <EvolutionBlob
              key={`${generation}-${blob.id}`}
              genome={blob.genome}
              startPosition={blob.startPosition}
              onPositionUpdate={(pos, dist) => updateBlobStats(blob.id, pos, dist)}
            />
          ))}
        </svg>
      </Box>

      <Box sx={{ mt: 4, p: 3, backgroundColor: '#f9f9f9', color: '#999', borderRadius: 2 }}>
        <p><strong>Comment ça marche:</strong></p>
        <p>• Chaque blob a un génome qui définit sa morphologie et son comportement locomoteur</p>
        <p>• Les blobs qui parcourent le plus de distance survivent et se reproduisent</p>
        <p>• Les mutations introduisent de la variabilité pour découvrir de nouvelles stratégies</p>
        <p>• Au fil des générations, des comportements locomoteurs émergents apparaissent</p>
      </Box>
    </Box>
  );
};

export default EvolutionSimulator;