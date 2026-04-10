import { FARM_BUILDINGS, PLANTES, PRODUCTIONS } from "./farmData";

// Fonction pour obtenir le niveau d'une production basé sur ses ingrédients et bâtiment requis
export const getProductionLevel = (production) => {
  // Trouve le bâtiment qui peut produire cet item
  const requiredBuilding = FARM_BUILDINGS.find(building => 
    building.possibleProduction.includes(production.id) && building.level>0
  );
  
  if (!requiredBuilding) {
    console.warn(`Aucun bâtiment trouvé pour la production ${production.id}`);
    return Infinity; // Si pas de bâtiment, niveau impossible
  }
  
  // Calcule le niveau maximum requis parmi les ingrédients
  let maxIngredientLevel = 0;
  
  for (const [ingredientId, quantity] of Object.entries(production.ingredients)) {
    // Vérifie si l'ingrédient est une plante
    const plante = PLANTES.find(p => p.id === ingredientId);
    if (plante) {
      maxIngredientLevel = Math.max(maxIngredientLevel, plante.level);
      continue;
    }
    
    // Si ce n'est pas une plante, c'est probablement une autre production
    const ingredientProduction = PRODUCTIONS.find(p => p.id === ingredientId);
    if (ingredientProduction) {
      // Récursion pour obtenir le niveau de la production ingrédient
      const ingredientLevel = getProductionLevel(ingredientProduction);
      maxIngredientLevel = Math.max(maxIngredientLevel, ingredientLevel);
    }
  }
  
  // Le niveau de la production est le maximum entre :
  // - le niveau du bâtiment requis
  // - le niveau maximum des ingrédients
  return Math.max(requiredBuilding.level, maxIngredientLevel);
};

// Fonction pour obtenir les items disponibles selon le niveau du joueur
export const getAvailableItems = (userLevel) => {
  // Plantes disponibles (niveau <= niveau du joueur)
  const availablePlantes = PLANTES.filter(plante => plante.level <= userLevel);
  
  // Productions disponibles (niveau calculé <= niveau du joueur)
  const availableProductions = PRODUCTIONS.filter(production => {
    const productionLevel = getProductionLevel(production);
    return productionLevel <= userLevel;
  });
  
  return [...availablePlantes, ...availableProductions];
};

// Fonction principale pour générer une commande aléatoire
export const getRandomCommande = (userLevel) => {
  const availableItems = getAvailableItems(userLevel);
  
  if (availableItems.length === 0) {
    console.warn('Aucun item disponible pour ce niveau');
    return null;
  }
  
  // Sélection aléatoire d'un item
  const randomIndex = Math.floor(Math.random() * availableItems.length);
  const item = availableItems[randomIndex];
  
  // Génération d'une quantité aléatoire (entre 1 et 5 par exemple)
  const quantite = Math.floor(Math.random() * 5) + 1;
  const reward = quantite * (item.sellPrice|| (item.level+10))
  // Création de la commande
  return {
    id: `${item.id}-${Date.now()}-${ Math.floor(Math.random() *100)}`,
    itemId: item.id,
    name: item.name,
    img: item.img,
    quantite,
    reward: reward, // Bonus si c'est une production
  };
};

// Fonction utilitaire pour débugger les niveaux des productions
export const debugProductionLevels = () => {
  console.log('Niveaux des productions :');
  PRODUCTIONS.forEach(production => {
    const level = getProductionLevel(production);
    console.log(`${production.name}: niveau ${level}`);
  });
};