// ============================================
// SYSTÈME DE RÉVÉLATIONS
// ============================================

// Thèmes disponibles
export const REVELATION_THEMES = {
  apocalypse: {
    name: 'Apocalypse',
    icon: '🔥',
    color: '#d32f2f',
    basePrice: 800,
    baseDevotionBoost: 8,
  },
  ascension: {
    name: 'Ascension',
    icon: '✨',
    color: '#9c27b0',
    basePrice: 1200,
    baseDevotionBoost: 10,
  },
  argent: {
    name: 'Argent Béni',
    icon: '💰',
    color: '#ffd700',
    basePrice: 1500,
    baseDevotionBoost: 6,
  },
  sante: {
    name: 'Santé Divine',
    icon: '🌿',
    color: '#4caf50',
    basePrice: 600,
    baseDevotionBoost: 7,
  },
  secrets: {
    name: 'Secrets Cosmiques',
    icon: '🌌',
    color: '#3f51b5',
    basePrice: 1000,
    baseDevotionBoost: 9,
  },
};

// Niveaux d'intensité
export const INTENSITY_LEVELS = {
  doux: {
    name: 'Doux',
    priceMultiplier: 0.7,
    devotionMultiplier: 0.8,
    skepticismBase: 5,
    description: 'Approche subtile et rassurante',
  },
  modere: {
    name: 'Modéré',
    priceMultiplier: 1,
    devotionMultiplier: 1,
    skepticismBase: 15,
    description: 'Équilibre entre conviction et raison',
  },
  intense: {
    name: 'Intense',
    priceMultiplier: 1.5,
    devotionMultiplier: 1.3,
    skepticismBase: 30,
    description: 'Affirmations fortes et mystiques',
  },
  delirant: {
    name: 'Délirant',
    priceMultiplier: 2,
    devotionMultiplier: 1.6,
    skepticismBase: 50,
    description: 'Complètement barré, risque élevé',
  },
};

// Fragments de texte par thème et intensité
const REVELATION_FRAGMENTS = {
  apocalypse: {
    doux: [
      "Des temps difficiles approchent, mais nous sommes préparés",
      "Les signes avant-coureurs se manifestent doucement",
      "Un changement profond se prépare dans l'invisible",
    ],
    modere: [
      "La fin de l'ancien monde est proche, l'Éveil commence",
      "Les étoiles m'ont révélé que le basculement arrive",
      "Dans 7 cycles, tout sera transformé",
    ],
    intense: [
      "L'apocalypse énergétique détruira les non-éveillés !",
      "Seuls les élus survivront au Grand Effondrement !",
      "Le feu purificateur consumera les impurs très bientôt !",
    ],
    delirant: [
      "Les reptiliens déclencheront l'inversion des pôles magnétiques dans 33 jours !",
      "La lune est un hologramme qui cachait la vérité : l'apocalypse a déjà eu lieu !",
      "Les micro-ondes 5G ouvriront les portails démoniaques le mois prochain !",
    ],
  },
  ascension: {
    doux: [
      "Votre conscience s'élève progressivement vers la lumière",
      "Chaque jour nous rapproche de notre vraie nature divine",
      "L'ascension est un chemin, pas une destination",
    ],
    modere: [
      "Nos corps vibratoires atteignent la fréquence de l'ascension",
      "Bientôt nous transcenderons les limites du monde matériel",
      "La 5ème dimension nous tend les bras, préparez-vous",
    ],
    intense: [
      "L'ascension collective aura lieu lors de l'alignement cosmique !",
      "Nous deviendrons des êtres de pure lumière éternelle !",
      "Les portails interdimensionnels s'ouvriront pour nous seuls !",
    ],
    delirant: [
      "Nos ADN mutent en cristal photonique grâce aux chants secrets !",
      "Je communique télépathiquement avec les Pléiadiens : l'ascension est pour jeudi !",
      "En méditant 8h par jour on peut sauter directement en 12ème dimension !",
    ],
  },
  argent: {
    doux: [
      "L'abondance matérielle suit naturellement l'éveil spirituel",
      "Donner, c'est recevoir selon les lois cosmiques",
      "L'énergie de prospérité circule à travers notre cercle",
    ],
    modere: [
      "Vos possessions terrestres sont des ancres qui freinent votre ascension",
      "L'argent est une illusion, mais il peut financer l'Éveil",
      "Les dons au cercle multiplient votre karma positif par 1000",
    ],
    intense: [
      "Chaque euro donné au cercle purifie 10 vies karmiques passées !",
      "L'argent matériel bloque vos chakras ! Libérez-vous maintenant !",
      "Les comptes bancaires sont des prisons énergétiques, videz-les !",
    ],
    delirant: [
      "L'argent contient des nanoparticules du Malin qui corrompent votre âme !",
      "En donnant tout au cercle, vous recevrez l'or astral éternel !",
      "Les banques sont des portails vampiriques reptiliens ! Fermez vos comptes !",
    ],
  },
  sante: {
    doux: [
      "L'harmonie spirituelle améliore naturellement votre bien-être",
      "Nos pratiques renforcent votre énergie vitale",
      "La guérison commence dans l'esprit",
    ],
    modere: [
      "L'eau du robinet contient des fréquences négatives anti-éveil",
      "Nos cristaux énergétiques réalignent vos méridiens vibratoires",
      "La médecine moderne ignore 90% de votre corps énergétique",
    ],
    intense: [
      "Tous les médicaments sont des poisons de Big Pharma ! Seule notre énergie guérit !",
      "Vos maladies sont des tests spirituels ! Refusez les soins profanes !",
      "Mon toucher énergétique peut guérir n'importe quelle maladie !",
    ],
    delirant: [
      "Les vaccins implantent des antennes 5G dans votre glande pinéale !",
      "En buvant mon urine sacrée vous deviendrez immortel !",
      "Les médecins sont des agents reptiliens qui bloquent l'ascension !",
    ],
  },
  secrets: {
    doux: [
      "Des vérités cachées existent au-delà du monde visible",
      "La science ne peut expliquer tous les mystères de l'univers",
      "Nous détenons des connaissances ésotériques anciennes",
    ],
    modere: [
      "Les gouvernements cachent l'existence des dimensions parallèles",
      "Les anciens Égyptiens communiquaient avec des êtres supérieurs",
      "Le nombre d'or cache un code secret de l'univers",
    ],
    intense: [
      "J'ai décodé les messages extraterrestres dans les pyramides !",
      "La Terre est creuse et abrite une civilisation évoluée !",
      "Les Illuminati contrôlent tout mais nous détenons leur secret !",
    ],
    delirant: [
      "La Terre est plate et portée par 4 éléphants cosmiques !",
      "Les oiseaux sont des drones gouvernementaux ! Les vrais ont disparu !",
      "Hitler vit sur la Lune avec les Nazis et JFK qui a simulé sa mort !",
    ],
  },
};

