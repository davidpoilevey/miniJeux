// ============================================
// ACTIONS SPÉCIALES
// ============================================

import { createBaseCultist } from "./cultistFactory";


/**
 * Événement médiatique : Organiser une conférence publique
 */
export const mediaEvent = (gameState) => {
  const cost = 5000;
  if (gameState.treasury < cost) return { success: false, reason: 'Fonds insuffisants' };
  
  const notorietyGain = 15 + Math.floor(Math.random() * 10);
  const heatGain = 5 + Math.floor(Math.random() * 5);
  const positiveArticle = Math.random() < 0.6;
  
  // Génère quelques nouveaux adeptes si article positif
  const newFollowers = [];
  if (positiveArticle) {
    const count = Math.floor(Math.random() * 3) + 1;
    const lastId = Math.max(...gameState.followers.map(f => f.id), 0);
    for (let i = 0; i < count; i++) {
      newFollowers.push(createBaseCultist(lastId + i + 1, gameState.day));
    }
  }
  
  return {
    success: true,
    cost,
    notorietyChange: notorietyGain,
    heatChange: heatGain,
    message: positiveArticle 
      ? "📰 Article élogieux : 'Un mouvement spirituel prometteur'"
      : "📰 Article critique : 'Des questions subsistent sur cette organisation'",
    newFollowers,
  };
};

/**
 * Stage transcendantal : Week-end payant pour adeptes
 */
export const transcendentalRetreat = (gameState) => {
  const pricePerFollower = 500;
  const participants = gameState.followers.filter(f => f.devotion >= 40);
  
  if (participants.length === 0) {
    return { success: false, reason: 'Aucun adepte assez dévoué (min. 40% dévotion)' };
  }
  
  const revenue = participants.length * pricePerFollower;
  const sanityLoss = 10 + Math.floor(Math.random() * 10);
  const devotionGain = 10 + Math.floor(Math.random() * 10);
  
  return {
    success: true,
    revenue,
    participantIds: participants.map(p => p.id),
    effects: {
      sanityChange: -sanityLoss,
      devotionChange: devotionGain,
    },
    message: `🏕️ ${participants.length} adeptes ont participé au stage (${pricePerFollower}$ chacun)`,
  };
};

/**
 * Cours particulier : Augmente la dévotion d'un adepte ciblé
 */
export const privateSession = (follower, gameState) => {
  const cost = 500;
  if (gameState.treasury < cost) return { success: false, reason: 'Fonds insuffisants' };
  
  const devotionGain = 15 + Math.floor(Math.random() * 10);
  const suspicionLoss = 5;
  
  return {
    success: true,
    cost,
    followerId: follower.id,
    effects: {
      devotion: Math.min(100, follower.devotion + devotionGain),
      suspicion: Math.max(0, follower.suspicion - suspicionLoss),
    },
    message: `💬 ${follower.name} est maintenant plus dévoué(e) (+${devotionGain}% dévotion)`,
  };
};

/**
 * Hypnose : Révèle les hiddenPowers ET manipule l'adepte
 */
export const hypnosisSession = (follower, gameState) => {
  const cost = 1000;
  if (gameState.treasury < cost) return { success: false, reason: 'Fonds insuffisants' };
  if (follower.revealed) return { success: false, reason: 'Déjà hypnotisé(e)' };
  
  const devotionGain = 20;
  const sanityLoss = 15;
  const suspicionGain = 10;
  
  return {
    success: true,
    cost,
    followerId: follower.id,
    effects: {
      devotion: Math.min(100, follower.devotion + devotionGain),
      sanity: Math.max(0, follower.sanity - sanityLoss),
      suspicion: Math.min(100, follower.suspicion + suspicionGain),
      revealed: true,
    },
    revealedPowers: follower.hiddenPower || [{}],
    message: `🌀 Secrets révélés de ${follower.name}`,
  };
};

/**
 * Messages subliminaux : Réduit la suspicion d'un adepte
 */
export const subliminalMessages = (follower, gameState) => {
  const cost = 300;
  if (gameState.treasury < cost) return { success: false, reason: 'Fonds insuffisants' };
  
  const suspicionLoss = 15 + Math.floor(Math.random() * 10);
  
  return {
    success: true,
    cost,
    followerId: follower.id,
    effects: {
      suspicion: Math.max(0, follower.suspicion - suspicionLoss),
    },
    message: `📻 ${follower.name} a écouté les messages (-${suspicionLoss}% suspicion)`,
  };
};