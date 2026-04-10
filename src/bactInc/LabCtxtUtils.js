import { useCallback, useEffect } from "react";
import { GENE_DATA, MACHINE_DATA, RESEARCH_DATA } from "./bactData";
import { INITIAL_STATE } from "./LabContext";

//useful functions
/**
 * processDNAResearch(lab, researchRefOrObj)
 * - lab : ton labState (muté puis retourné)
 * - researchRefOrObj : soit research.current (Ref), soit lab.research (objet sérialisable)
 *
 * Comportement :
 * - on utilise research.analyzedIds (array) comme source persistante
 * - on crée un Set local pour accélérer les checks
 * - on met à jour research.analyzedIds = Array.from(set) avant de retourner
 */
export function processDNAResearch(lab, researchRefOrObj) {
  if (!lab.resources?.adn_brut?.length) return lab;

  // Normalize research handler:
  // si c'est une ref (research.current), travaille dessus ; sinon sur l'objet lui-même.
  const isRef = typeof researchRefOrObj === "object" && "current" in researchRefOrObj;
  const researchObj = isRef ? researchRefOrObj.current : researchRefOrObj;

  if (!researchObj) {
    // fallback : si rien, on loggue et on quitte
    lab.logs = lab.logs || [];
    lab.logs.push({
      id: crypto.randomUUID(),
      message: "processDNAResearch: research object absent",
      severity: "warn",
      time: Date.now(),
    });
    return lab;
  }

  // Ensure analyzedIds exists as an array (persistable)
  if (!Array.isArray(researchObj.analyzedIds)) researchObj.analyzedIds = [];

  // Work with a local Set for speed & semantic clarity
  const analyzedSet = new Set(researchObj.analyzedIds);

  let totalPoints = 0;
  let newDiscoveries = 0;

  // Pour chaque ADN brut présent dans le labo (on ne consomme plus l'ADN)
  lab.resources.adn_brut.forEach((id) => {
    const bact = lab.bacteria.find((b) => b.id === id);
    if (!bact) return;

    // première analyse = gros bonus
    if (!analyzedSet.has(id)) {
      const purity = bact.dna?.purity ?? 0.5;
      const stability = bact.stability ?? 0.5;
      const points = 1 + purity * stability; // entre ~1 et ~3
      // créditer les points soit dans research.current soit dans researchObj
      if (isRef) {
        researchRefOrObj.current.points = (researchRefOrObj.current.points || 0) + points;
      } else {
        researchObj.points = (researchObj.points || 0) + points;
      }
      analyzedSet.add(id);
      totalPoints += points;
      newDiscoveries++;
    }
  });

  // Gain passif continu basé sur la quantité d'ADN brut stockée
  const passiveGainPerTickPerSample = 0.01; // réglable
  const passiveGain = (lab.resources.adn_brut.length || 0) * passiveGainPerTickPerSample;
  if (isRef) {
    researchRefOrObj.current.points = (researchRefOrObj.current.points || 0) + passiveGain;
  } else {
    researchObj.points = (researchObj.points || 0) + passiveGain;
  }
  totalPoints += passiveGain;

  // Persist the analyzed ids back as an array (serializable)
  researchObj.analyzedIds = Array.from(analyzedSet);

  // If researchRef was passed, also ensure current is updated (already done since we mutated)
  // Add a log entry
  lab.logs = lab.logs || [];
  if (newDiscoveries > 0) {
    lab.logs.push({
      id: crypto.randomUUID(),
      message: `Analyse : ${newDiscoveries} nouvelle(s) souche(s) - +${totalPoints.toFixed(2)} pts.`,
      severity: "success",
      time: Date.now(),
    });
  }

  // IMPORTANT : ne pas vider lab.resources.adn_brut si tu veux la garder comme ressource persistante
  return lab;
}