/**
 * Génère une révélation basée sur les choix du joueur
 */
export const createRevelation = (theme, intensity, customText = null) => {
  const themeData = REVELATION_THEMES[theme];
  const intensityData = INTENSITY_LEVELS[intensity];
  
  // Texte généré ou personnalisé
  const fragments = REVELATION_FRAGMENTS[theme][intensity];
  const text = customText || fragments[Math.floor(Math.random() * fragments.length)];
  
  // Calculs
  const price = Math.round(themeData.basePrice * intensityData.priceMultiplier);
  const devotionBoost = Math.round(themeData.baseDevotionBoost * intensityData.devotionMultiplier);
  const skepticismRisk = intensityData.skepticismBase;
  
  return {
    id: Date.now() + Math.random(), // ID unique
    theme,
    themeName: themeData.name,
    themeIcon: themeData.icon,
    themeColor: themeData.color,
    intensity,
    intensityName: intensityData.name,
    text,
    price,
    devotionBoost,
    skepticismRisk,
    createdDay: null, // Sera défini lors de la création
    soldCount: 0, // Nombre de fois vendue
  };
};

/**
 * Calcule si un adepte achète une révélation
 */
export const willBuyRevelation = (follower, revelation) => {
  // Facteurs influençant l'achat
  const devotionFactor = follower.devotion / 100;
  const sanityFactor = follower.sanity / 100;
  const wealthFactor = Math.min(1, follower.wealth / revelation.price);
  
  // Plus la dévotion est haute, plus facile d'acheter
  // Plus la sanité est haute, plus résistant aux révélations délirantes
  const baseChance = devotionFactor * 0.7 + (1 - sanityFactor) * 0.3;
  
  // Ajustement selon le prix vs richesse
  const affordabilityBonus = wealthFactor * 0.2;
  
  // Chance finale
  const buyChance = Math.min(0.95, baseChance + affordabilityBonus);
  
  return Math.random() < buyChance;
};

/**
 * Calcule si l'adepte devient sceptique (perd de la dévotion)
 */
export const becomesSkeptical = (follower, revelation) => {
  // Plus la sanité est haute, plus de risques de scepticisme
  const sanityFactor = follower.sanity / 100;
  const adjustedRisk = revelation.skepticismRisk * sanityFactor;
  
  return Math.random() * 100 < adjustedRisk;
};

/**
 * Applique les effets d'une révélation sur un adepte
 */
