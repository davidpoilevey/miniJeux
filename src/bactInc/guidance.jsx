

// guidanceEngine.js
export const GUIDANCE_RULES = (api = {}) => [
  {
    id: "low_energy",
    name: "Énergie faible",
    severity: "high",
    check: (lab) => (lab.resources?.energy ?? 0) < 20,
    clearCheck: (lab) => (lab.resources?.energy ?? 0) > 40,
    message: (lab) => `Énergie faible : ${Math.round(lab.resources?.energy ?? 0)} ⚡`,
    hints: [
      { label: "Acheter un bidon d'essence (100⚡ pour 200₡)", action: (api) => {
        api.addResource?.("energy", 100);
         api.addResource?.("credits", -200);
      } },
      { label: "Aller acheter une source d'energie", action: (api) => api.goto?.('market') },
    ],
    cooldown: 8,
  },

  {
    id: "reactor_stopped",
    name: "Reacteur arreté",
    severity: "high",
    check: (lab) => (lab.reactors?.some(r=>r.status=='maintenance')),
    clearCheck: (lab) => lab.reactors?.filter(r=>r.status!=='running')==0,
    message: (lab) => `Reacteur arreté, surement a cause d'une panne d'⚡`,
    hints: [
      { label: "Redemarrer tous les reacteurs", action: (api) => api.activateReactors?.() },
    ],
    cooldown: 5,
  },

  {
    id: "low_nutrients",
    name: "Nutriments faibles",
    severity: "high",
    check: (lab) => (lab.resources?.nutrients ?? 0) < 20,
    clearCheck: (lab) => (lab.resources?.nutrients ?? 0) > 50,
    message: (lab) => `Nutriments faibles : ${Math.round(lab.resources?.nutrients ?? 0)}`,
    hints: [
       { label: "Acheter des nutriments", action: (api) => api.goto?.('market') },
      { label: "Arrêter un réacteur", action: (api) => api.stopSomeReactor?.() },
    ],
    cooldown: 8,
  },

  {
    id: "low_credits",
    name: "Crédits faibles",
    severity: "medium",
    check: (lab) => (lab.resources?.credits ?? 0) < 100,
    clearCheck: (lab) => (lab.resources?.credits ?? 0) > 300,
    message: (lab) => `Crédits bas : ${Math.round(lab.resources?.credits ?? 0)} ₡`,
    hints: [
      { label: "Vendre du stock", action: (api) => api.goto?.('market') },
      { label: "Signer des contrat, virer le grouillot ou arretez de depenser merde !", conseil:true },
    ],
    cooldown: 20,
  },

  {
    id: "low_reputation",
    name: "Réputation en baisse",
    severity: "high",
    check: (lab) => (lab.resources?.reputation ?? 0) < 30,
    clearCheck: (lab) => (lab.resources?.reputation ?? 0) > 45,
    message: (lab) => `Réputation : ${Math.round(lab.resources?.reputation ?? 0)}%`,
    hints: [
      { label: "Soigner son image", action: (api) => {
        api.goto('market')
      } },
      {label:"Payer un influenceur (200₡)", action:(api,labState)=>{
if(labState.resources.credits>200){
         api.addResource('credits',-200);
         api.addResource('reputation',Math.max(10,Math.min(100,labState.resources.reputation+(Math.random()*10))));
            api.addLog("Vous avez sponsorisé une video de Squeezie... Bons retours, mais mauvaise audience", 'urgent')
          }
          else
            api.addLog("Pas assed de thunes", 'urgent');
       } 
      },
      { label: "Chercher plus ethique a produire", conseil:true
        , action: (api) => api.goto?.('recherche') },
    ],
    cooldown: 30,
  },

  {
    id: "machine_broken",
    name: "Machine endommagée",
    severity: "high",
    check: (lab) => (lab.machines ?? []).some(m => (m.status ?? 1) < 0.3),
    clearCheck: (lab) => !(lab.machines ?? []).some(m => (m.status ?? 1) < 0.5),
    message: (lab) => {
      const m = (lab.machines ?? []).find(m => (m.status ?? 1) < 0.3);
      return m ? `Machine cassée : ${m.name}` : "Machine cassée";
    },
    hints: [
      { label: "Réparer la machine (cliquer dessus pour trouver la bouton reparation)",conseil:true},
    ],
    cooldown: 10,
  },

  {
    id: "contamination_high",
    name: "Contamination élevée",
    severity: "critical",
    check: (lab) => (lab.resources?.contamination ?? 0) > 0.5,
    clearCheck: (lab) => (lab.resources?.contamination ?? 0) < 0.5,
    message: (lab) => `Contamination : ${(lab.resources?.contamination ?? 0).toFixed(2)}`,
    hints: [
      { label: "Activer stérilisateur UV"
        , action: (api) => api.activateMachine?.("sterilisateur_uv")
      , disabled:api=>!api.hasMachine("sterilisateur_uv") },
      { label: "Acheter du materiel de filtrage", action: (api) => api.goto?.('market') },
    ],
    cooldown: 30,
  },

  {
    id: "waste_high",
    name: "Trop de déchets",
    severity: "medium",
    check: (lab) => (lab.resources?.waste ?? 0) > 50,
    clearCheck: (lab) => (lab.resources?.waste ?? 0) < 20,
    message: (lab) => `Déchets : ${Math.round(lab.resources?.waste ?? 0)}`,
    hints: [
      { label: "Activer filtre", action: (api) => api.activateMachine?.("filtre") },
      { label: "Vendre déchets", action: (api) => api.sellResource?.("waste", 10) },
    ],
    cooldown: 20,
  },

  {
    id: "bacteria_low_health",
    name: "Souche en mauvaise santé",
    severity: "medium",
    check: (lab) => (lab.bacteria ?? []).some(b => b.health < 30 && b.status !== "dead"),
    clearCheck: (lab) => !(lab.bacteria ?? []).some(b => b.health < 40 && b.status !== "dead"),
    message: (lab) => {
       const b = (lab.bacteria ?? []).find(b => b.health < 30 && b.status !== "dead");
       return b ? `Souche faible : ${b.name}` : `Souche faible`;
    },
    hints: [
      { label: "Transférer souche", action: (api) => api.transferBacteria?.() },
    ],
    cooldown: 15,
  },
];

