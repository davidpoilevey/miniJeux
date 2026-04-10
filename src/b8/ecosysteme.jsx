import { Stage, Layer, Circle, Rect, Line, Group } from "react-konva";
import { Amibe, Bacille, BacterieHerbivore, Virus, Saprophyte, Cyanobacterie, Nutrimentivore } from "./Taxonomy";
import { Fragment, useMemo } from "react";

export function simulationStep(env, population, populationHistoryRef) {
    env.update(population);

    const cellSize = env.cellSize; // à ajuster selon l'échelle
    const [spatialHash, popu] = buildSpatialHash(population, cellSize);
 const nouveauxEnfants = [];

    for (let org of population) {
        if (org.vivant) {
            org.aloneInTheDark=(popu[org.type]<10);
            const enfant = org.update(env, population, spatialHash);
            if (enfant) {
                nouveauxEnfants.push(enfant);
            }
            org.age++;
        }
    }

    if(nouveauxEnfants.length>0)
     population.push(...nouveauxEnfants);
    const prev = populationHistoryRef.current.slice(-200);
    const newTick = prev.length > 0 ? prev[prev.length - 1].tick + 1 : 1;
    prev.push({
        tick: newTick, cyano: popu['Cyanobacterie']/10 || 0, sapro: popu['Saprophyte'] || 0
        , nutri: popu['Nutrimentivore']/10 || 0, herbivore: popu['BacterieHerbivore'] || 0
        , bacille: popu['Bacille'] || 0, virus: popu['Virus'] || 0, amibe: popu['Amibe'] || 0
    })
    populationHistoryRef.current = prev;
    // Retirer morts
    return population.filter(o => o.vivant);
    
}
const getToxinColor = toxin=>{
switch(toxin){
    case 'acid': return 'red';
    case 'neuro': return 'blue';
    case 'pheromone': return 'green';
    case 'degage': return 'brown';
    default: return 'orange'
}
}
export const ECO_WIDTH = 1000;

export const ECO_HEIGHT = 600;

export function Ecosysteme({ environnement, population }) {



    return (
        <Stage width={ECO_WIDTH} height={ECO_HEIGHT}>
            <Layer>
                {environnement.zones.map((zone, i) => {
                    let opacity = Math.min(zone.lumiere / 8, 0.8); // lumiere=2 → opacité=1
                    return (
                        <Fragment key={"nutr" + i}>
                            <Rect
                                key={i}
                                x={zone.x1}
                                y={zone.y1}
                                width={zone.x2 - zone.x1}
                                height={zone.y2 - zone.y1}
                                fill="cyan"
                                opacity={opacity}
                            />
                            {/* Nutriments */}
                            <ZoneNutriments  {...zone} />
                        </Fragment>
                    );
                })}
            </Layer>
<Layer>
  {[...environnement.toxins.entries()].map(([key, toxin]) => {
    // Extraire coordonnées depuis "9,4"
    const [x, y] = key.split(",").map(Number);

    // Exemple de rayon proportionnel à la quantité
    const radius = Math.sqrt(toxin.amount) * 2;

    return (
      <Circle
        key={key}
        x={x * environnement.cellSize + environnement.cellSize / 2} // placer au centre de la case
        y={y * environnement.cellSize + environnement.cellSize / 2}
        radius={radius}
        fill={TOXIN_CONFIG[toxin.type]?.color}
        opacity={0.4}
      />
    );
  })}
</Layer>




            <Layer>
                {population.map((org, i) => (
                    <Circle
                        key={i}
                        x={org.x}
                        y={org.y}
                        radius={org.radius}
                        fill={org.couleur}
                        stroke={getAgeStroke(org)}
                        strokeWidth={1}
                    />
                ))}
            </Layer>
        </Stage>
    );
}
export const TOXIN_CONFIG = {
    acid:     { decay: 0.95, diffuse: 0.10, clamp: 400, color: 'red' },
    neuro:    { decay: 0.65, diffuse: 0.20, clamp: 600, color: 'blue' },
    pheromone:{ decay: 0.55, diffuse: 0.25, clamp: 300, color: 'green' },
    degage:    { decay: 0.94, diffuse: 0.1, clamp: 500, color: 'brown' }, // "degage" renommé en "sapro"
    default:  { decay: 0.82, diffuse: 0.18, clamp: 500, color: 'orange' }
};

