import { SCENE } from "./pot20";

const MAX_LONGUEURBRANCHE = 100;
export const FEUILLE_TAILLE=20;

/** Importants */

export const toutFaneUnPeu=(tronc,adnHandler)=>{
  // chercher tous les bourgeons, fleur et fruit et incrementer leur age, faire mourir si besoin
  const allbranches = findAllBranches(tronc);
  const reproduction=[];
  //TODO adnHandleriser les factor sur age max ?
  const ageMaxBud = adnHandler.read10('age maximum bourgeons')+15;
  const ageMaxFleur = adnHandler.read10('age maximum fleurs')+5;
  const ageMur = adnHandler.read10('age maturite des fruits')+5;
  allbranches.forEach(br=>{
    if(br.bourgeon){
      br.bourgeon.age++;
      if(br.bourgeon.age>ageMaxBud)
        delete br.bourgeon;
    }
    if(br.fleur){
      br.fleur.age++;
      if(br.fleur.age>ageMaxFleur)
        delete br.fleur;
    }
    if(br.fruit){
      br.fruit.age++;
      if(br.fruit.age>ageMur){
        const newAdn = adnHandler.mutatedVersion();
        reproduction.push({...br.fruit, adn:newAdn, id:adnHandler.getID(newAdn)});// REPRODUCTION TODO!

        delete br.fruit;
      }
    }
  });
  return reproduction;
}
export const ajouteBranche = (tronc, adnHandler) => {
  // doit creer branche: */
  const newBranche = {
    largeur: 1, feuilles:[],branches:[],
    longueur: normalize(adnHandler.readFloat('longueur des branches' + adnHandler.currentCycle), 1, MAX_LONGUEURBRANCHE),
    direction: adnHandler.readFloat('direction des branches' + adnHandler.currentCycle)*Math.PI+Math.PI ,
  };
  let toBranche = null;
  if (tronc.branches.length > adnHandler.read10('maximumNumberOfTrunkBranches' + adnHandler.currentCycle)-5) {
    //  chercher toutes les branches sur la plante, en prendre une selon adn.read('branche a bourgeonner')
    const allbranches = findAllBranches(tronc).filter(br=>br.branches.length<2);
    const toBranchIdx = normalize(adnHandler.readFloat('branche a bourgeonner' + adnHandler.currentCycle), 0, allbranches.length);
    // et dire que c'est la toBranche
    toBranche = allbranches[toBranchIdx];
    if(toBranche==null)
     return {longueur:0};// pour eviter le mauvais calcul sur newVie
    assignXY(newBranche, toBranche);
  }
  else{
    toBranche=tronc;
    assignXY(newBranche, tronc);
  }

    if(newBranche.yArrivee>SCENE.SOL_Y)// pour eviter que les branches aillent dans le sol
      newBranche.yArrivee=SCENE.SOL_Y-10;
      if(newBranche.xArrivee<0)// pour eviter que les branches aillent dans le mur
        newBranche.xArrivee=0;
        if(newBranche.xArrivee>SCENE.SCENE_WIDTH)// pour eviter que les branches aillent dans le mur
          newBranche.xArrivee=SCENE.SCENE_WIDTH;
    // ajout d'un bourgeon au bout
    newBranche.bourgeon={x:newBranche.xArrivee, y:newBranche.yArrivee, age:0};

  // ajout  de feuilles selon longueur
  const nbFeuilles=Math.round(newBranche.longueur/FEUILLE_TAILLE);
  for(let f=0;f<nbFeuilles;f++){
    const coordonneesFeuille = calculerCoordonneesFeuille(newBranche, f, nbFeuilles);
    newBranche.feuilles.push(coordonneesFeuille);
  }
  
  toBranche.branches.push(newBranche);
  toBranche.largeur++;
  return newBranche;
}