export const RANDOM_EVENTS = [
  {
    id: "market_crash",
    name: "Chute du marché",
    probabilityPerTick: 0.001,
    description: "La demande s'effondre, baisse temporaire des prix.",
    onTrigger: (lab, api) => {
      // ex : baisser la tendance de certains products
      if (lab.market) {
        Object.values(lab.market.prices).forEach(p => p.base *= 0.7);
      }
      // push an advice
      if (!lab.guidance) lab.guidance = { active: [], history: [] };
      lab.guidance.active.push({
        ruleId: "event_market_crash",
        name: "Chute du marché",
        severity: "high",
        firstSeenAt: lab.time,
        lastSeenAt: lab.time,
        firedCount: 1,
        message: "Chute des prix : verifiez la bourse... Et sinon, ca vous interesse, ca ?",
        hints: [{ label: "Acheter influenceur (+ 20 reputation, -100$)", action: (api, labState) => {
          if(labState.resources.credits>100){
         api.addResource('credits',-100);
         api.addResource('reputation',20);
            api.addLog("Vous avez sponsorisé une video de Dirty Biology... Bons retours")
          }
          else
            api.addLog("Pas assed de thunes");
       } }]
      });
      api.addLog?.("Événement : chute du marché détectée. Les prix s'effondrent");
    }
  },

  {
    id: "virus_outbreak",
    name: "Virus",
    probabilityPerTick: 0.0005,
    onTrigger: (lab, api) => {
      // augmente contamination & fait tomber health de quelques souches
      lab.resources.contamination = Math.min(1, (lab.resources.contamination || 0) + 0.2);
      (lab.bacteria || []).slice(0,2).forEach(b => { b.health = Math.max(0, b.health - 20); });
      api.addLog?.("Événement : un virus a abîmé des cultures. Toutes vos souches perdent 20% de santé");
    }
  },

  {
    id: "antifa",
    name: "Anti-fa attaque",
    probabilityPerTick: 0.0005,
    onTrigger: (lab, api) => {
      // fait baisser la reputation
      api.addResource('reputation', -20);
      api.addLog?.("Événement : Un groupuscule d'extreme-gauche a vandalisé votre labo, attirant l'attention inutilement, vous perdez en reputation");
    }
  }
];

// guidanceEngine.js (suite)
export function evaluateGuidance(lab, rules, api = {}) {
  // assure lab.guidance
  const nowTick = lab.time ?? Math.floor(Date.now() / 1000);
  if (!lab.guidance) lab.guidance = { active: [], history: [] };

  const active = lab.guidance.active || [];
  const history = lab.guidance.history || [];

  const newActive = [...active]; // clone to modify
  const byId = Object.fromEntries(newActive.map(a => [a.ruleId, a]));

  rules.forEach(rule => {
    const triggered = !!rule.check(lab);
    const cleared = rule.clearCheck ? !!rule.clearCheck(lab) : !triggered;

    const existing = byId[rule.id];

    // If rule currently active
    if (existing) {
      if (cleared) {
        // move to history and remove from active
        existing.lastSeenAt = nowTick;
        existing.clearedAt = nowTick;
        history.push(existing);
        delete byId[rule.id];
      } else {
        // still active → update timestamp
        existing.lastSeenAt = nowTick;
        existing.firedCount = (existing.firedCount || 0) + 1;
        byId[rule.id] = existing;
      }
      return;
    }

    // Not active now, but check if should be created
    if (triggered) {
      // Respect cooldown: check last fired timestamp in history or active
      const lastOccurrence = [...history.reverse(), ...newActive].find(h => h.ruleId === rule.id);
      if (lastOccurrence && typeof rule.cooldown === "number") {
        if ((nowTick - (lastOccurrence.lastSeenAt || lastOccurrence.firstSeenAt || 0)) < (rule.cooldown || 0)) {
          // still in cooldown → skip
          return;
        }
      }
      // Create new ActiveAdvice
      const advice = {
        ruleId: rule.id,
        name: rule.name,
        severity: rule.severity || "low",
        firstSeenAt: nowTick,
        lastSeenAt: nowTick,
        firedCount: 1,
        message: typeof rule.message === "function" ? rule.message(lab) : rule.message,
        hints: rule.hints || [],
      };
      byId[rule.id] = advice;
    }
  });

  // rebuild active array from byId
  const finalActive = Object.values(byId);

  lab.guidance = {
    active: finalActive,
    history,
  };

  // Optionally push logs for newly created advices
  finalActive.forEach(a => {
    // if firstSeenAt === nowTick, it's new this tick
    if (a.firstSeenAt === nowTick) {
      api.addLog?.(`[ALERTE] ${a.name} — ${a.message}`);
    }
  });

  return lab;
}
export function processRandomEvents(lab, events, api={}) {
  events.forEach(ev => {
    if (Math.random() < (ev.probabilityPerTick || 0)) {
      ev.onTrigger?.(lab, api);
    }
  });
  return lab;
}