const LAB_SAVE_KEY = "myBiolabSave_v1";
export function useLabSave(labState, setLabState, research, {setResearch, auto = true } = {}) {

  const saveLab = useCallback((label = "manual") => {
    try {
      const data = {
        version: 1,
        timestamp: Date.now(),
        label,
        labState,
        research
      };
      const json = JSON.stringify(data);
      localStorage.setItem(LAB_SAVE_KEY, json);
      console.log("💾 Sauvegarde enregistrée (" + label + ")");
    } catch (err) {
      console.error("Erreur de sauvegarde :", err);
    }
  }, [labState]);

  const loadLab = useCallback(() => {
    try {
      const json = localStorage.getItem(LAB_SAVE_KEY);
      if (!json) return null;
      const data = JSON.parse(json);
      if (!data || !data.labState) return null;
      console.log("📂 Sauvegarde chargée (" + new Date(data.timestamp).toLocaleString() + ")");
      // remove guidance pour la regenerer
      data.labState.guidance={ active: [], history: data.labState.guidance.history};
      setLabState(data.labState);
      if(typeof setResearch=='function' && data.research!=null)
      setResearch(data.research);
      return data.labState;
    } catch (err) {
      console.error("Erreur de chargement :", err);
      return null;
    }
  }, [setLabState]);

  const clearLab = useCallback(() => {
    localStorage.removeItem(LAB_SAVE_KEY);
    setLabState(INITIAL_STATE);
    setResearch({
    unlockedGenes: [],
    ongoing: null, // {id, progress, cost, target}
    completed: [],
    points: 1,
  })
    console.log("🧹 Sauvegarde supprimée");
  }, [setLabState]);

  // autosave toutes les 30 secondes si demandé
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(() => saveLab("auto"), 30000);
    return () => clearInterval(interval);
  }, [auto, saveLab]);

  return { saveLab, loadLab, clearLab };
}
export function applyResearchProgress(lab, research) {

  if (!research.current.ongoing) return lab;

  const r = research.current.ongoing;
  const data = RESEARCH_DATA.find(d => d.id === r.id);
  if (!data) return lab;

  // progression : dépend de la vitesse de recherche (points / coût)
  const speed = 1; // modifiable plus tard par des upgrades
  r.progress += speed;

  if (r.progress >= data.duration) {
    // recherche terminée
    research.current.completed.push(r.id);
    research.current.ongoing = null;

    // appliquer l'effet
    switch (data.type) {
      case "geneUnlock":
        research.current.unlockedGenes.push(data.target);
        break;
      case "statBoost":
        lab.bacteria.forEach(b => {
          if (b.dna[data.target.field] != null)
            b.dna[data.target.field] *= data.target.multiplier;
        });
        break;
      case "globalUpgrade":
        lab.reactors.forEach(rct => {
          rct.efficiency += data.target.bonus;
        });
        break;
      case "unlockMachine":
        if (!lab.unlockedMachines) lab.unlockedMachines = [];
        lab.unlockedMachines.push(data.target);
        break;
      default:
        break;
    }
  }

  return lab;
}

export function applyBacteriaGrowth(lab) {
  const { resources } = lab;

  lab.bacteria = lab.bacteria.map(b => {
    let updated = { ...b };

    // 1. Régénération naturelle (repos ou stockage)
    // dépend de la disponibilité en nutriments et de la résilience
   // const nutrientFactor = Math.min(1, resources.nutrients / 20); // plus douce que la prod
    const regen = 0.05 * updated.stability * updated.dna.resilience;
    updated.health = Math.min(100, updated.health + regen);

    // 2. Dégradation passive (vieillissement + pollution ambiante)
    const contaminationStress = (resources.contamination || 0) * 0.005; // taux plus faible que dans les réacteurs
    const naturalDecay = 0.005; // vieillissement minimal
    updated.health = Math.max(0, updated.health - contaminationStress - naturalDecay);

    // 3. Stabilité et mutations lentes
    // Mutation lente : dépend de mutationChance mais amortie par la stabilité
    const mutationOdds = updated.mutationChance * (1 - updated.stability) * 0.3;
    if (Math.random() < mutationOdds) {
      updated.status = "mutated";
      updated.dna.efficiency *= 0.95 + Math.random() * 0.1;
      updated.dna.resilience *= 0.95 + Math.random() * 0.1;
      if (lab.logs)
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `${updated.name} a subi une mutation spontanée.`,
          time: Date.now()
        });
    }

    // 4. Mort ou stabilisation
    if (updated.health <= 0) {
      updated.status = "dead";
      if (lab.logs)
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `${updated.name} est morte.`,
          time: Date.now()
        });
    } else if (updated.status === "mutated" && Math.random() < updated.stability * 0.1) {
      updated.status = "stable";
      updated.stability = Math.min(1, updated.stability + 0.05);
      if (lab.logs)
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `${updated.name} s'est stabilisée après mutation.`,
          time: Date.now()
        });
    }

    return updated;
  });

  return lab;
}