export const ajouteBud = (type, tronc, adnHandler, cycle) => {
  const allbranches = findAllBranches(tronc);
  let chosenBranche = null;
  
  const activeBranches= type==='fleur'?allbranches.filter(branche=>{
    return (branche.bourgeon!=null);
  }):allbranches.filter(branche=>{
    return (branche.fleur!=null);
  });
  if(activeBranches.length==0)
  return;
  chosenBranche = activeBranches[Math.floor(Math.random() * activeBranches.length)];
  if(type==='fleur'){
    //choisir une branche avec un bourgeon actif et le remplacer par une fleur
    
    chosenBranche.fleur={x:chosenBranche.bourgeon.x,y:chosenBranche.bourgeon.y, age:0 }
    const rouge=adnHandler.readFloat('fleurRouge');
    const vert=adnHandler.readFloat('fleurVert');
    const bleu=adnHandler.readFloat('fleurBleu');

const couleurRGB = floatToRGBString(rouge, vert, bleu);
chosenBranche.fleur.couleur = couleurRGB;
 
    delete chosenBranche.bourgeon;
  }
  else{
    //choisir une branche avec une fleur et la remplacer par une fruit
    chosenBranche.fruit={x:chosenBranche.fleur.x,y:chosenBranche.fleur.y , age:0};
    const rouge=adnHandler.readFloat('fruitRouge');
    const vert=adnHandler.readFloat('fruitVert');
    const bleu=adnHandler.readFloat('fruitBleu');

const couleurRGB = floatToRGBString(rouge, vert, bleu);
    chosenBranche.fruit.couleur = couleurRGB;

    delete chosenBranche.fleur;
  }
}



export const calculerVieGagnee = (plante, adnHandler) => {
  const FLEUR_COST = adnHandler.read10('coutDeProductionFleur')+17;
  const Fruit_COST = adnHandler.read10('coutDeProductionFruit')*2 + 20;
  const PROFITABILITE = adnHandler.readFloat('rendement des feuilles');
  const METABOLISME = adnHandler.readFloat('metabolisme de base');
  const PROFITABILITETRONC = adnHandler.readFloat('photosynthese du tronc');
  let hmax = plante.tronc.taille;
  const allbranches = findAllBranches(plante.tronc);

  //1 vie * lumiereFactor par feuille  . 
  let energieTotale = PROFITABILITETRONC*(plante.tronc.taille/10) ;// energie de depart

  allbranches.forEach(branche => {
    // on trie les feuilles par hauteur, les plus hautes couvrent les + basses
     // Trier les feuilles par hauteur décroissante
     branche.feuilles.sort((a, b) => b.y - a.y);
      branche.feuilles.forEach((feuille,index) => {
         // Calculer l'énergie gagnée par la feuille en fonction de sa position en y
         let energieFeuille =  PROFITABILITE*(1 - (feuille.y / SCENE.HAUTEUR_SERRE)); 

         // Vérifier si cette feuille est couverte par une feuille au-dessus
         for (let i = index + 1; i < branche.feuilles.length; i++) {
             const feuilleAuDessus = branche.feuilles[i];
             // Vérifier si la feuille est couverte par la feuille au-dessus
             if (feuilleAuDessus.x - FEUILLE_TAILLE/2 <= feuille.x 
                && feuille.x <= feuilleAuDessus.x + FEUILLE_TAILLE/2) {
                 energieFeuille = 0; // La feuille est couverte, donc elle n'obtient pas d'énergie
                 break; // Sortir de la boucle dès qu'une feuille au-dessus est trouvée
             }
         }
         
         // Ajouter l'énergie de la feuille à l'énergie totale
         energieTotale += energieFeuille;
      });
      //retirer l'energie demandee pour faire grossir une fleur, un fruit
      if(branche.fleur!=null)
        energieTotale-=FLEUR_COST;
      if(branche.fruit!=null)
        energieTotale-=Fruit_COST;
  });
  //plus il y a de branches, plus il y a un cout energietique
 // energieTotale = Math.max(0,Math.min(energieTotale,energieTotale/(allbranches.length*METABOLISME)));

  return energieTotale;
}


/** fonctionnels */
function floatToRGBString(rouge, vert, bleu) {
  // Convertir les valeurs de float (0-1) en entiers (0-255)
  const r = Math.round(rouge * 255);
  const g = Math.round(vert * 255);
  const b = Math.round(bleu * 255);

  // Formater les valeurs entières en chaîne hexadécimale et les concaténer
  const rgbString = '#' + (r < 16 ? '0' : '') + r.toString(16) +
                         (g < 16 ? '0' : '') + g.toString(16) +
                         (b < 16 ? '0' : '') + b.toString(16);
  return rgbString.toUpperCase(); // Convertir en majuscules pour la convention RGB
}

