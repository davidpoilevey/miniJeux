import React, { useState, useEffect, useRef, useMemo } from "react";
import Bactery from "./Bactery";
import GrassPatch, { getRandomGrass } from "./Grass";
import BacterieTable from "./DumpTable";
import { InfoPopover, InfoDiv } from "./BacterieDiv";
import { Box, Button, Menu, MenuItem, TextField, Typography } from "@mui/material";


export const bactWidth = 20;
export const bactHeight = 20;
export const frameWidth = 1000;
export const frameHeight = 600;
export const SEUIL_BOOST = 20;
export const SEUIL_PREDATEUR = 50;

// propre a chaque Bacterie
const maxChampVision = 100;


const isChildOf=(fils,pere)=>{
  return fils.ptiNom.indexOf(pere.ptiNom.substring(0, 4)) >= 0
}

const Aquarium = ({ children, ...props }) => {
  const spawnPointRadius = 20;
  return <div
    {...props}
    style={{
      position: 'relative',
      width: `${frameWidth}px`,
      height: `${frameHeight}px`,
      border: '2px solid black',
    }}><div
      style={{
        position: 'absolute',
        top: `${frameHeight / 2 - spawnPointRadius}px`,
        left: `${frameWidth / 2 - spawnPointRadius}px`,
        width: `${spawnPointRadius * 2}px`,
        height: `${spawnPointRadius * 2}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        border: `5px dotted blue`,
      }}
    />{children}</div>

}

// Fonction pour calculer la distance entre deux points
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

// move function
const moveBact = (movedBact, speedFrottement) => {
  // Réduire la vitesse à chaque frame jusqu'à 0 et tourner un peu
  speedFrottement = Math.min(speedFrottement, 0.99);//limitation de glisse faut pas deconner
  const newVelocity = {
    x: movedBact.vitesse.x * speedFrottement,
    y: movedBact.vitesse.y * speedFrottement
  };
  let newEnergy = movedBact.energy;


  // Calculer la nouvelle position en fonction de la vitesse actuelle
  const newPosition = {
    x: movedBact.position.x + newVelocity.x,
    y: movedBact.position.y + newVelocity.y,
  };

  if (movedBact.position.x <= 0 || movedBact.position.x >= frameWidth - bactWidth) {
    // outside of Box, inverse vitesse X
    newVelocity.y = movedBact.vitesse.y;
    newVelocity.x = -movedBact.vitesse.x;
    // and move back rebondissement
    newPosition.x += (newVelocity.x *2);// 2 fois pour compenser le nouveau positionnement
    newPosition.y += (newVelocity.y );

    if (newPosition.x > frameWidth || newPosition.x < 0) // sink it
    {
      return sinked(movedBact);
    }
  }
  if (movedBact.position.y <= 0 || movedBact.position.y >= frameHeight - bactHeight) {
    newVelocity.y = -movedBact.vitesse.y;
    newVelocity.x = movedBact.vitesse.x;
    // and move back rebondissement
    newPosition.x += (newVelocity.x);
    newPosition.y += (newVelocity.y *2);
    if (newPosition.y > frameHeight || newPosition.y < 0) // sink it
    {
      return sinked(movedBact);
    }
  }




  const newBact = { ...movedBact, position: newPosition, vitesse: newVelocity, energy: newEnergy };

  return newBact;
};
const sinked = oldBact => {
  const newBact = Object.assign({}, oldBact);
  newBact.position.x = frameWidth / 2;
  newBact.position.y = frameHeight / 2;
  newBact.energy = oldBact.energy / 2;
  if (newBact.scars == null)
    newBact.scars = [];
  newBact.scars.push('sink');
  // gain de vision pour les aider, reduction de vitesse pour les calmer
  newBact.champVision -= 5;
  if (newBact.vitesseMax > 5)
    newBact.vitesseMax /= 2;// -50% de vitesse

  return newBact;
}

const getRandomBacterieFeatures = ({ initialSpeed, speedFrottement }) => {
  const randomValue = Math.random(); // Génère un nombre aléatoire entre 0 et 1
  let champVision = Math.floor(Math.random() * maxChampVision) + 1;
  let agg = Math.floor(Math.random() * 5);

  let type = 'normal';
  let vit = initialSpeed || 5;
  let glisse = speedFrottement;
  if (randomValue < 0.85) {
    // 60% de chances d'obtenir une bactérie normale
    type = "normal";
  } else if (randomValue < 0.98) {
    // 12% de chances d'obtenir une bactérie mutante, plus rapide, plus aggressif
    type = "mutant";
    champVision += 10;
    glisse = 0.95
    vit += 2;
    agg += 2;
  } else {
    // 10% de chances d'obtenir une bactérie Avenger plus fort en tout, moins violent
    type = "avenger";
    champVision += 20;
    glisse = 0.98;
    agg -= 2;
    vit += 5;
  }

  return {
    flou: (champVision < 20)
    , type: type
    , vitesseMax: vit
    , glisse: glisse
    , champVision: champVision
    , aggressivite: agg
  }
};

 export default Etuve;
export const Etuve = () => {

  const [bacts, setBacteries] = useState([]);
  const [initialNumberOfBact, setinitialNumberOfBact] = useState(20);
  const [frameRate, setframeRate] = useState(10); // Taux de rafraîchissement de la simulation (en fps)

  const [numGrass, setnumGrass] = useState(50);// Nombre initial de patches d'herbe
  const [nvHerbe, setnvHerbe] = useState(10); // renouvellement de patches d'herbe
  const [initialSpeed, setinitialSpeed] = useState(6);// vitesse
  const [herbeInterval, setherbeInterval] = useState(5000);// refresh time for growing grass
  const [gainEnergyHerbe, setgainEnergyHerbe] = useState(10); // quantite d'energie redonnee par de l'herbe

  const [speedFrottement, setspeedFrottement] = useState(0.95);



  const grass = useRef([]);
  const bactRefs = useRef({});
  const initialize = useMemo(() => {
    return () => {

      const initialBacteries = [];
      for (let b = 1; b < initialNumberOfBact; b++) {

        const randomPos = { x: Math.floor(Math.random() * frameWidth), y: Math.floor(Math.random() * frameHeight) };
        const randomSpeed = { x: Math.random() * initialSpeed - initialSpeed / 2, y: Math.random() * initialSpeed - initialSpeed / 2 };
        const bactType = getRandomBacterieFeatures({ initialSpeed: initialSpeed, speedFrottement: speedFrottement });
        const ptiNom = 'b' + b;
        //New bacterie model
        initialBacteries.push({
          ptiNom: ptiNom
          , position: randomPos
          , alive: true
          , aggressivite: bactType.aggressivite
          , champVision: bactType.champVision
          , vitesse: randomSpeed
          , vitesseMax: bactType.vitesseMax
          , type: bactType.type
          , energy: 100
          , glisse: bactType.glisse
          , scars: []
          , reproductionEnergyThreshold: 150
          , specialEffect: bactType.flou
        });
      }
      setBacteries(initialBacteries);
      const initialGrass = [];
      for (let i = 0; i < numGrass; i++) {
        const grassPatch = getRandomGrass(i);
        initialGrass.push(grassPatch);
      }
      grass.current = initialGrass;
    }
  }, [setBacteries, initialNumberOfBact, initialSpeed, numGrass]);


  // ruthme de vie Bacterie
  useEffect(() => {
    // init bacteries
    initialize();
  }, []);
  useEffect(() => {
    // intervalMove
    const interval = setInterval(() => {
      updateBacteries();
    }, 1000 / frameRate);

    // Nettoyez l'intervalle lorsque le composant est démonté
    return () => {
      clearInterval(interval);
    };
  });

  // rythme pousse herbe
  useEffect(() => {
    const grassInterval = setInterval(() => {
      updateGrass();
    }, herbeInterval); // Renouveler l'herbe toutes les 5 secondes (à ajuster selon vos besoins)

    return () => {
      clearInterval(grassInterval);
    };
  }, [nvHerbe]);


  const updateGrass = () => {
    const highest = grass.current.reduce((max, obj) => (obj.id > max ? obj.id : max), 1);
    const newBrins = [];
    for (let h = 0; h < nvHerbe; h++) {
      const newid = Math.max(highest, numGrass) + 1 + h;
      const randomGrass = getRandomGrass(newid);
      newBrins.push(randomGrass);
    }

    grass.current = grass.current.concat(newBrins);

  };

  const lookForClosestGrass = (bacterie, champVision, useGroup, returnGrass) => {
    let closestGrass = null;
    let closestDistance = Infinity;
    if (useGroup == null)
      useGroup = grass.current
    useGroup.forEach((grass) => {
      const distance = calculateDistance(bacterie, grass.position);
      if (distance < closestDistance && distance < champVision) {
        closestDistance = distance;
        closestGrass = grass;
      }
    });
    if(returnGrass){
      return closestGrass;
    }
    return closestGrass ? closestGrass.position : null;
  };
  const lookForClosestProie = (bacterie, champVision) => {
    const filteredTargets =  bacts.filter(b=>{
     return (b.aggressivite<SEUIL_PREDATEUR && !isChildOf(b,bacterie))
    })
    return lookForClosestGrass(bacterie.position, champVision, filteredTargets, false);

  };

  const aggressionSauvage = (tueur, proie) => {
    //ne tue jamais ses enfants !!
    if (isChildOf(proie, tueur))
      return;
    // tueur mange proie : energie+=gainEnergyHerbe, aggressivite+=2
    tueur.energy += proie.energy/4;
    tueur.aggressivite += 2;// ca excite de se battre
    tueur.scars.push('meurtre');
    //proie meurt
    proie.alive = false;
    removeBacterie(proie.ptiNom);
   
  }
  const removeBacterie = bactIDToRemove => {
    setBacteries((prevBacteries) => {
      return prevBacteries.filter(bact => bact.ptiNom !== bactIDToRemove);
    });
  }
  const updateBacteries = () => {
    setBacteries((prevBacteries) => {
      const chokedBact = [];
      const updatedBacteries = prevBacteries.map((bacterie) => {
        if (!bacterie.alive)
          return bacterie;
        let donneBoostVision = false;
        let closestCible = null;
        let directionChanged = false;
        const newBacterie = moveBact(bacterie, speedFrottement); // Appel de la fonction moveBact pour mettre à jour la position de la bactérie
        newBacterie.direction = newBacterie.direction || newBacterie.vitesse
        newBacterie.alreadyMoved = true;// regulateur for energie punction
     
        // predateurs cherchent des proies, les autres de l'herbe
          const closestGrassPosition =  (newBacterie.aggressivite > SEUIL_PREDATEUR)?lookForClosestProie(newBacterie, newBacterie.champVision * 5)
                                                                                  : lookForClosestGrass(newBacterie.position, newBacterie.champVision * 3);

          if (closestGrassPosition) {
            closestCible = closestGrassPosition;
            // Calculer la direction vers la pelouse la plus proche
            const directionX = closestGrassPosition.x - newBacterie.position.x;
            const directionY = closestGrassPosition.y - newBacterie.position.y;

            // Mettre à jour la direction de la bactérie
            // Mettre à jour la position de la bactérie en utilisant la nouvelle direction seulement si dans champ de vision
            if (directionX - newBacterie.champVision < 0 && directionY - newBacterie.champVision < 0) {
              newBacterie.vitesse.x = newBacterie.vitesse.x + directionX / 2;
              newBacterie.vitesse.y = newBacterie.vitesse.y + directionY / 2
           
              donneBoostVision = true;
            }
          }
        //}



        // donne boost seulement si il voit une herbe ou si vraiment il est a l'arret
        // Choisir la direction Si la vitesse est nulle, ponctionner l'énergie pour redonner la vitesse maximale
        if ((donneBoostVision && Math.abs(newBacterie.vitesse.x) < 3 && Math.abs(newBacterie.vitesse.y) < 3)
          || (Math.abs(newBacterie.vitesse.x) < 0.2 && Math.abs(newBacterie.vitesse.y) < 0.2)) {
          if (!newBacterie.alreadyMoved){ // energy-vitesseMax , pour predateur: energie-20%
            newBacterie.energy = (newBacterie.aggressivite > SEUIL_PREDATEUR)?
             Math.max(newBacterie.energy*0.8 - newBacterie.vitesseMax, 0)
                          : Math.max(newBacterie.energy - newBacterie.vitesseMax, 0); // ponction d'energie en fonction de la vitesse...
       
          }
          // nvelle direction=ancienne direction*energyP + random*energyP
          // const nextDirection = lookForClosestGrass(newBacterie.position);
        

            const nextDirection = (closestCible) ? closestCible : { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
            const boostAggressivite = newBacterie.aggressivite > SEUIL_BOOST ? eval('1.' + newBacterie.aggressivite)// donne boost proportionnel a l'aggressivite
              : 1;// sinon pas de modif
            const hypotenuse = Math.sqrt(nextDirection.x ** 2 + nextDirection.y ** 2);
            newBacterie.vitesse = {
              x: (nextDirection.x / hypotenuse) * newBacterie.vitesseMax * boostAggressivite,
              y: (nextDirection.y / hypotenuse) * newBacterie.vitesseMax * boostAggressivite,
            };

          
        }

        const collidedBacterie = prevBacteries.find(
          (otherBacterie) =>
            otherBacterie.ptiNom !== bacterie.ptiNom && otherBacterie.alive &&
            isColliding(newBacterie, otherBacterie)
        );
        const updatedGrass = grass.current.filter((patch) => {
          if (isColliding(newBacterie, patch)) {
            // Bactérie mange l'herbe

            newBacterie.energy += Number(patch.gainEnergy); // Augmenter l'énergie de la bactérie (à ajuster selon vos besoins)

            return false; // Ne pas inclure ce patch d'herbe dans le nouveau tableau
          }
          return true; // Inclure les autres patches d'herbe dans le nouveau tableau
        });
        grass.current = updatedGrass;


        if (collidedBacterie) {
          const [newVelocity, newOtherBacterie] = checkCollision(
            newBacterie,
            collidedBacterie
          );
          newBacterie.vitesse = newVelocity;
          newBacterie.position.x += newVelocity.x * 2;
          newBacterie.position.y += newVelocity.y * 2;
          newBacterie.aggressivite++;// aggressivite plus forte plus l'aggresseur
          collidedBacterie.aggressivite++;
          collidedBacterie.vitesse = { x: -newVelocity.x * 2, y: -newVelocity.y * 2 };
          // collidedBacterie.position.x -= newVelocity.x * 2;
          // collidedBacterie.position.y -= newVelocity.y * 2;
          chokedBact.push(collidedBacterie);
          if (collidedBacterie.alive && newBacterie.alive) {

            if (collidedBacterie.aggressivite > SEUIL_PREDATEUR && newBacterie.aggressivite < SEUIL_PREDATEUR)
              {
                // touche un predateur, fuit !
                newBacterie.vitesse.x*=1.5;
                newBacterie.vitesse.y*=1.5;
              }
            if (collidedBacterie.aggressivite < SEUIL_PREDATEUR && newBacterie.aggressivite > SEUIL_PREDATEUR)
              aggressionSauvage(newBacterie, collidedBacterie);
            if (collidedBacterie.aggressivite > SEUIL_PREDATEUR && newBacterie.aggressivite > SEUIL_PREDATEUR) {
              //combat des chefs, le plus fort gagne +energie
              if ((collidedBacterie.energy) > (newBacterie.energy))
                aggressionSauvage(collidedBacterie, newBacterie);
              else
                aggressionSauvage(newBacterie, collidedBacterie);
            }
          }


          return newBacterie //, newOtherBacterie];
        }
        // regulateur de vitesse
        const checkHypothenuse = Math.sqrt(newBacterie.vitesse.x ** 2 + newBacterie.vitesse.y ** 2);
        if (checkHypothenuse > newBacterie.vitesseMax) {
          while (Math.abs(newBacterie.vitesse.x) > newBacterie.vitesseMax)
            newBacterie.vitesse.x /= 1.5;
          while (Math.abs(newBacterie.vitesse.y) > newBacterie.vitesseMax) // freinage d'urgence
            newBacterie.vitesse.y /= 1.5;

        }
        newBacterie.alreadyMoved = false;

        return newBacterie;
      });


      // and reset alreadyMoved for next round
      // updatedBacteries.map(ub => {
      //   const newB = {...ub};
      //   delete newB.alreadyMoved;
      //  return ub;
      // })
      return updatedBacteries;
    });


  };


  // for(let b=0;b<bacts.length;b++){
  //   checkCollision(bacts[b]);// do also a setBacteries

  // } 
  const checkCollision = (bact, otherBact) => {
    const newVelocity = {
      x: -otherBact.vitesse.x,
      y: -otherBact.vitesse.y,
    };

    const newOtherBact = {
      ...otherBact,
      vitesse: {
        x: -bact.vitesse.x * speedFrottement,
        y: -bact.vitesse.y * speedFrottement,
      },
    };

    return [newVelocity, newOtherBact];
  };

  const setDead = (deadBact) => {

    // add corpse to grass
    grass.current.push({ id: deadBact.ptiNom, type: 'cadavre', gainEnergy: deadBact.energy/4, position: deadBact.position });

    removeBacterie(deadBact.ptiNom);
  }
  const addToEtuve = (newBact, copiedBact) => {
    // je t'en prie, fais-toi plaisir
    const bactType = getRandomBacterieFeatures({ initialSpeed: initialSpeed, speedFrottement: speedFrottement });

    const randomConfig = {
      alive: true,
      champVision: bactType.champVision,
      vitesseMax: bactType.vitesseMax,
      aggressivite: bactType.aggressivite,
      specialEffect: bactType.flou,
    };
    newBact = Object.assign(newBact, randomConfig);

    setBacteries((prevBacteries) => {
      const newBacteries = [...prevBacteries];
      if (copiedBact != null) {
        const copy = newBacteries.find(b => b.ptiNom === copiedBact.ptiNom);
        if (copy != null) {
          copy.energy /= 2;
          const scars = copy.scars || [];
          scars.push('naissance');
          copy.scars = scars;
          copy.glisse -= 0.02;// vieillissement, plus long pour se reproduire ensuite, calme l'aggressivite
          copy.aggressivite--;// l'accouchement reduit l'aggressivite
        }
      }
      newBacteries.push(newBact);
      return newBacteries;
    });
  }
  const [isHovered, setIsHovered] = useState(false);
  const [bacterieLight, setBacterieLight] = useState();
  const [scenariOpen, openScenario] = useState();
  const [dumpBact, setdumpBact] = useState([]);

  const [openDump, setOpenDump] = useState(false);
  
  const reset = () => {
    initialize();
  }
  const dump = () => {
    setdumpBact([...bacts].filter(b => b.alive).sort((a, b) => (a.ptiNom > b.ptiNom)));
    setOpenDump(true);
  }
  const handleMouseEnter = (bacterie, event) => {
    setIsHovered(true);
    const { vitesse, position, ...bLight } = bacterie;
    bLight.anchorEl = event.currentTarget;
    setBacterieLight(bLight);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const doScenar=scenar=>{
    // Adam et Eve : 1 seule bacterie, plein de nourriture
    if(scenar==='adam')
      {
        const bactType = getRandomBacterieFeatures({ initialSpeed: initialSpeed, speedFrottement: 0.95 });
        setBacteries([{ptiNom:"EVE",  position: {x:frameWidth/2,y:frameHeight/2} , vitesse: {x:3,y:2} , energy:100, reproductionEnergyThreshold:120
          , scars:[], alive:true, ...bactType}]);
        setnvHerbe(20);
       
      }
      if(scenar==='predateur')
      {
        const bactType = getRandomBacterieFeatures({ initialSpeed: initialSpeed, speedFrottement: 0.95 });
        setBacteries([{ptiNom:"666",  position: {x:frameWidth/2,y:frameHeight/2} , vitesse: {x:1,y:2} 
          , ...bactType, alive:true, champVision:120
          , energy:100, reproductionEnergyThreshold:120
            , scars:[], aggressivite:150
          }
        , 
          {ptiNom:"victime",  position: {x:frameWidth/2+150,y:frameHeight/2+100} , vitesse: {x:-1,y:-4} 
          , ...bactType, alive:true
          , energy:100, reproductionEnergyThreshold:120
            , scars:[], aggressivite:1
          }
      
        ]);
        setnvHerbe(10);
       
      }
  }
  return <Box>
    <Box display="flex" flexDirection="row" gap={2}>
      <Button title="Reset" variant="contained" onClick={reset}>Reset</Button>
      <Button title="Dump" variant="contained" onClick={dump}>Dump bestioles</Button>
      <Button  title="Scenarios"   variant="contained"
        onClick={openScenario}
      >
        Scenarios
      </Button>
      <MenuScenarios open={scenariOpen} doScenar={doScenar}/>
    </Box>
    <Box display="flex" flexDirection="row">
      <Aquarium >
        {bacts.map(bact => {
          return <Bactery key={bact.ptiNom}

            ref={(ref) => (bactRefs.current[bact.ptiNom] = ref)}
            {...bact}
            setDead={setDead}
            onOpenInfo={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
            addToEtuve={addToEtuve}
          />
        })}
        {grass.current.map((patch, idx) => (
          <GrassPatch key={patch.id} type={patch.type} position={patch.position} />
        ))}
        {bacterieLight != null && <InfoPopover bact={bacterieLight} open={isHovered} handleMouseLeave={handleMouseLeave} />}
      </Aquarium>
      <BacterieTable bacteries={dumpBact} open={openDump} setOpen={setOpenDump} />
    </Box>

    <fieldset>
      <legend>Config initiale</legend>
      <TextField label="Nombre initial de bestioles" value={initialNumberOfBact}
        onChange={evt => (setinitialNumberOfBact(evt.target.value))} />
      <TextField label="Taux de rafraichissement" value={frameRate} type="number"
        onChange={evt => (setframeRate(evt.target.value))} />
        <TextField label="Refresh de l'herbe" value={herbeInterval} type="number"
          onChange={evt => (setherbeInterval(evt.target.value))} />
      <TextField label="Vitesse moyenne" value={initialSpeed} type="number"
        onChange={evt => (setinitialSpeed(evt.target.value))} />
        <TextField label="Nombre initial d'herbe" value={numGrass} type="number"
          onChange={evt => (setnumGrass(evt.target.value))} />
 </fieldset>
 <fieldset>
      <legend>Config courante</legend>
      <TextField label="Nombre d'herbe qui pousse par cycle" value={nvHerbe} type="number"
        onChange={evt => {
          setnvHerbe(evt.target.value)
        }} />
      <TextField label="Frottement" value={speedFrottement} type="number" max={1} min={0}
        onChange={evt => (setspeedFrottement(evt.target.value))} />
    </fieldset>
  </Box>
}


const MenuScenarios = ({open, doScenar, ...props})=>{
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.target);
  };
  useEffect(()=>{
    if(open){
      handleMenuOpen(open);
    }
  },[open])

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (scenar) => {
   doScenar(scenar);
    handleMenuClose();
  };
  return   <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
>
  <MenuItem divider onClick={() => handleMenuItemClick('adam')}>
    <Typography variant="subtitle">Adam</Typography>
    <Typography variant="caption"> (une seule bacterie conquerra le monde entier)</Typography> 
    </MenuItem>
  <MenuItem  divider onClick={() => handleMenuItemClick('predateur')}>
  <Typography variant="subtitle">Predateur solitaire</Typography>
    <Typography variant="caption"> (un predateur, une proie, advienne que pourra)</Typography> 
  </MenuItem>
  <MenuItem  divider onClick={() => handleMenuItemClick('Option 3')}>Option 3</MenuItem>
</Menu>
}