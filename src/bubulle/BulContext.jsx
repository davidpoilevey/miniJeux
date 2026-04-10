/* eslint-disable no-loop-func */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useReglages } from './ReglageContext';
import { ELTS } from './Bulle';



// Créez un contexte pour le BullContext
const BullContext = createContext();

// Fonction utilitaire pour récupérer le contexte
export function useBull() {
    return useContext(BullContext);
}

// Composant BullProvider pour envelopper votre application et fournir le contexte
export function BullProvider({ children }) {
    // Définir les 4 groupes de données (tableaux d'éléments)
    const [bullesFeu, setBullesFeu] = useState([]);
    const [bullesEau, setBullesEau] = useState([]);
    const [bullesAir, setBullesAir] = useState([]);
    const [bullesTerre, setBullesTerre] = useState([]);
    // State pour stocker les limites de l'aquarium
    const [aquariumLimits, setAquariumLimits] = useState();// {width, height}
    const initialized = useRef();
    const animationRef = useRef();

  
    const {  setAttrRapports,  setRepRapports,NB_FEU, setNB_FEU, NB_EAU, setNB_EAU , NB_AIR, setNB_AIR, NB_TERRE, setNB_TERRE
        , FORCEFACTOR, setFORCEFACTOR, setNB_YEUX,NB_YEUX, attractionRapport, repulsionRapport } = useReglages();

    // Fonction pour ajouter une bulle à un groupe spécifique
    const addBulleToGroup = (group, bulle) => {
        switch (group) {
            case 'feu':
                setBullesFeu((prevBulles) => [...prevBulles, bulle]);
                break;
            case 'eau':
                setBullesEau((prevBulles) => [...prevBulles, bulle]);
                break;
            case 'air':
                setBullesAir((prevBulles) => [...prevBulles, bulle]);
                break;
            case 'terre':
                setBullesTerre((prevBulles) => [...prevBulles, bulle]);
                break;
            default:
                break;
        }
    };

    // Fonction pour supprimer une bulle d'un groupe spécifique
    const removeBulleFromGroup = (group, bulleId) => {
        switch (group) {
            case 'feu':
                setBullesFeu((prevBulles) => prevBulles.filter((bulle) => bulle.id !== bulleId));
                break;
            case 'eau':
                setBullesEau((prevBulles) => prevBulles.filter((bulle) => bulle.id !== bulleId));
                break;
            case 'air':
                setBullesAir((prevBulles) => prevBulles.filter((bulle) => bulle.id !== bulleId));
                break;
            case 'terre':
                setBullesTerre((prevBulles) => prevBulles.filter((bulle) => bulle.id !== bulleId));
                break;
            default:
                break;
        }
    };

    // Fonction pour initialiser l'aquarium et récupérer ses limites
    const initialize = (element) => {
        if (element) {
            const { offsetWidth, offsetHeight } = element;
            setAquariumLimits({ width: offsetWidth, height: offsetHeight });
        }
    };
    const initializeAquarium = () => {

        setBullesFeu(initializeBulles(NB_FEU, 'feu'));
        setBullesEau(initializeBulles(NB_EAU, 'eau'));
        setBullesAir(initializeBulles(NB_AIR, 'air'));
        setBullesTerre(initializeBulles(NB_TERRE, 'terre'));
        initialized.current = true;
    }
    // Fonction pour initialiser les bulles dans chaque groupe
    const initializeBulles = (nbBulles, group) => {
        const bulles = [];
        for (let i = 0; i < nbBulles; i++) {
            bulles.push({
                id: group + i,
                x: Math.random() * aquariumLimits.width, // Vous pouvez ajuster les valeurs selon la taille de votre écran
                y: Math.random() * aquariumLimits.height,
                groupe: group,
                size: 5+Math.round(Math.random()*10),
                couleur: ELTS[group].color
            });
        }
        return bulles;
    };
    const reset = () => {
        initializeAquarium();
    }
    const setConfig = config=>{
        const {
            attractionRapport, repulsionRapport
            , NB_YEUX,  NB_AIR, NB_EAU, NB_FEU, NB_TERRE
         }  = config;
        setNB_AIR(NB_AIR);
    setNB_EAU(NB_EAU);
    setNB_FEU(NB_FEU);
    setNB_TERRE(NB_TERRE);
    setFORCEFACTOR(FORCEFACTOR); 
    setNB_YEUX(NB_YEUX)
    setAttrRapports(attractionRapport);
    setRepRapports(repulsionRapport);
    }
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = (event) => {
          try {
            const valueToLoad = JSON.parse(event.target.result);
          setConfig(valueToLoad);
          } catch (error) {
            console.error('Erreur lors de la lecture du fichier JSON :', error);
          }
        };
    
        reader.readAsText(file);
      };
    
      const load = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', handleFileChange);
        fileInput.click();
      };
    const save=()=>{
     const valueToSave={
        attractionRapport:attractionRapport, repulsionRapport:repulsionRapport
        , NB_YEUX:NB_YEUX,  NB_AIR:NB_AIR, NB_EAU:NB_EAU, NB_FEU:NB_FEU, NB_TERRE:NB_TERRE
     }  
       
    // Créer un objet JSON avec les valeurs
    const jsonData = JSON.stringify(valueToSave, null, 2);

    // Créer un blob avec le contenu JSON
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BulleConfig.json';

    // Simuler un clic sur le lien pour déclencher le téléchargement
    link.click();

    // Libérer l'URL du blob après le téléchargement
    URL.revokeObjectURL(url);
    }


    // Fonction pour mettre à jour les positions des bulles en fonction des règles d'attraction et de répulsion
    const moveBulles = useCallback(() => {


        const allBulles = bullesTerre.concat(bullesAir).concat(bullesEau).concat(bullesFeu);
        if (allBulles.length === 0)
            return

        const newBulles = allBulles.map((bulle, idx, bulleArray) => {
            const { x, y, vitesseX=0, vitesseY=0 } = bulle;

            // Calculer les forces d'attraction et de répulsion
            let forceX = vitesseX;
            let forceY = vitesseY;
            
            //let nearestBulle = null;

            const nearestBulles = []; // Tableau pour stocker les 5 bulles les plus proches

            bulleArray.forEach((bulleB) => {
              if (bulle !== bulleB) {
                const distanceX = bulleB.x - bulle.x;
                const distanceY = bulleB.y - bulle.y;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
                if (nearestBulles.length < NB_YEUX) {
                  // Ajouter les 5 premières bulles au tableau sans tri
                  nearestBulles.push({ bulle: bulleB, distance });
                } else {
                  // Trier le tableau pour garder les 5 bulles les plus proches
                  nearestBulles.sort((a, b) => a.distance - b.distance);
            
                  // Remplacer la bulle la plus éloignée si celle-ci est plus proche que la bulle actuelle
                  if (distance < nearestBulles[nearestBulles.length - 1].distance) {
                    nearestBulles[nearestBulles.length - 1] = { bulle: bulleB, distance };
                  }
                }
              }
            });
            nearestBulles.forEach(({ bulle: nearestBulle, distance }) => {

            if (nearestBulle) {
                const attraction = attractionRapport[bulle.groupe];
                const repulsion = repulsionRapport[bulle.groupe];
                const distanceX = nearestBulle.x - x;
                const distanceY = nearestBulle.y - y;

                // Appliquer la force d'attraction/répulsion uniquement si la distance est supérieure à la taille de la bulle
                if (attraction[nearestBulle.groupe] != null && distance > (bulle.size + nearestBulle.size) / 2) {
                    forceX += (attraction[nearestBulle.groupe]) * (distanceX) / distance;
                    forceY += (attraction[nearestBulle.groupe]) * (distanceY) / distance;
                }
                if (repulsion[nearestBulle.groupe] != null) {
                    forceX += -(repulsion[nearestBulle.groupe]) * (distanceX) / distance;
                    forceY += -(repulsion[nearestBulle.groupe]) * (distanceY) / distance;
                }
                if (distance < (bulle.size + nearestBulle.size) / 2) {
                    // Gérer la répulsion lorsque les bulles sont en collision
                    const repulsionStrength = 1; // La force de répulsion lors de la collision
                    const repulsionX = bulle.x - nearestBulle.x;
                    const repulsionY = bulle.y - nearestBulle.y;
                    const repulsionDistance = Math.sqrt(repulsionX * repulsionX + repulsionY * repulsionY);

                    if (repulsionDistance !== 0) {
                        const repulsionForceX = (repulsionStrength * repulsionX) / repulsionDistance;
                        const repulsionForceY = (repulsionStrength * repulsionY) / repulsionDistance;

                        forceX += repulsionForceX;
                        forceY += repulsionForceY;
                    }
                }

            }
        });
        //et on divise un peu la force
        forceX/=2; 
        forceY/=2; 




            // Vérifier les limites de l'aquarium pour que la bulle reste à l'intérieur
            const { width, height } = aquariumLimits;
            const [boundedX, boundedY] = getBoundedPosition(x,y,forceX,forceY,width,height);

            const vit = {x:boundedX-x,y:boundedY-y};

            return {
                ...bulle,
                x: boundedX,
                y: boundedY,
                vitesseX:vit.x,
                vitesseY:vit.y,
            };

        });
        // redispatcher newBulles pour faire setBullesFeu, ...
        const aggregat = aggregateBordel(newBulles);
        setBullesFeu(aggregat.feu);
        setBullesAir(aggregat.air);
        setBullesEau(aggregat.eau);
        setBullesTerre(aggregat.terre);


        //     animationRef.current = requestAnimationFrame(moveBulles);


    }, [aquariumLimits, bullesAir, bullesEau, bullesFeu, bullesTerre]);
    useEffect(() => {
        // Initialiser les bulles dans chaque groupe
        if (initialized.current == null && aquariumLimits != null) {
            initializeAquarium();
            // Démarrer la boucle d'animation avec la première animation frame, avec un petit temps pour laisser renderer

        }
        animationRef.current = requestAnimationFrame(moveBulles);

        // const intervalId = setInterval(moveBulles, 20); // 16 ms équivaut à environ 60 FPS
        // Nettoyer en annulant la boucle d'animation lors du démontage du composant
        return () => {
            cancelAnimationFrame(animationRef.current);
        };

    }, [aquariumLimits, moveBulles]);


    // Valeur fournie par le contexte
    const value = {
        bulles: {
            bullesFeu,
            bullesEau,
            bullesAir,
            bullesTerre,
        },
        reset,save,load,setConfig,
        aquariumLimits,
        setAquariumLimits,
        initialize,
        addBulleToGroup,
        removeBulleFromGroup,
    };

    return <BullContext.Provider value={value}>{children}</BullContext.Provider>;
}