export const hasFleur = plante => {
  if(plante==null||plante.branches==null)
  return false;
  const findInBranche = br => {
    if(br==null)
      return false;
    let found = br.find(b => b.fleur);
    if (found == null) {
      const subBranch = br.filter(b => b.branches != null);
      subBranch.forEach(b => {
        if (findInBranche(b.branches))
          found = true;
      })
    }
    return found;
  }
  if (plante.branches.length > 0) {
    return findInBranche(plante.branches) != null;

  }
  return false;
}
const normalize = (float, min, max) => {
  // Assurer que la valeur est entre 0 et 1
  if (float < 0) return min;
  if (float > 1) return max;

  // Normaliser la valeur entre min et max
  return Math.floor((max - min) * float + min);
}
const assignXY = (newBranche, troncOuBranche) => {

  // Calcul des coordonnées de départ et d'arrivée
  const xDepart = troncOuBranche.xArrivee || troncOuBranche.positionX;
  const yDepart = troncOuBranche.yArrivee || (SCENE.SOL_Y-troncOuBranche.taille);
  const xArrivee = xDepart + Math.cos(newBranche.direction) * newBranche.longueur;
  const yArrivee = yDepart + Math.sin(newBranche.direction) * newBranche.longueur;

  // Ajout des coordonnées à l'objet newBranche
  newBranche.xDepart = xDepart;
  newBranche.yDepart = yDepart;
  newBranche.xArrivee = xArrivee;
  newBranche.yArrivee = yArrivee;
}
const calculerCoordonneesFeuille =(newBranche, indexFeuille, nbFeuilles) =>{
  // Calcul de la position de la feuille le long de la branche
  const progression = (indexFeuille + 1) / (nbFeuilles + 1); // progression entre 0 et 1

  // Calcul des coordonnées x et y de la feuille
  const xFeuille = newBranche.xDepart + (newBranche.xArrivee - newBranche.xDepart) * progression;
  const yFeuille = newBranche.yDepart + (newBranche.yArrivee - newBranche.yDepart) * progression;

  return { x: xFeuille, y: yFeuille };
}

export const findAllBranches = (tronc) => {
  // recuperer toutes les branches recursivement
  let allbr = [];
  if (tronc.branches != null) {
    allbr = allbr.concat(tronc.branches);
    for (let b of tronc.branches) {
      const subBranches = findAllBranches(b);
      if (subBranches != null && subBranches.length > 0)
        allbr = allbr.concat(subBranches);
    }
  }

  return allbr;
}

export const animateFruit = (ctx, fruits, cycleDeVie) => {
  //TODO return array de fruitsMurs {x,y,size}
  const murs=[];

  fruits.forEach((fruit)=>{
      fruit.age++;
  if (fruit.y < SCENE.SOL_Y) {

      // Faire tomber le fruit
      fruit.y += 1;
  }
  else {

      // Le faire rouler
      if (fruit.rolling) {
          fruit.x += fruit.direction * 2;
          fruit.x=Math.min(SCENE.SCENE_WIDTH, Math.max(2,fruit.x))// limit entre 2 et width;
          if (fruit.maturite>10||Math.abs(fruit.x - fruit.startX) >= 100) {
              fruit.rolling = false;
          }
      } else if (fruit.rolling == null) {
          fruit.startX = fruit.x;
          fruit.direction = Math.random() < 0.5 ? -1 : 1;
          fruit.rolling = true;
      }
      else if (fruit.rolling === false) {
          // fin du roulage, une nouvelle plante apparait TODO
      }

  }
})


  // return array de fruits murs
  return murs;

};

export const trouveUnNom=()=>{

// Liste de syllabes couramment utilisées en français
const syllabes = ['a', 'an', 'on', 'e', 'en', 'in', 'un', 'ou', 'on', 'i', 'in', 'ie', 'o', 'on', 'oi', 'u', 'un', 'ou', 'ui', 'ch', 'che', 'cha', 'chu', 'che', 'dre', 'fre', 'gr', 'l', 'le', 'li', 'lo', 'lu', 'ma', 'me', 'mi', 'mo', 'mu', 'na', 'ne', 'ni', 'no', 'nu', 'pa', 'pe', 'pi', 'po', 'pu', 'ra', 're', 'ri', 'ro', 'ru', 'sa', 'se', 'si', 'so', 'su', 'ta', 'te', 'ti', 'to', 'tu', 'va', 've', 'vi', 'vo', 'vu'];

    const longueur = Math.floor(Math.random() * 2) + 3; // Entre 3 et 4 syllabes
    let nom = '';
    for (let i = 0; i < longueur; i++) {
        nom += syllabes[Math.floor(Math.random() * syllabes.length)];
    }
    return nom.charAt(0).toUpperCase() + nom.slice(1); // Mettre en majuscule la première lettre


}