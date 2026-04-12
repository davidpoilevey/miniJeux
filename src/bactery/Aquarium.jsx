import { useState, useEffect, useRef, useMemo } from "react";
import Bactery from "./Bactery";
import GrassPatch, { getRandomGrass } from "./Grass";
import BacterieTable from "./DumpTable";
import { InfoPopover } from "./BacterieDiv";
import { Box, MenuItem, Menu, TextField, Typography } from "@mui/material";
import { AutoAwesome, TableChart } from "@mui/icons-material";
import { SimulationShell, SimAction, SimStat, SimLog, SimSection } from "../SimulationShell";


export const bactWidth = 20;
export const bactHeight = 20;
export const frameWidth = 1000;
export const frameHeight = 600;
export const SEUIL_BOOST = 20;
export const SEUIL_PREDATEUR = 50;

const maxChampVision = 100;

const isChildOf = (fils, pere) => {
  return fils.ptiNom.indexOf(pere.ptiNom.substring(0, 4)) >= 0;
};

const AquariumFrame = ({ children, ...props }) => {
  const spawnPointRadius = 20;
  return (
    <div
      {...props}
      style={{
        position: 'relative',
        width: `${frameWidth}px`,
        height: `${frameHeight}px`,
        border: '2px solid #8b716a',
        borderRadius: 4,
        background: 'radial-gradient(circle at center, #ffffff 0%, #f0ede6 100%)',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: `${frameHeight / 2 - spawnPointRadius}px`,
        left: `${frameWidth / 2 - spawnPointRadius}px`,
        width: `${spawnPointRadius * 2}px`,
        height: `${spawnPointRadius * 2}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 107, 31, 0.08)',
        border: `2px dotted rgba(0,107,31,0.3)`,
      }} />
      {children}
    </div>
  );
};

const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const isColliding = (bact1, bact2) => {
  return (
    bact1.position.x < bact2.position.x + bactWidth &&
    bact1.position.x + bactWidth > bact2.position.x &&
    bact1.position.y < bact2.position.y + bactHeight &&
    bact1.position.y + bactHeight > bact2.position.y
  );
};

const moveBact = (movedBact, speedFrottement) => {
  speedFrottement = Math.min(speedFrottement, 0.99);
  const newVelocity = {
    x: movedBact.vitesse.x * speedFrottement,
    y: movedBact.vitesse.y * speedFrottement
  };
  let newEnergy = movedBact.energy;

  const newPosition = {
    x: movedBact.position.x + newVelocity.x,
    y: movedBact.position.y + newVelocity.y,
  };

  if (movedBact.position.x <= 0 || movedBact.position.x >= frameWidth - bactWidth) {
    newVelocity.y = movedBact.vitesse.y;
    newVelocity.x = -movedBact.vitesse.x;
    newPosition.x += (newVelocity.x * 2);
    newPosition.y += (newVelocity.y);
    if (newPosition.x > frameWidth || newPosition.x < 0)
      return sinked(movedBact);
  }
  if (movedBact.position.y <= 0 || movedBact.position.y >= frameHeight - bactHeight) {
    newVelocity.y = -movedBact.vitesse.y;
    newVelocity.x = movedBact.vitesse.x;
    newPosition.x += (newVelocity.x);
    newPosition.y += (newVelocity.y * 2);
    if (newPosition.y > frameHeight || newPosition.y < 0)
      return sinked(movedBact);
  }

  return { ...movedBact, position: newPosition, vitesse: newVelocity, energy: newEnergy };
};

const sinked = oldBact => {
  const newBact = Object.assign({}, oldBact);
  newBact.position.x = frameWidth / 2;
  newBact.position.y = frameHeight / 2;
  newBact.energy = oldBact.energy / 2;
  if (newBact.scars == null) newBact.scars = [];
  newBact.scars.push('sink');
  newBact.champVision -= 5;
  if (newBact.vitesseMax > 5) newBact.vitesseMax /= 2;
  return newBact;
};

const getRandomBacterieFeatures = ({ initialSpeed, speedFrottement }) => {
  const randomValue = Math.random();
  let champVision = Math.floor(Math.random() * maxChampVision) + 1;
  let agg = Math.floor(Math.random() * 5);
  let type = 'normal';
  let vit = initialSpeed || 5;
  let glisse = speedFrottement;

  if (randomValue < 0.85) {
    type = "normal";
  } else if (randomValue < 0.98) {
    type = "mutant";
    champVision += 10;
    glisse = 0.95;
    vit += 2;
    agg += 2;
  } else {
    type = "avenger";
    champVision += 20;
    glisse = 0.98;
    agg -= 2;
    vit += 5;
  }

  return {
    flou: (champVision < 20),
    type,
    vitesseMax: vit,
    glisse,
    champVision,
    aggressivite: agg,
  };
};

export const Etuve = () => {
  const [bacts, setBacteries] = useState([]);
  const [initialNumberOfBact, setinitialNumberOfBact] = useState(20);
  const [frameRate, setframeRate] = useState(10);
  const [numGrass, setnumGrass] = useState(50);
  const [nvHerbe, setnvHerbe] = useState(10);
  const [initialSpeed, setinitialSpeed] = useState(6);
  const [herbeInterval, setherbeInterval] = useState(5000);
  const [speedFrottement, setspeedFrottement] = useState(0.95);
  const [isRunning, setIsRunning] = useState(true);
  const [message, setMessage] = useState('');

  const isRunningRef = useRef(true);
  const grass = useRef([]);
  const bactRefs = useRef({});

  const toggleRunning = () => {
    isRunningRef.current = !isRunningRef.current;
    setIsRunning(r => !r);
  };

  const initialize = useMemo(() => {
    return () => {
      const initialBacteries = [];
      for (let b = 1; b < initialNumberOfBact; b++) {
        const randomPos = { x: Math.floor(Math.random() * frameWidth), y: Math.floor(Math.random() * frameHeight) };
        const randomSpeed = { x: Math.random() * initialSpeed - initialSpeed / 2, y: Math.random() * initialSpeed - initialSpeed / 2 };
        const bactType = getRandomBacterieFeatures({ initialSpeed, speedFrottement });
        const ptiNom = 'b' + b;
        initialBacteries.push({
          ptiNom,
          position: randomPos,
          alive: true,
          aggressivite: bactType.aggressivite,
          champVision: bactType.champVision,
          vitesse: randomSpeed,
          vitesseMax: bactType.vitesseMax,
          type: bactType.type,
          energy: 100,
          glisse: bactType.glisse,
          scars: [],
          reproductionEnergyThreshold: 150,
          specialEffect: bactType.flou,
        });
      }
      setBacteries(initialBacteries);
      const initialGrass = [];
      for (let i = 0; i < numGrass; i++) {
        initialGrass.push(getRandomGrass(i));
      }
      grass.current = initialGrass;
      setMessage('');
    };
  }, [setBacteries, initialNumberOfBact, initialSpeed, numGrass]);

  useEffect(() => { initialize(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunningRef.current) updateBacteries();
    }, 1000 / frameRate);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    const grassInterval = setInterval(() => {
      if (isRunningRef.current) updateGrass();
    }, herbeInterval);
    return () => clearInterval(grassInterval);
  }, [nvHerbe, herbeInterval]);

  const updateGrass = () => {
    const highest = grass.current.reduce((max, obj) => (obj.id > max ? obj.id : max), 1);
    const newBrins = [];
    for (let h = 0; h < nvHerbe; h++) {
      newBrins.push(getRandomGrass(Math.max(highest, numGrass) + 1 + h));
    }
    grass.current = grass.current.concat(newBrins);
  };

  const lookForClosestGrass = (bacterie, champVision, useGroup, returnGrass) => {
    let closestGrass = null;
    let closestDistance = Infinity;
    const group = useGroup == null ? grass.current : useGroup;
    group.forEach((g) => {
      const distance = calculateDistance(bacterie, g.position);
      if (distance < closestDistance && distance < champVision) {
        closestDistance = distance;
        closestGrass = g;
      }
    });
    return returnGrass ? closestGrass : (closestGrass ? closestGrass.position : null);
  };

  const lookForClosestProie = (bacterie, champVision) => {
    const filteredTargets = bacts.filter(b => b.aggressivite < SEUIL_PREDATEUR && !isChildOf(b, bacterie));
    return lookForClosestGrass(bacterie.position, champVision, filteredTargets, false);
  };

  const aggressionSauvage = (tueur, proie) => {
    if (isChildOf(proie, tueur)) return;
    tueur.energy += proie.energy / 4;
    tueur.aggressivite += 2;
    tueur.scars.push('meurtre');
    proie.alive = false;
    removeBacterie(proie.ptiNom);
  };

  const removeBacterie = bactIDToRemove => {
    setBacteries(prev => prev.filter(b => b.ptiNom !== bactIDToRemove));
  };

  const updateBacteries = () => {
    setBacteries((prevBacteries) => {
      const chokedBact = [];
      const updatedBacteries = prevBacteries.map((bacterie) => {
        if (!bacterie.alive) return bacterie;
        let donneBoostVision = false;
        let closestCible = null;
        const newBacterie = moveBact(bacterie, speedFrottement);
        newBacterie.direction = newBacterie.direction || newBacterie.vitesse;
        newBacterie.alreadyMoved = true;

        const closestGrassPosition = (newBacterie.aggressivite > SEUIL_PREDATEUR)
          ? lookForClosestProie(newBacterie, newBacterie.champVision * 5)
          : lookForClosestGrass(newBacterie.position, newBacterie.champVision * 3);

        if (closestGrassPosition) {
          closestCible = closestGrassPosition;
          const directionX = closestGrassPosition.x - newBacterie.position.x;
          const directionY = closestGrassPosition.y - newBacterie.position.y;
          if (directionX - newBacterie.champVision < 0 && directionY - newBacterie.champVision < 0) {
            newBacterie.vitesse.x = newBacterie.vitesse.x + directionX / 2;
            newBacterie.vitesse.y = newBacterie.vitesse.y + directionY / 2;
            donneBoostVision = true;
          }
        }

        if ((donneBoostVision && Math.abs(newBacterie.vitesse.x) < 3 && Math.abs(newBacterie.vitesse.y) < 3)
          || (Math.abs(newBacterie.vitesse.x) < 0.2 && Math.abs(newBacterie.vitesse.y) < 0.2)) {
          if (!newBacterie.alreadyMoved) {
            newBacterie.energy = (newBacterie.aggressivite > SEUIL_PREDATEUR)
              ? Math.max(newBacterie.energy * 0.8 - newBacterie.vitesseMax, 0)
              : Math.max(newBacterie.energy - newBacterie.vitesseMax, 0);
          }
          const nextDirection = closestCible ? closestCible : { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
          const boostAggressivite = newBacterie.aggressivite > SEUIL_BOOST ? eval('1.' + newBacterie.aggressivite) : 1;
          const hypotenuse = Math.sqrt(nextDirection.x ** 2 + nextDirection.y ** 2);
          newBacterie.vitesse = {
            x: (nextDirection.x / hypotenuse) * newBacterie.vitesseMax * boostAggressivite,
            y: (nextDirection.y / hypotenuse) * newBacterie.vitesseMax * boostAggressivite,
          };
        }

        const collidedBacterie = prevBacteries.find(
          other => other.ptiNom !== bacterie.ptiNom && other.alive && isColliding(newBacterie, other)
        );
        const updatedGrass = grass.current.filter((patch) => {
          if (isColliding(newBacterie, patch)) {
            newBacterie.energy += Number(patch.gainEnergy);
            return false;
          }
          return true;
        });
        grass.current = updatedGrass;

        if (collidedBacterie) {
          const [newVelocity] = checkCollision(newBacterie, collidedBacterie);
          newBacterie.vitesse = newVelocity;
          newBacterie.position.x += newVelocity.x * 2;
          newBacterie.position.y += newVelocity.y * 2;
          newBacterie.aggressivite++;
          collidedBacterie.aggressivite++;
          collidedBacterie.vitesse = { x: -newVelocity.x * 2, y: -newVelocity.y * 2 };
          chokedBact.push(collidedBacterie);
          if (collidedBacterie.alive && newBacterie.alive) {
            if (collidedBacterie.aggressivite > SEUIL_PREDATEUR && newBacterie.aggressivite < SEUIL_PREDATEUR) {
              newBacterie.vitesse.x *= 1.5;
              newBacterie.vitesse.y *= 1.5;
            }
            if (collidedBacterie.aggressivite < SEUIL_PREDATEUR && newBacterie.aggressivite > SEUIL_PREDATEUR)
              aggressionSauvage(newBacterie, collidedBacterie);
            if (collidedBacterie.aggressivite > SEUIL_PREDATEUR && newBacterie.aggressivite > SEUIL_PREDATEUR) {
              if (collidedBacterie.energy > newBacterie.energy)
                aggressionSauvage(collidedBacterie, newBacterie);
              else
                aggressionSauvage(newBacterie, collidedBacterie);
            }
          }
          return newBacterie;
        }

        const checkHypothenuse = Math.sqrt(newBacterie.vitesse.x ** 2 + newBacterie.vitesse.y ** 2);
        if (checkHypothenuse > newBacterie.vitesseMax) {
          while (Math.abs(newBacterie.vitesse.x) > newBacterie.vitesseMax) newBacterie.vitesse.x /= 1.5;
          while (Math.abs(newBacterie.vitesse.y) > newBacterie.vitesseMax) newBacterie.vitesse.y /= 1.5;
        }
        newBacterie.alreadyMoved = false;
        return newBacterie;
      });
      return updatedBacteries;
    });
  };

  const checkCollision = (bact, otherBact) => {
    const newVelocity = { x: -otherBact.vitesse.x, y: -otherBact.vitesse.y };
    const newOtherBact = { ...otherBact, vitesse: { x: -bact.vitesse.x * speedFrottement, y: -bact.vitesse.y * speedFrottement } };
    return [newVelocity, newOtherBact];
  };

  const setDead = (deadBact) => {
    grass.current.push({ id: deadBact.ptiNom, type: 'cadavre', gainEnergy: deadBact.energy / 4, position: deadBact.position });
    removeBacterie(deadBact.ptiNom);
  };

  const addToEtuve = (newBact, copiedBact) => {
    const bactType = getRandomBacterieFeatures({ initialSpeed, speedFrottement });
    newBact = Object.assign(newBact, { alive: true, champVision: bactType.champVision, vitesseMax: bactType.vitesseMax, aggressivite: bactType.aggressivite, specialEffect: bactType.flou });
    setBacteries((prev) => {
      const next = [...prev];
      if (copiedBact != null) {
        const copy = next.find(b => b.ptiNom === copiedBact.ptiNom);
        if (copy != null) {
          copy.energy /= 2;
          const scars = copy.scars || [];
          scars.push('naissance');
          copy.scars = scars;
          copy.glisse -= 0.02;
          copy.aggressivite--;
        }
      }
      next.push(newBact);
      return next;
    });
  };

  const [isHovered, setIsHovered] = useState(false);
  const [bacterieLight, setBacterieLight] = useState();
  const [scenarAnchor, setScenarAnchor] = useState(null);
  const [dumpBact, setdumpBact] = useState([]);
  const [openDump, setOpenDump] = useState(false);

  const reset = () => { initialize(); setMessage(''); };

  const dump = () => {
    setdumpBact([...bacts].filter(b => b.alive).sort((a, b) => (a.ptiNom > b.ptiNom)));
    setOpenDump(true);
  };

  const handleMouseEnter = (bacterie, event) => {
    setIsHovered(true);
    const { vitesse, position, ...bLight } = bacterie;
    bLight.anchorEl = event.currentTarget;
    setBacterieLight(bLight);
  };

  const handleMouseLeave = () => setIsHovered(false);

  const doScenar = scenar => {
    if (scenar === 'adam') {
      const bactType = getRandomBacterieFeatures({ initialSpeed, speedFrottement: 0.95 });
      setBacteries([{ ptiNom: "EVE", position: { x: frameWidth / 2, y: frameHeight / 2 }, vitesse: { x: 3, y: 2 }, energy: 100, reproductionEnergyThreshold: 120, scars: [], alive: true, ...bactType }]);
      setnvHerbe(20);
      setMessage('Scenario : Adam & Eve');
    }
    if (scenar === 'predateur') {
      const bactType = getRandomBacterieFeatures({ initialSpeed, speedFrottement: 0.95 });
      setBacteries([
        { ptiNom: "666", position: { x: frameWidth / 2, y: frameHeight / 2 }, vitesse: { x: 1, y: 2 }, ...bactType, alive: true, champVision: 120, energy: 100, reproductionEnergyThreshold: 120, scars: [], aggressivite: 150 },
        { ptiNom: "victime", position: { x: frameWidth / 2 + 150, y: frameHeight / 2 + 100 }, vitesse: { x: -1, y: -4 }, ...bactType, alive: true, energy: 100, reproductionEnergyThreshold: 120, scars: [], aggressivite: 1 },
      ]);
      setnvHerbe(10);
      setMessage('Scenario : Predateur solitaire');
    }
  };

  const aliveBacts = bacts.filter(b => b.alive);
  const predators = aliveBacts.filter(b => b.aggressivite > SEUIL_PREDATEUR);

  const cfgField = (label, value, setter, extra = {}) => (
    <TextField size="small" fullWidth label={label} value={value}
      onChange={evt => setter(evt.target.value)}
      sx={{ '& .MuiInputBase-root': { fontSize: '0.78rem' } }}
      {...extra}
    />
  );

  return (
    <SimulationShell
      title="Etuve a Bacteries"
      isRunning={isRunning}
      onToggle={toggleRunning}
      onReset={reset}
      actions={<>
        <SimAction label="Dump bestioles" icon={TableChart} onClick={dump} />
        <SimAction label="Scenarios" icon={AutoAwesome} onClick={evt => setScenarAnchor(evt.currentTarget)} />
        <Menu anchorEl={scenarAnchor} open={Boolean(scenarAnchor)} onClose={() => setScenarAnchor(null)}>
          <MenuItem divider onClick={() => { doScenar('adam'); setScenarAnchor(null); }}>
            <Box>
              <Typography variant="subtitle2">Adam</Typography>
              <Typography variant="caption" color="text.secondary">Une seule bacterie conquerra le monde</Typography>
            </Box>
          </MenuItem>
          <MenuItem divider onClick={() => { doScenar('predateur'); setScenarAnchor(null); }}>
            <Box>
              <Typography variant="subtitle2">Predateur solitaire</Typography>
              <Typography variant="caption" color="text.secondary">Un predateur, une proie</Typography>
            </Box>
          </MenuItem>
        </Menu>

        <SimSection label="Config initiale" />
        {cfgField("Bestioles", initialNumberOfBact, setinitialNumberOfBact)}
        {cfgField("Vitesse initiale", initialSpeed, setinitialSpeed, { type: 'number' })}
        {cfgField("Herbe initiale", numGrass, setnumGrass, { type: 'number' })}
        {cfgField("Framerate", frameRate, setframeRate, { type: 'number' })}

        <SimSection label="Config courante" />
        {cfgField("Pousse d'herbe / cycle", nvHerbe, setnvHerbe, { type: 'number' })}
        {cfgField("Refresh herbe (ms)", herbeInterval, setherbeInterval, { type: 'number' })}
        {cfgField("Frottement", speedFrottement, setspeedFrottement, { type: 'number', inputProps: { max: 1, min: 0, step: 0.01 } })}
      </>}
      stats={<>
        <SimStat label="Bacteries" value={aliveBacts.length} />
        <SimStat label="Predateurs" value={predators.length} highlight={predators.length > 0} />
        <SimStat label="Herbe" value={grass.current.length} />
        <SimLog message={message} />
      </>}
    >
      <Box sx={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', p: 2 }}>
        <AquariumFrame>
          {aliveBacts.map(bact => (
            <Bactery key={bact.ptiNom}
              ref={(ref) => (bactRefs.current[bact.ptiNom] = ref)}
              {...bact}
              setDead={setDead}
              onOpenInfo={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              addToEtuve={addToEtuve}
            />
          ))}
          {grass.current.map((patch) => (
            <GrassPatch key={patch.id} type={patch.type} position={patch.position} />
          ))}
          {bacterieLight != null && (
            <InfoPopover bact={bacterieLight} open={isHovered} handleMouseLeave={handleMouseLeave} />
          )}
        </AquariumFrame>
      </Box>
      <BacterieTable bacteries={dumpBact} open={openDump} setOpen={setOpenDump} />
    </SimulationShell>
  );
};

export default Etuve;