function createSquarePattern(spacing, squareSize, noise) {
    const canvas = document.createElement("canvas");
    canvas.width = spacing;
    canvas.height = spacing;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "gray";

    // On ajoute un petit décalage aléatoire pour briser la grille parfaite
    const offsetX = (Math.random() - 0.5) * noise;
    const offsetY = (Math.random() - 0.5) * noise;

    ctx.fillRect(
        spacing / 2 + offsetX,
        spacing / 2 + offsetY,
        squareSize,
        squareSize
    );

    return canvas;
}
function ZoneNutriments({ x1, y1, x2, y2, nutriments, nutrimentMax }) {
    const minSpacing = 4;   // très serré
    const maxSpacing = 20;  // très espacé
    const minSize = 1;      // petit carré
    const maxSize = 5;      // gros carré
    const noise = 3;

    // Ratio relatif
    const ratio = Math.max(0, Math.min(1, nutriments / nutrimentMax));

    // Densité basée sur valeur absolue (normalisée à une échelle)
    const maxNutrimentsRef = 2000; // valeur de référence pour espacement minimal
    const absRatio = Math.max(0, Math.min(1, nutriments / maxNutrimentsRef));

    // Plus de nutriments absolus = moins d'espace entre les carrés
    const spacing = maxSpacing - absRatio * (maxSpacing - minSpacing);

    // Plus on est proche du max de la zone = plus gros carrés
    const size = minSize + ratio * (maxSize - minSize);

    const pattern = useMemo(
        () => createSquarePattern(spacing, size, noise),
        [spacing, size]
    );

    return (
        <Rect
            x={x1}
            y={y1}
            width={x2 - x1}
            height={y2 - y1}
            fillPatternImage={pattern}
            opacity={0.2}
        />
    );
}



function getAgeStroke(org) {
    const ratio = Math.min(Math.max(org.age / org.ageMax, 0), 1);
    const gray = Math.round(255 * (1 - ratio));
    return `rgb(${gray},${gray},${gray})`;
}



// Fonction pour créer un organisme du niveau supérieur
export function creerOrganismeNiveauSuperieur(enfant) {
    // Mapping des niveaux et de leurs constructeurs
    const evolutionMap = {
        0: BacterieHerbivore,
        1: Bacille,
        2: Virus,
        3: Amibe,
        4: Amibe// au dernier on reste dessus
        // Ajoutez d'autres niveaux si nécessaire
    };

    let ConstructeurSuperieur = evolutionMap[enfant.niveau];
    if(enfant.niveau==0)// 3 cas Sapro, Cyano et Nutri
    {
        if((enfant.type==="Cyanobacterie"||enfant.type==="Nutrimentivore") && Math.random()<0.3)
            ConstructeurSuperieur=Saprophyte;
        if((enfant.type==="Saprophyte"||enfant.type==="Nutrimentivore") && Math.random()<0.3)
            ConstructeurSuperieur=Cyanobacterie;
        if((enfant.type==="Cyanobacterie"||enfant.type==="Saprophyte") && Math.random()<0.3)
            ConstructeurSuperieur=Nutrimentivore;

    }

    if (ConstructeurSuperieur) {
        // Créer un nouvel organisme du niveau supérieur avec le même ADN et position
        return new ConstructeurSuperieur(enfant.adn, enfant.x, enfant.y);
    }

    // Si pas de niveau supérieur défini, retourner l'enfant original
    return enfant;
}
export function buildSpatialHash(population, cellSize) {
    const hash = new Map();
    const popu={}
    for (let i = 0; i < population.length; i++) {
        const org = population[i];

        if (popu[org.type] == null)
            popu[org.type] = 0;
        popu[org.type]++;
        const key = `${Math.floor(org.x / cellSize)},${Math.floor(org.y / cellSize)}`;
        if (!hash.has(key)) hash.set(key, []);
        hash.get(key).push(org);
    }
    return [hash,popu];
}

