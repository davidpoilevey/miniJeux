import { Box } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { ADNHandler } from "./ADNPlante";
import { FEUILLE_TAILLE, ajouteBranche, ajouteBud, calculerVieGagnee, hasFleur, toutFaneUnPeu } from "./plantUtils";
import { SCENE } from "./pot20";

const HAUTEUR_MAX = 5;//=factor pour adn
/**
 * structure plante : 
 *  {
 *  racines:Int (profondeur des racines)
 *  , adn : handled by thisHandler
 *  , tronc : {
 *          taille : Int (hauteur)
 *          branches:[
 *              hauteur
 *              , longueur
 *              , direction
 * 
*                  , feuilles:[{
*                      position, couleur
*                      }]
 *              , branches : [
 *                 { largeur,longueur,direction, xDepart, xArrivee, yDepart, yArrivee
 * 
 *                  , feuilles:[{
 *                      position, couleur
 *                      }]
 *                  , bourgeon:{
 *                      position, age, couleur
 *                      }
 *                  , fleur:{
 *                      position, age, couleur
 *                      }
 *                  , fruit:{
 *                      position, age, couleur
 *                      }
 *                }
 *                  ]
 *              ]
 *          }
 *  }
 */

const Plant20 = React.forwardRef(({ adn, cycleDeVie, updatePlant, plantID,positionX, ...props }, ref) => {

  const thisHandler = useMemo(() => {
    if (adn != null)
      return new ADNHandler(adn);
  }, [adn]);
  const [plante, setPlante] = React.useState({ id:plantID
                          ,racines: 1, adn: adn, tronc: {positionX:positionX, taille: 3, largeur:1, branches: [] }
                          , vie: thisHandler.read10('vie de depart')+10 });
  const [FLEUR_COST, FRUIT_COST,DUREE_FLEUR,DUREE_FRUIT]=useMemo(()=>{
    const fl = thisHandler.read10('coutDeProductionFleur')+17;
    const fr = thisHandler.read10('coutDeProductionFruit')*2 + 20;
    const dfl = thisHandler.read10('age maximum fleurs')*3;
    const dfr = thisHandler.read10('age maturite des fruits')*2;
    return [fl, fr, dfl, dfr];
  },[thisHandler]);
  useEffect(()=>{
    // a chaque modif de plante, on update le contexte de la plante sous forme graphique
    updatePlant(plante);
  },[plante]);
  useEffect(() => {
    thisHandler.setCurrentCycle(cycleDeVie);
    // Pour chaque cycleDevie, choix croissance et croissance
    const vieGagnee = calculerVieGagnee(plante, thisHandler);
    let newVie = plante.vie + vieGagnee;

    /**
     * priorites: fruit, fleur, bourgeon, branche, tronc, racine
     * 10 vie et 1 fleur pour faire un fruit
     * 8 vie pour une fleur (1 par branche)
     * 2 vie par longeur branche,tronc racine
     * 
     *  */
    const possiblesChoix = newVie>5?['branche','economie']:[];
    const newTronc = { ...plante.tronc };
    if(newTronc.taille>(thisHandler.read10('hauteurMaxDuTronc')*HAUTEUR_MAX))
      possiblesChoix.push('tronc');
    if(plante.racines<(SCENE.HAUTEUR_SERRE- thisHandler.read10('hauteurMaxDesRacines')*2))
      possiblesChoix.push('racine');

    if (hasFleur(plante.tronc) && newVie > (DUREE_FRUIT* FRUIT_COST)) {
      possiblesChoix.push('fruit');
    }
    if (newVie > (FLEUR_COST*DUREE_FLEUR)) {
      possiblesChoix.push('fleur');
    }
    const fcidx = thisHandler.readFloat('choixDuCycle' + cycleDeVie);
    const cidx = Math.floor(fcidx * possiblesChoix.length);
    const choix = possiblesChoix[cidx];
    // le choix est fait, on l'applique

    let newRacine = plante.racines;
    switch (choix) {
      case 'racine':
        newRacine += 1;
        newVie -= 2;
        break;
      case 'tronc':
        newTronc.taille +=  thisHandler.read10('augmentationDuTronc');
        newVie -= 2;
        break;
      case 'branche':
        const nvBranche = ajouteBranche(newTronc, thisHandler);// voir pour ajouter des branches aussi a d'autres branches
        newVie -= (nvBranche.longueur/FEUILLE_TAILLE);
        //newVie=Math.max(1,newVie);// on evite qu'elle meure en faisant sa premiere branche, apres c'est sans pitie
        break;
      case 'fleur':
        ajouteBud('fleur', newTronc, thisHandler, cycleDeVie); 
        newVie -= FLEUR_COST;
        break;
      case 'fruit':
        ajouteBud('fruit', newTronc, thisHandler, cycleDeVie); 
        newVie -= FRUIT_COST;
        break;
      default:
    }
   const reproduction = toutFaneUnPeu(newTronc,thisHandler);
   const fruitMurs = (reproduction.length>0)?
    // contient les fruits murs qui doivent rouler au sol et former une nouvelle plante TODO !
    reproduction.concat([])//clone
   :null;
    setPlante(prevPlante => ({ ...prevPlante, fruitMurs:fruitMurs, vie: newVie, racines: newRacine, tronc: newTronc }));
  }, [cycleDeVie]);
  return null;
})
export default Plant20;