export function applyMachinesProcess(lab) {
  if (!lab.machines || lab.machines.length === 0) return lab;

  lab.machines.forEach((machineInstance) => {
    const machineDef = MACHINE_DATA.find((m) => m.id === machineInstance.id);
    if (!machineDef || machineInstance.stoppedReason === 'stoppedManually') return;
    machineInstance.active = true;
    machineInstance.stoppedReason = null;
    //usure de la machine
    if (machineInstance.status != null)
      machineInstance.status = Math.max(0, (machineInstance.status - lab.resources.waste * 0.00002));
    else
      machineInstance.status = machineDef.status;
    if (machineInstance.status <= 0) {
      machineInstance.active = false;
      machineInstance.stoppedReason = "Machine en trop mauvais etat.. Reparer !"
      return;
    }
    // Consommation d’énergie
    if (!machineDef.costOnUse && lab.resources.energy < machineDef.powerUsage) {
      // Pas assez d’énergie → machine en pause
      machineInstance.active = false;
      machineInstance.stoppedReason = "Pas assez d’énergie → machine en pause"
      return;
    }
    if (!machineDef.costOnUse)
      lab.resources.energy -= machineDef.powerUsage;



    // Application de l’effet
    try {
      if (typeof machineDef.effect === 'function')
        machineDef.effect(lab);
    } catch (err) {
      console.error(`Erreur dans la machine ${machineDef.name}:`, err);
    }

    // Optionnel : enregistre le dernier effet
    machineInstance.lastTickEffect = Date.now();
  });

  return lab;
}
export function applyReactorProcesses(lab) { //Production
  
  const newResources = { ...lab.resources };

  lab.reactors.forEach(r => {
    if (r.status !== "running") return;
    r.stoppedReason = null;
    r.assignedBacteria.forEach(bId => {
      const b = lab.bacteria.find(x => x.id === bId);
      if (!b || b.health <= 0){
         r.status = 'maintenance';
        const msg = 'Reacteur ' + r.name + ' en arret, car '+b.name+' est morte';
        r.stoppedReason = msg;
        lab.logs.push({ id: crypto.randomUUID(), message: msg, severity:'error', time: Date.now() })
   
 return;
      }
const tempPenalty = Math.abs(r.temperature - b.optimalTemp) / 50;
const oxyPenalty = Math.abs(r.oxygenLevel - b.optimalOxygen) / 100;
const efficiency = Math.max(0, b.dna.efficiency * (1 - tempPenalty - oxyPenalty) * r.efficiency);

      // Consommation
      const energyUsed = b.baseEnergyCost * r.efficiency;
      const nutrientUsed = b.baseNutrientCost * r.nutrientFlow * r.efficiency;
      if (newResources.energy < energyUsed || newResources.nutrients < nutrientUsed) {
        r.status = 'maintenance';
        const msg = 'Reacteur ' + r.name + ' stoppé pour cause de manque ' + (newResources.energy < energyUsed ? "d'energie" : "de nutriments");
        r.stoppedReason = msg;
        lab.logs.push({ id: crypto.randomUUID(), message: msg, severity:'error', time: Date.now() })
        return;
      }

      newResources.energy -= energyUsed;
      newResources.nutrients -= nutrientUsed;

      // Production
      let totalProduced = 0;
      const yieldMod = b.baseYield * efficiency;
      const produced = 1+10*yieldMod * (b.health / 100) * efficiency;
      const waste = produced * b.wasteRate;
      totalProduced += produced;
      b._lastProduced = produced;
      b._lastWaste = waste;
      b._mutatedThisTick = false; // reset earlier, set true if mutation occurs


      b.product.forEach(pdt => {
        // can be biomasse, adn_brut,toxine,acideHcl, ??
        const rentable = (pdt.rentability || 1) * efficiency;
        if (newResources[pdt.name] == null)
          {
            newResources[pdt.name] = produced * rentable;
           lab.logs.push({ id: crypto.randomUUID(), message: `Premiere production de  ${pdt.name} pour un rendement de ${produced * rentable} $/sec`,severity:'success', time: Date.now() })
  
          }
        else
          newResources[pdt.name] += produced * rentable;
        if (pdt.value)
          newResources.credits += produced * pdt.value;
        totalProduced += (produced * rentable);
        if (pdt.greenWashing != null)
          newResources.reputation = Math.max(5,Math.min(100, Math.max(0, newResources.reputation + pdt.greenWashing)));

      })
      newResources.waste += waste;
      r.productionBySecond = totalProduced;

      //usure
      const stressFactor = (tempPenalty + oxyPenalty) * 50; // ex : 0–100
      if (Math.random() < 0.05 + stressFactor * 0.002) {
        r.efficiency *= 0.98 + Math.random() * 0.02;
      }
      if (r.efficiency < 0.05) {
        r.status = 'maintenance';
        r.stoppedReason = "Machine hors d'usage"
         lab.logs.push({ id: crypto.randomUUID(), message: `Reacteur ${r.name} hors d'usage. Arreté pour maintenance`,severity:'error', time: Date.now() })
      }

      // Mise à jour de la souche
      b.health = Math.max(0, b.health - Math.log1p(waste) * 0.1); // déchets = stress
     b.stability = Math.max(0, b.stability - b.mutationChance * 0.01);



      // Mutation aléatoire
      triggerSpontaneousMutation(b, lab);
      
    });
  });

  return {...lab, resources:newResources};
}