export const applyRevelationEffects = (follower, revelation, bought = true) => {
  const updated = { ...follower };
  
  if (bought) {
    // Vérifie le scepticisme
    if (becomesSkeptical(follower, revelation)) {
      // Perd de la dévotion au lieu d'en gagner
      updated.devotion = Math.max(0, updated.devotion - 10);
      updated.suspicion = Math.min(100, updated.suspicion + 15);
      updated.sanity = Math.min(100, updated.sanity + 5); // Reprend ses esprits
      return { follower: updated, skeptical: true, bought: true };
    } else {
      // Gagne de la dévotion
      updated.devotion = Math.min(100, updated.devotion + revelation.devotionBoost);
      updated.sanity = Math.max(0, updated.sanity - Math.floor(revelation.devotionBoost / 2)); // Perd un peu la raison
      return { follower: updated, skeptical: false, bought: true };
    }
  }
  
  return { follower: updated, skeptical: false, bought: false };
};

/**
 * Génère des suggestions de titres pour la révélation
 */
export const generateRevelationTitle = (theme, intensity) => {
  const titles = {
    apocalypse: {
      doux: ['Le Crépuscule Annoncé', 'Les Signes Avant-Coureurs', 'L\'Aube d\'un Nouveau Cycle'],
      modere: ['La Grande Transition', 'L\'Effondrement Énergétique', 'Le Basculement des Âges'],
      intense: ['L\'APOCALYPSE TOTALE', 'Le FEU PURIFICATEUR', 'LA FIN EST PROCHE'],
      delirant: ['REPTILIENS VS PÔLES', 'LA LUNE HOLOGRAPHIQUE', 'PORTAILS 5G DÉMONIAQUES'],
    },
    ascension: {
      doux: ['Le Chemin de Lumière', 'L\'Élévation Progressive', 'Notre Nature Divine'],
      modere: ['Fréquence d\'Ascension', 'La 5ème Dimension', 'Transcendance Matérielle'],
      intense: ['ASCENSION COLLECTIVE !', 'ÊTRES DE LUMIÈRE !', 'PORTAILS INTERDIMENSIONNELS !'],
      delirant: ['ADN CRISTAL PHOTONIQUE', 'MESSAGE PLÉIADIEN', 'MÉDITATION 12D'],
    },
    argent: {
      doux: ['Abondance Spirituelle', 'L\'Énergie de Prospérité', 'Donner pour Recevoir'],
      modere: ['Libération Matérielle', 'Les Ancres Terrestres', 'Multiplication Karmique'],
      intense: ['PURIFICATION PAR LE DON', 'CHAKRAS BLOQUÉS', 'LIBERTÉ FINANCIÈRE'],
      delirant: ['NANOPARTICULES DU MALIN', 'OR ASTRAL ÉTERNEL', 'VAMPIRES BANCAIRES'],
    },
    sante: {
      doux: ['Harmonie Vitale', 'Guérison Spirituelle', 'Bien-Être Énergétique'],
      modere: ['Fréquences de l\'Eau', 'Cristaux Guérisseurs', 'Corps Énergétique 90%'],
      intense: ['BIG PHARMA POISON', 'TESTS SPIRITUELS', 'GUÉRISON PAR L\'ÉNERGIE'],
      delirant: ['VACCINS 5G PINÉALE', 'URINE IMMORTELLE', 'MÉDECINS REPTILIENS'],
    },
    secrets: {
      doux: ['Au-Delà du Visible', 'Mystères Inexpliqués', 'Sagesse Ésotérique'],
      modere: ['Dimensions Cachées', 'Messages Égyptiens', 'Le Code du Nombre d\'Or'],
      intense: ['PYRAMIDES ALIENS', 'TERRE CREUSE', 'SECRET DES ILLUMINATI'],
      delirant: ['TERRE PLATE ÉLÉPHANTS', 'OISEAUX-DRONES', 'HITLER LUNAIRE'],
    },
  };
  
  const themeTitles = titles[theme][intensity];
  return themeTitles[Math.floor(Math.random() * themeTitles.length)];
};

/**
 * Obtient des conseils selon les stats du groupe
 */
export const getRevelationAdvice = (followers) => {
  const avgDevotion = followers.reduce((sum, f) => sum + f.devotion, 0) / followers.length;
  const avgSanity = followers.reduce((sum, f) => sum + f.sanity, 0) / followers.length;
  const avgWealth = followers.reduce((sum, f) => sum + f.wealth, 0) / followers.length;
  
  const advice = [];
  
  if (avgDevotion < 30) {
    advice.push("⚠️ Dévotion faible : privilégiez des révélations douces");
  } else if (avgDevotion > 70) {
    advice.push("✅ Dévotion élevée : vous pouvez oser l'intense");
  }
  
  if (avgSanity > 70) {
    advice.push("⚠️ Sanité élevée : risque de scepticisme sur révélations intenses");
  } else if (avgSanity < 40) {
    advice.push("✅ Sanité faible : groupe très réceptif aux révélations");
  }
  
  if (avgWealth > 100000) {
    advice.push("💰 Groupe fortuné : privilégiez les révélations chères");
  } else if (avgWealth < 30000) {
    advice.push("⚠️ Groupe peu fortuné : restez sur des prix accessibles");
  }
  
  return advice;
};