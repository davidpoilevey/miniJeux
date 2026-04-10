// ============================================
// MÉCANIQUES DE TOUR
// ============================================

import { applyRevelationEffects, willBuyRevelation } from '../data/revelations';
import {  createBaseCultist } from './cultistFactory';

/**
 * Calcule les dons d'un adepte selon sa dévotion
 */
export const calculateDonation = (follower) => {
  // Formule : (10%richesse * dévotion%) avec variation aléatoire ±20%
  const baseDonation = (follower.wealth/10) * (follower.devotion / 100);
  const variation = 0.8 + Math.random() * 0.4; // Entre 0.8 et 1.2
  const donation = Math.round(baseDonation * variation);
  
  return Math.max(0, donation);
};

/**
 * Calcule le recrutement passif d'un adepte
 */
export const calculatePassiveRecruitment = (follower, notoriety, ceremonySuccess) => {
  // Facteurs : dévotion + sanité inverse + hidden power proselytisme
  const devotionFactor = follower.devotion / 100;
  const sanityFactor = (100 - follower.sanity) / 100; // Plus fou = plus il recrute
  
  // Hidden power proselytisme
  let proselytismeBonus = 0;
  if (follower.hiddenPower && follower.hiddenPower.length > 0) {
    const power = follower.hiddenPower[0];
    proselytismeBonus = power.proselytisme || 0;
  }
  const nbRecrue= Math.max(1, Math.floor(notoriety / 20) + (ceremonySuccess ? 1 : 0)); // 1 recrue tous les 20 de notoriété + bonus de cérémonie
  
  // Formule : base 10% + facteurs
  const baseChance = 0.1 + (devotionFactor * 0.15) + (sanityFactor * 0.1) + (proselytismeBonus * 0.3);
  const recruits = Math.random() < baseChance ? nbRecrue : 0;
  
  return recruits;
};

/**
 * Applique les hidden powers d'un adepte sur les stats globales
 */
export const applyHiddenPowers = (follower, gameState) => {
  if (!follower.hiddenPower || follower.hiddenPower.length === 0) {
    return { notorietyChange: 0, heatChange: 0, treasuryChange: 0 };
  }
  
  const power = follower.hiddenPower[0];
  let notorietyChange = 0;
  let heatChange = 0;
  let treasuryChange = 0;
  
  // Notoriété
  if (power.notoriete) {
    notorietyChange += power.notoriete;
  }
  
  // Heat (lanceuseDalertes)
  if (power.lanceuseDalertes) {
    heatChange += power.lanceuseDalertes;
  }
  
  // Influence (réduit heat)
  if (power.influence) {
    heatChange -= power.influence;
  }
  
  // Fuite info (augmente notoriété ET heat)
  if (power.fuiteInfo) {
    const fuiteHappens = Math.random() < power.fuiteInfo;
    if (fuiteHappens) {
      notorietyChange += 3;
      heatChange += 5;
    }
  }
  
  // Finance occulte (revenus passifs)
  if (power.financeOcculte) {
    const passiveIncome = Math.round(follower.wealth * power.financeOcculte * 0.01);
    treasuryChange += passiveIncome;
  }
  
  return { notorietyChange, heatChange, treasuryChange };
};

/**
 * Applique les effets de cohésion et paranoïa sur le groupe
 */
export const applyGroupEffects = (followers) => {
  let globalSuspicionChange = 0;
  let globalDevotionChange = 0;
  
  followers.forEach(follower => {
    if (!follower.hiddenPower || follower.hiddenPower.length === 0) return;
    
    const power = follower.hiddenPower[0];
    
    // Cohésion groupe (réduit suspicion de tous)
    if (power.cohesionGroupe) {
      globalSuspicionChange -= power.cohesionGroupe;
    }
    
    // Paranoïaque (augmente suspicion de tous)
    if (power.paranoiaque) {
      globalSuspicionChange += Math.abs(power.paranoiaque);
    }
    
    // Manipulateur (augmente dévotion de tous)
    if (power.manipulateur) {
      globalDevotionChange += power.manipulateur;
    }
  });
  
  return { globalSuspicionChange, globalDevotionChange };
};

/**
 * Traite la vente des révélations lors d'une cérémonie
 */