export const BULLESIZE=10;







// ***************  Static functions **************************
const aggregateBordel = bordel => {

    const feu = bordel.filter(e => e.groupe === 'feu');
    const air = bordel.filter(e => e.groupe === 'air');
    const eau = bordel.filter(e => e.groupe === 'eau');
    const terre = bordel.filter(e => e.groupe === 'terre');


    return { feu, terre, air, eau }
}

const getBoundedPosition = (x,y,forceX,forceY,width,height)=>{

const aquariumPadding = 10; // Marge entre les bords de l'aquarium et les bulles

// Calculer les distances entre la bulle et les bords de l'aquarium
const distanceToLeft = Math.max(x,1);
const distanceToRight = Math.max(width - x - BULLESIZE, 1);
const distanceToTop = Math.max(y,1);
const distanceToBottom = Math.max(height - y - BULLESIZE,1);

// Calculer la force de répulsion en fonction de la distance aux bords
const repulsionStrength = 50; // La force de répulsion lorsque la bulle approche des bords

// Appliquer la force de répulsion si la bulle approche des bords
if (distanceToLeft < aquariumPadding) {
  forceX += repulsionStrength / distanceToLeft; // Plus la bulle est proche du bord, plus la force est grande
}
if (distanceToRight < aquariumPadding) {
  forceX -= repulsionStrength / distanceToRight;
}
if (distanceToTop < aquariumPadding) {
  forceY += repulsionStrength / distanceToTop;
}
if (distanceToBottom < aquariumPadding) {
  forceY -= repulsionStrength / distanceToBottom;
}
const newX = Math.max(0, Math.min(width, x+forceX));
const newY = Math.max(0, Math.min(height, y+forceY));
return [newX, newY];
}