export function applyWasteAndDecay(lab, research) {
  const { resources } = lab;
  if (!resources) return lab;

  // --- 1. Croissance naturelle de la contamination selon les déchets ---
  const baseWaste = resources.waste || 0;
  let wasteGrowth = baseWaste * 0.0025; // vitesse de propagation naturelle

  // Certains réacteurs contaminés aggravent le problème
  lab.reactors.forEach(rct => {
    if (Math.random() < (rct.contaminationRisk || 0)) {
      wasteGrowth *= 1.5 + Math.random(); // contamination imprévisible
      lab.logs.push({
        id: crypto.randomUUID(),
        message: `⚠️ Incident de contamination détecté dans ${rct.name}`,
        severity: 'urgent',
        time: Date.now(),
      });
    }
  });

  // --- 2. Mise à jour de la contamination et réputation ---
  // Si beaucoup de déchets, la contamination augmente
  resources.contamination = Math.min(1, resources.contamination + wasteGrowth / 100);

  // Impact de la contamination sur la réputation
  const repDrop = wasteGrowth * 0.1 + (resources.contamination * 2);
  resources.reputation = Math.max(0, Math.min(100, resources.reputation - repDrop));

  // --- 3. Effets extrêmes ---
  // Trop de déchets = intervention environnementale
  if (baseWaste > 100 && !lab._wasteCrisis) {
    lab._wasteCrisis = true;
    lab.reactors.forEach(r => {
        r.status = 'maintenance';
        r.stoppedReason="Trop de dechets. Laboratoire arretée par les associations de l'environnement."
    });
    lab.logs.push({
      id: crypto.randomUUID(),
      message: "🚨 Trop de déchets ! L'agence environnementale ordonne la fermeture temporaire des réacteurs.",
      severity: "error",
      time: Date.now(),
    });
  }

  // Bonne gestion : si les déchets redescendent, on peut relancer
  if (lab._wasteCrisis && baseWaste < 30) {
    lab._wasteCrisis = false;
    lab.reactors.forEach(r => {
        r.status = 'running';
        r.stoppedReason=null;
    });
    lab.logs.push({
      id: crypto.randomUUID(),
      message: "✅ Les inspecteurs lèvent la sanction : réacteurs autorisés à redémarrer.",
      severity: "success",
      time: Date.now(),
    });
  }

  // Réputation désastreuse : fermeture administrative
  if (resources.reputation < 5 && !lab._repCrisis) {
    lab._repCrisis = true;
    lab.reactors.forEach(r => {
        r.status = 'maintenance';
        r.stoppedReason="Reputation desastreuse. Pression mediatique et manifestations empechent le labo de tourner."
    });
    lab.logs.push({
      id: crypto.randomUUID(),
      message: "💀 Scandale public ! Les médias s'emparent du dossier, le site est fermé temporairement.",
      severity: "error",
      time: Date.now(),
    });
  }

  // Redressement d'image
  if (lab._repCrisis && resources.reputation > 20) {
    lab._repCrisis = false;
    lab.logs.push({
      id: crypto.randomUUID(),
      message: "📈 Le vent tourne ! Votre réputation s’améliore, les opérations reprennent.",
      severity: "success",
      time: Date.now(),
    });
  }

  // --- 4. Bonus écologiques (réputation haute = récompense) ---
  if (resources.reputation > 80) {
    const bonus = (resources.reputation - 80) * 0.001;
    const addedResearch = bonus * (resources.adn_brut?.length || 1);
    if (research?.current) research.current.points += addedResearch;
  }

  // --- 5. Dégradation naturelle des déchets ---
  resources.waste = Math.max(0, baseWaste - (baseWaste * 0.01)); // 1% traité naturellement

  return lab;
}