export const processRevelationSales = (followers, revelations, ceremonySuccess) => {
  const results = {
    totalRevenue: 0,
    soldCount: 0,
    skepticalCount: 0,
    followerUpdates: [],
    revelationUpdates: [],
  };
  
  // Bonus de succès de cérémonie (si le rhythm game a bien marché)
  const successBonus = ceremonySuccess ? 0.2 : -0.1;
  
  revelations.forEach(revelation => {
    let soldThisRound = 0;
    
    followers.forEach(follower => {
      // Ajuste la chance d'achat avec le bonus de cérémonie
      const adjustedFollower = {
        ...follower,
        devotion: Math.min(100, follower.devotion + (successBonus * 10)),
      };
      
      if (willBuyRevelation(adjustedFollower, revelation)) {
        const result = applyRevelationEffects(follower, revelation, true);
        
        if (result.skeptical) {
          results.skepticalCount++;
        } else {
          results.totalRevenue += revelation.price;
          soldThisRound++;
        }
        
        results.followerUpdates.push({
          followerId: follower.id,
          updates: result.follower,
          skeptical: result.skeptical,
        });
      }
    });
    
    if (soldThisRound > 0) {
      results.revelationUpdates.push({
        revelationId: revelation.id,
        soldCount: soldThisRound,
      });
      results.soldCount += soldThisRound;
    }
  });
  
  return results;
};

/**
 * Gère les départs d'adeptes (suspicion à 100%)
 */
export const handleFollowerDepartures = (followers) => {
  const departures = [];
  const remaining = [];
  
  followers.forEach(follower => {
    if (follower.suspicion >= 100) {
      // Chance de dénoncer selon la dévotion
      const denounceChance = (100 - follower.devotion) / 100;
      const denounces = Math.random() < denounceChance;
      
      departures.push({
        follower,
        denounces,
        heatIncrease: denounces ? 15 : 0,
      });
    } else {
      remaining.push(follower);
    }
  });
  
  return { departures, remaining };
};

/**
 * Génère des événements aléatoires
 */
export const generateRandomEvents = (gameState) => {
  const events = [];
  
  // Probabilité d'événements selon les stats
  const eventChance = 0.15 + (gameState.notoriety / 500) + (gameState.heat / 500);
  
  if (Math.random() < eventChance) {
    const possibleEvents = [
      // Médias
      {
        type: 'media_interest',
        title: '📰 Article dans la presse locale',
        description: 'Un journaliste a écrit sur votre groupe',
        notorietyChange: 5,
        heatChange: 2,
        condition: () => gameState.notoriety > 20,
      },
      {
        type: 'documentary',
        title: '📺 Documentaire en préparation',
        description: 'Netflix prépare un doc sur les nouveaux mouvements spirituels',
        notorietyChange: 15,
        heatChange: 5,
        condition: () => gameState.notoriety > 40 && gameState.followers.length > 20,
      },
      // Famille
      {
        type: 'family_concern',
        title: '👨‍👩‍👧 Famille inquiète',
        description: 'Les proches d\'un adepte commencent à poser des questions',
        heatChange: 3,
        suspicionIncrease: 10,
        condition: () => gameState.followers.length > 5,
      },
      // Autorités
      {
        type: 'tax_inspection',
        title: '🏛️ Inspection fiscale',
        description: 'Les impôts s\'intéressent à vos finances',
        heatChange: 10,
        treasuryDecrease: Math.round(gameState.treasury * 0.05),
        condition: () => gameState.treasury > 50000,
      },
      // Positifs
      {
        type: 'celebrity_join',
        title: '⭐ Célébrité locale rejoint',
        description: 'Une personne influente de la ville vous rejoint',
        notorietyChange: 10,
        heatChange: -5,
        condition: () => gameState.notoriety > 30 && gameState.followers.length > 15,
      },
      {
        type: 'anonymous_donation',
        title: '💰 Don anonyme',
        description: 'Un sympathisant fortuné vous envoie de l\'argent',
        treasuryIncrease: randomInRange(5000, 20000),
        condition: () => gameState.notoriety > 25,
      },
    ];
    
    // Filtre les événements selon conditions
    const validEvents = possibleEvents.filter(e => !e.condition || e.condition());
    
    if (validEvents.length > 0) {
      const event = validEvents[Math.floor(Math.random() * validEvents.length)];
      events.push(event);
    }
  }
  
  return events;
};

/**
 * Fonction principale : Process un tour complet
 */
export const processTurn = (gameState, ceremonyResults) => {
  const updates = {
    day: gameState.day + 1,
    treasury: gameState.treasury,
    notoriety: gameState.notoriety,
    heat: gameState.heat,
    followers: [...gameState.followers],
    revelations: [...gameState.revelations],
    events: [],
    recruitmentSessionUsed: false,
    turnReport: {
      donations: 0,
      revelationSales: 0,
      newRecruits: 0,
      departures: [],
      events: [],
      devotionChanges: [],
      suspicionChanges: [],
    },
  };
  
  // 1. Vente des révélations
  const revSales = processRevelationSales(
    updates.followers,
    ceremonyResults.selectedRevelations,
    ceremonyResults.ceremonySuccess
  );
  
  updates.treasury += revSales.totalRevenue;
  updates.turnReport.revelationSales = revSales.totalRevenue;
  updates.turnReport.skepticalCount = revSales.skepticalCount;
  
  // Applique les changements sur les followers
  revSales.followerUpdates.forEach(update => {
    const idx = updates.followers.findIndex(f => f.id === update.followerId);
    if (idx !== -1) {
      updates.followers[idx] = update.updates;
    }
  });
  
  // Mise à jour des révélations vendues
  revSales.revelationUpdates.forEach(update => {
    const idx = updates.revelations.findIndex(r => r.id === update.revelationId);
    if (idx !== -1) {
      updates.revelations[idx].soldCount = (updates.revelations[idx].soldCount || 0) + update.soldCount;
    }
  });
  // remove ceremonyResults.selectedRevelations from updates.revelations
    updates.revelations = updates.revelations.filter(r => !ceremonyResults.selectedRevelations.some(sr => sr.id === r.id)); 
  
  // 2. Dons des adeptes
  let totalDonations = 0;
  updates.followers = updates.followers.map(follower => {
    const donation = calculateDonation(follower);
    totalDonations += donation;
    
    // Les adeptes qui donnent perdent un peu de leur richesse
    return {
      ...follower,
      wealth: Math.max(0, follower.wealth - donation),
    };
  });
  
  updates.treasury += totalDonations;
  updates.turnReport.donations = totalDonations;
  
  // 3. Recrutement passif
  let newRecruits = [];
  const lastId = Math.max(...updates.followers.map(f => f.id), 0);
  
  updates.followers.forEach(follower => {
    const recruits = calculatePassiveRecruitment(follower, updates.notoriety, ceremonyResults.ceremonySuccess);
    for (let i = 0; i < recruits; i++) {
      const newCultist = createBaseCultist(lastId + newRecruits.length + 1, updates.day);
      newRecruits.push(newCultist);
    }
  });
  
  updates.followers = [...updates.followers, ...newRecruits];
  updates.turnReport.newRecruits = newRecruits.length;
  
  // 4. Application des hidden powers
  let totalNotorietyChange = 0;
  let totalHeatChange = 0;
  let totalTreasuryChange = 0;
  
  updates.followers.forEach(follower => {
    const { notorietyChange, heatChange, treasuryChange } = applyHiddenPowers(follower, updates);
    totalNotorietyChange += notorietyChange;
    totalHeatChange += heatChange;
    totalTreasuryChange += treasuryChange;
  });
  
  // 5. Effets de groupe
  const groupEffects = applyGroupEffects(updates.followers);
  
  updates.followers = updates.followers.map(follower => ({
    ...follower,
    suspicion: Math.max(0, Math.min(100, follower.suspicion + groupEffects.globalSuspicionChange)),
    devotion: Math.max(0, Math.min(100, follower.devotion + groupEffects.globalDevotionChange)),
  }));
  
  // 6. Départs
  const { departures, remaining } = handleFollowerDepartures(updates.followers);
  updates.followers = remaining;
  updates.turnReport.departures = departures;
  
  departures.forEach(dep => {
    if (dep.denounces) {
      totalHeatChange += dep.heatIncrease;
    }
  });
  
  // 7. Événements aléatoires
  const randomEvents = generateRandomEvents(updates);
  updates.turnReport.events = randomEvents;
  
  randomEvents.forEach(event => {
    if (event.notorietyChange) totalNotorietyChange += event.notorietyChange;
    if (event.heatChange) totalHeatChange += event.heatChange;
    if (event.treasuryIncrease) totalTreasuryChange += event.treasuryIncrease;
    if (event.treasuryDecrease) totalTreasuryChange -= event.treasuryDecrease;
    if (event.suspicionIncrease) {
      updates.followers = updates.followers.map(f => ({
        ...f,
        suspicion: Math.min(100, f.suspicion + event.suspicionIncrease),
      }));
    }
  });
  
  // 8. Application finale des changements globaux
  updates.notoriety = Math.max(0, Math.min(100, updates.notoriety + totalNotorietyChange));
  updates.heat = Math.max(0, Math.min(100, updates.heat + totalHeatChange));
  updates.treasury += totalTreasuryChange;
  
  // 9. Game Over si heat à 100
  if (updates.heat >= 100) {
    updates.gameOver = true;
    updates.gameOverReason = 'raid';
  }
  
  return updates;
};

// Helper
const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};