export function updateProductMarket(market) {

  const newprices = market.prices.map(p => {
    const change = (Math.random() - 0.5) * p.volatility;
    const newValue = Math.max(0.1, p.value * (p.trend + change));
    const updatedHistory = [...p.history.slice(-20), newValue];
    return { ...p, value: newValue, history: updatedHistory };
  });
  return { ...market, prices: newprices };
}

/**
 * applyGeneToBacterium(lab, bactId, geneId)
 * - mutative: modifie et retourne lab pour usage direct dans setLabState
 * - idempotent : si le gène est déjà présent, ne ré-applique pas les effets 'appliedOnce'
 */
export function applyGeneToBacterium(lab, research, bactId, geneId) {
  if (!lab) return lab;
  const geneDef = GENE_DATA.find(g => g.id === geneId);
  if (!geneDef) {
    // pas de définition → rien à faire
    if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Gène inconnu: ${geneId}`, time: Date.now() });
    return lab;
  }

  // vérif recherche unlock (assomption: lab.research.unlockedGenes existe)
  const unlocked = research?.unlockedGenes ?? null;
  if (Array.isArray(unlocked) && !unlocked.includes(geneId)) {
    if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Gène non débloqué: ${geneId}`, time: Date.now() });
    return lab;
  }

  const bIdx = (lab.bacteria || []).findIndex(b => b.id === bactId);
  if (bIdx === -1) {
    if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Bactérie introuvable: ${bactId}`, time: Date.now() });
    return lab;
  }

  const bact = lab.bacteria[bIdx];

  // init genes array if missing
  if (!Array.isArray(bact.genes)) bact.genes = [];

  // si already present -> nothing to do
  if (bact.genes.includes(geneId)) {
    if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Gène ${geneId} déjà présent sur ${bact.name}`, time: Date.now() });
    return lab;
  }

  // marque le gène
  bact.genes = [...bact.genes, geneId];

  // appliquer effets
  geneDef.effects?.forEach(effect => { //catalogue des function pour les genes
    switch (effect.type) {
      case "addProduct": {
        const payload = effect.payload;
        if (!Array.isArray(bact.product)) bact.product = [];
        const existing = bact.product.find(p => p.name === payload.name);
        if (existing) {
          // merge : augmenter rentability/value modestement
          existing.rentability = Math.max(existing.rentability || 0, payload.rentability || 0);
          if (payload.value) existing.value = (existing.value || 0) + payload.value;
          if (payload.greenWashing) existing.greenWashing = (existing.greenWashing || 0) + payload.greenWashing;
        } else {
          // push a shallow copy
          bact.product.push({ ...payload });
        }
        break;
      }

      case "modifyDNA": {
        const { field, multiplier } = effect.payload || {};
        if (!bact.dna) bact.dna = {};
        if (typeof multiplier === "number") {
          bact.dna[field] = (bact.dna[field] ?? 1) * multiplier;
        }
        break;
      }

      case "setDNA": {
        const { field, value } = effect.payload || {};
        if (!bact.dna) bact.dna = {};
        bact.dna[field] = value;
        break;
      }

      // tu peux ajouter d'autres types : addGeneFlag, removeProduct, etc.
      default:
        // unknown effect type -> log
        if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Effet inconnu pour ${geneId}: ${effect.type}`, time: Date.now() });
    }
  });

  // log success
  if (lab.logs) lab.logs.push({ id: crypto.randomUUID(), message: `Gène ${geneId} appliqué à ${bact.name}`, time: Date.now() });

  // replace bacteria array (immutability-friendly)
  lab.bacteria = [...lab.bacteria.slice(0, bIdx), bact, ...lab.bacteria.slice(bIdx + 1)];

  return lab;
}

/**
 * applyGeneImmediateEffects(lab, bact, geneDef)
 * - applique les effets immédiats (addProduct, modifyDNA, setDNA, modifyStat, addFlag, removeProduct, grantResource)
 * - enregistre les effets tick (onCoexistenceDamage, onCoexistenceDrain, onProduceRecycle, onMutationSpawnGene)
 *
 * NOTE: lab.logs est utilisé si présent.
 */
export function applyGeneImmediateEffects(lab, bact, geneDef) {
  if (!lab || !bact || !geneDef) return lab;

  // ensure container for tick effects on bacterium
  if (!Array.isArray(bact._geneTickEffects)) bact._geneTickEffects = [];

  geneDef.effects?.forEach((effect) => {
    const t = effect.type;

    // ---- Effets immédiats simples (synchrone) ----
    if (t === "addProduct") {
      const payload = effect.payload || {};
      if (!Array.isArray(bact.product)) bact.product = [];
      const existing = bact.product.find((p) => p.name === payload.name);
      if (existing) {
        // fusion prudente (idempotence)
        existing.rentability = Math.max(existing.rentability || 0, payload.rentability || 0);
        if (payload.value) existing.value = (existing.value || 0) + payload.value;
        if (payload.greenWashing) existing.greenWashing = (existing.greenWashing || 0) + payload.greenWashing;
      } else {
        bact.product.push({ ...payload });
      }
      return;
    }

    if (t === "modifyDNA") {
      const { field, multiplier, additive } = effect.payload || {};
      if (!bact.dna) bact.dna = {};
      if (typeof multiplier === "number") {
        bact.dna[field] = (bact.dna[field] ?? 1) * multiplier;
      } else if (typeof additive === "number") {
        bact.dna[field] = (bact.dna[field] ?? 0) + additive;
      }
      return;
    }

    if (t === "setDNA") {
      const { field, value } = effect.payload || {};
      if (!bact.dna) bact.dna = {};
      bact.dna[field] = value;
      return;
    }

    if (t === "modifyStat") {
      // modifie directement les champs de la bactérie (baseYield, baseEnergyCost, baseNutrientCost, stability, mutationChance, wasteRate, etc.)
      const { field, multiplier, additive } = effect.payload || {};
      if (typeof multiplier === "number") {
        bact[field] = (bact[field] ?? 0) * multiplier;
      } else if (typeof additive === "number") {
        bact[field] = (bact[field] ?? 0) + additive;
      }
      return;
    }

    if (t === "addFlag") {
      const { flag } = effect.payload || {};
      if (!Array.isArray(bact.flags)) bact.flags = [];
      if (flag && !bact.flags.includes(flag)) bact.flags.push(flag);
      return;
    }

    if (t === "removeProduct") {
      const { name } = effect.payload || {};
      if (name && Array.isArray(bact.product)) {
        bact.product = bact.product.filter((p) => p.name !== name);
      }
      return;
    }

    if (t === "grantResource") {
      // immédiat : rajoute des ressources au lab (crédits, energy, nutrients, etc.)
      // --- DÉPEND D'API LAB: si setLabState intercepte, mieux vaut utiliser wrapper expose addResource.
      const payload = effect.payload || {};
      Object.keys(payload).forEach((k) => {
        lab.resources = lab.resources || {};
        lab.resources[k] = (lab.resources[k] || 0) + payload[k];
      });
      (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `Gène ${geneDef.id} a accordé ${JSON.stringify(payload)}`, time: Date.now() });
      return;
    }

    // ---- Effets périodiques / événementiels (onTick) ----
    if (t === "onCoexistenceDamage" || t === "onCoexistenceDrain" || t === "onProduceRecycle" || t === "onMutationSpawnGene") {
      // enregistrer l'effet pour traitement chaque tick
      bact._geneTickEffects.push({ geneId: geneDef.id, effect });
      return;
    }

    // ---- Effet inconnu ----
    (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `Effet inconnu pour ${geneDef.id}: ${t}`, time: Date.now() });
  });

  return lab;
}
export function triggerSpontaneousMutation(b, lab) {
  const mutationBaseChance = b.mutationChance || 0.01;

  const stress =
    (lab.resources.contamination || 0) / 200 +
    (1 - b.health / 100) +
    (1 - b.stability);

  const mutationChance = mutationBaseChance * (1 + stress * 2)*0.1;// 10% de chance que ce soit une mutation avec effet

  if (Math.random() < mutationChance) {
    b.status = "mutated";
    b.level++;
    const roll = Math.random();

    // 30% : gain de gène inconnu
    if (roll < 0.3) {
      const available = GENE_DATA.map(g => g.id).filter(id => !b.genes.includes(id));
      if (available.length > 0) {
        const pick = available[Math.floor(Math.random() * available.length)];
        b.genes.push(pick);
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `🧬 La souche ${b.name} a acquis un nouveau gène : ${pick}`,
          severity: "info",
          time: Date.now(),
        });
      }

    // 20% : perte ou désactivation d’un gène
    } else if (roll < 0.5 && b.genes.length > 0) {
      const lost = b.genes[Math.floor(Math.random() * b.genes.length)];
      if (Math.random() < 0.5) {
        // perte définitive
        b.genes = b.genes.filter(g => g !== lost);
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `⚠️ Mutation délétère : la souche ${b.name} a perdu le gène ${lost}`,
          severity: "warn",
          time: Date.now(),
        });
      } else {
        // désactivation (inexpression)
        if (!b.inexpressedGenes) b.inexpressedGenes = [];
        b.inexpressedGenes.push(lost);
        lab.logs.push({
          id: crypto.randomUUID(),
          message: `🧫 Le gène ${lost} de ${b.name} devient inactif.`,
          severity: "debug",
          time: Date.now(),
        });
      }

    // 50% : altération physiologique
    } else {
      const numericFields = [
        "baseYield",
        "baseEnergyCost",
        "baseNutrientCost",
        "optimalTemp",
        "optimalOxygen",
        "wasteRate",
      ];
      const dnaFields = ["efficiency", "resilience", "purity"];
      const allFields = numericFields.concat(dnaFields);
      const field = allFields[Math.floor(Math.random() * allFields.length)];

      const factor = 0.8 + Math.random() * 0.4; // entre -20% et +20%
      if (dnaFields.includes(field)) {
        b.dna[field] *= factor;
      } else {
        b[field] *= factor;
      }

      lab.logs.push({
        id: crypto.randomUUID(),
        message: `🧪 Mutation physiologique : ${b.name} voit sa propriété ${field} modifiée (${(factor * 100).toFixed(0)}%)`,
        severity: "info",
        time: Date.now(),
      });
    }

    // Impact global sur stabilité et santé
    b.stability = Math.max(0, b.stability - (0.01 + Math.random() * 0.05));
    b.health = Math.max(10, b.health  - Math.random());
  }

  return b;
}

/**
 * processGeneTickEffects(lab, researchRef)
 *
 * - à appeler chaque tick (ou à intervalle) dans ta boucle principale.
 * - researchRef = research.current (tu m'as rappelé la structure)
 *
 * Implémente :
 * - onCoexistenceDamage: lorsque plusieurs souches dans même réacteur, chance de blesser/kill autres souches.
 * - onCoexistenceDrain: drainer energy/nutrients depuis autres souches vers la souche porteuse.
 * - onProduceRecycle: convertir une fraction du waste généré par la souche en credits automatiquement.
 * - onMutationSpawnGene: lors d'une mutation (détectée par mutationChance), tenter d'ajouter un gene à research.current.unlockedGenes.
 *
 * Attention : certaines actions modifient lab.bacteria (donc on boucle sur une copie).
 */
export function processGeneTickEffects(lab, researchRef) {
  if (!lab || !Array.isArray(lab.reactors)) return lab;
  const now = lab.time ?? Date.now();

  // Helper: find reactor id containing a bacterium id
  const findReactorContaining = (bactId) => lab.reactors.find((r) => (r.assignedBacteria || []).includes(bactId));

  // We'll collect mutations/unlocks to avoid mutating arrays while iterating
  const unlocksToAdd = new Set();

  // loop through reactors then bacteria in them to have context (coexistence)
  lab.reactors.forEach((reactor) => {
    const assigned = (reactor.assignedBacteria || []).slice(); // copy
    assigned.forEach((bId) => {
      const b = lab.bacteria.find((x) => x.id === bId);
      if (!b) return;
      const effects = b._geneTickEffects || [];
      effects.forEach((record) => {
        const effect = record.effect;
        const payload = effect.payload || {};
        const geneId = record.geneId;

        // onCoexistenceDamage: si d'autres souches sont présentes, chance de les endommager
        if (effect.type === "onCoexistenceDamage") {
          const chance = payload.chancePerTick ?? 0;
          if (Math.random() < chance) {
            // target random other bacterium in same reactor
            const others = assigned.filter((id) => id !== bId);
            if (others.length > 0) {
              const targetId = others[Math.floor(Math.random() * others.length)];
              const target = lab.bacteria.find((x) => x.id === targetId);
              if (target) {
                target.health = Math.max(0, (target.health ?? 100) - (payload.damage || 10));
                (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `Épidémie from ${b.name} (${geneId}) a blessé ${target.name} (-${payload.damage || 10}hp)`, time: Date.now() });
                // optional: kill
                if (target.health <= 0) {
                  target.status = "dead";
                  (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `${target.name} est morte suite à une épidémie.`, time: Date.now() });
                }
              }
            }
          }
        }

        // onCoexistenceDrain: drainer énergie/nutriments des autres souches pour alimenter la source
        if (effect.type === "onCoexistenceDrain") {
          const drainEnergy = payload.energyDrainPerTick ?? 0;
          const drainNutrient = payload.nutrientDrainPerTick ?? 0;
          const others = assigned.filter((id) => id !== bId);
          if (others.length > 0 && (drainEnergy > 0 || drainNutrient > 0)) {
            // répartir le drain sur les autres
            const perOtherEnergy = drainEnergy / others.length;
            const perOtherNutr = drainNutrient / others.length;
            others.forEach((oid) => {
              const ob = lab.bacteria.find((x) => x.id === oid);
              if (!ob) return;
              // on suppose ob a health/energy? on diminue health as proxy for resource drain
              ob.health = Math.max(0, (ob.health ?? 100) - perOtherEnergy * 0.5); // approximatif
            });
            // bonus to source (increase health slightly or product?)
            b.health = Math.min(100, (b.health ?? 100) + (drainEnergy * 0.2));
            (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `${b.name} a pompé de l'énergie aux voisines.`, time: Date.now() });
          }
        }

        // onProduceRecycle: convert a fraction of waste produced by that bacterium into credits
        if (effect.type === "onProduceRecycle") {
          const fraction = payload.fraction ?? 0;
          const creditPerUnit = payload.creditPerUnit ?? 1;
          // We need to know how much waste this bact generated THIS tick.
          // If you don't track per-bacterium waste, approximate using wasteRate * produced (if available).
          // We'll attempt a best-effort: if b._lastProduced exists (you could set it in applyReactorProcesses), use it.
          const produced = b._lastProduced ?? 0;
          const recovered = produced * (b.wasteRate ?? 0) * fraction;
          if (recovered > 0) {
            lab.resources = lab.resources || {};
            lab.resources.waste = Math.max(0, (lab.resources.waste || 0) - recovered);
            lab.resources.credits = (lab.resources.credits || 0) + recovered * creditPerUnit;
            (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `${b.name} a recyclé ${recovered.toFixed(2)} déchets en ${ (recovered*creditPerUnit).toFixed(1) }₡`, time: Date.now() });
          }
        }

        // onMutationSpawnGene: chance when mutation occurs to unlock new gene in research
        if (effect.type === "onMutationSpawnGene") {
          // This effect is best triggered when a mutation is detected.
          // We can't detect mutation here unless your mutation detection runs earlier and sets b._mutatedThisTick = true
          if (b._mutatedThisTick) {
            const chance = payload.chancePerMutation ?? payload.chancePerMutation ?? 0;
            if (Math.random() < chance) {
              // choose candidate gene(s) to unlock
              const candidate = payload.candidates ?? null; // optional list in effect payload
              if (Array.isArray(candidate) && candidate.length > 0) {
                const pick = candidate[Math.floor(Math.random() * candidate.length)];
                unlocksToAdd.add(pick);
              } else {
                // fallback: pick random gene from GENE_DATA that is not unlocked
                const all = GENE_DATA.map(g => g.id);
                const unlocked = (researchRef?.current?.unlockedGenes) ?? (lab.research?.unlockedGenes ?? []);
                const choices = all.filter(id => !unlocked.includes(id));
                if (choices.length > 0) {
                  const pick = choices[Math.floor(Math.random() * choices.length)];
                  unlocksToAdd.add(pick);
                }
              }
            }
          }
        }
      }); // end effects for bacterium
    }); // end assigned bacteria
  }); // end reactors

  // apply unlocks to researchRef (if provided) or to lab.research (fallback)
  if (unlocksToAdd.size > 0) {
    const picks = Array.from(unlocksToAdd);
    if (researchRef && researchRef.current) {
      researchRef.current.unlockedGenes = Array.from(new Set([...(researchRef.current.unlockedGenes || []), ...picks]));
      (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `Nouveaux gènes découverts par mutation : ${picks.join(", ")}`, time: Date.now() });
    } else {
      // fallback: lab.research (if you keep that)
      lab.research = lab.research || { unlockedGenes: [] };
      lab.research.unlockedGenes = Array.from(new Set([...(lab.research.unlockedGenes || []), ...picks]));
      (lab.logs || []).push?.({ id: crypto.randomUUID(), message: `Nouveaux gènes découverts : ${picks.join(", ")}`, time: Date.now() });
    }
  }

  return lab;
}




