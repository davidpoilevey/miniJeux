import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { BACTERIA_DATA, BIO_REACTOR_DATA, GENE_DATA, MACHINE_DATA, MARKET_BASE, RESEARCH_DATA } from "./bactData";
import { evaluateGuidance, GUIDANCE_RULES, processRandomEvents, RANDOM_EVENTS } from "./guidance";
import { applyBacteriaGrowth, applyGeneToBacterium, applyMachinesProcess, applyReactorProcesses, applyResearchProgress, applyWasteAndDecay, processDNAResearch, processGeneTickEffects, updateProductMarket, useLabSave } from "./LabCtxtUtils";


const LabContext = createContext();

export const INITIAL_STATE = {
  time: 0,
  paused: false,
  nextDest: null,

  // --- Ressources globales ---
  resources: {
    credits: 1000,
    energy: 100,
    nutrients: 200,
    waste: 0,
    contamination: 0,
    reputation: 50,
    adn_brut: [], // bactID purifié
  },
  guidance: {
    active: [], // ActiveAdvice[]
    history: [], // pour traçabilité
  },
  unlockedMachines: ['filtre', 'pompeChaleur', 'panneauSolaire'],
  // --- Entités dynamiques ---
  reactors: [],   // unités de production
  bacteria: [],   // souches vivantes
  machines: [],   // modules techniques
  contracts: [],  // missions ou clients
 pendingMachineActions: [
    // { id: 'uuid', machineId: 'sequenceur_adn', actionId: 'useCRISPR', meta: { cost:40 }, createdAt: Date.now() }
  ],
  // --- Historique ou données dérivées ---
  logs: []
};

export function LabProvider({ children }) {
  const research = useRef({
    unlockedGenes: [],
    ongoing: null, // {id, progress, cost, target}
    completed: [],
    points: 1,
  });

  const startResearch = (r) => {
    if (research.current.ongoing) {
      addLog("Une recherche est déjà en cours !");
      return;
    }
    if (research.current.completed.includes(r.id)) {
      addLog(`${r.name} a déjà été complétée.`);
      return;
    }
    if (research.current.points < r.cost) {
      addLog("Pas assez de points de recherche !");
      return;
    }
    research.current = {
      ...research.current, points: research.current.points - r.cost,
      ongoing: { id: r.id, progress: 0, cost: r.cost, duration: r.duration }
    }
    addLog(`Recherche lancée : ${r.name}`);
  };

  const [market, setMarket] = useState(MARKET_BASE);
  const [labState, setLabState] = useState(INITIAL_STATE);
  function removeContract(ctrID) {
    const ctrct = market.contracts.find(c => c.id == ctrID);
    if (ctrct == null)
      addLog("Contract " + ctrID + " non trouvé")
    else {
      const recs = Object.keys(ctrct.reward);
      for (let i = 0; i < recs.length; i++) {
        addResource(recs[i], ctrct.reward[recs[i]]);
      }
      addLog(`Contrat "${ctrct.name}" accompli !`, 'success');
      setMarket(oldMrk => {
        return { ...oldMrk, contracts: oldMrk.contracts.filter(c => c.id != ctrID) }
      })
    }
  }

  function addResource(type, value) {

    setLabState(ls => {
      const newRess = { ...ls.resources }
      if (newRess[type] == null)
        newRess[type] = 0;
      newRess[type] += value;
      return { ...ls, resources: newRess }
    })
  }
  function addReactor(reactor) {
    if (reactor == null)
      reactor = BIO_REACTOR_DATA[0];
    addLog("Nouveau reacteur acheté " + reactor.name);
    setLabState(ls => {
      const newRess = { ...ls.resources }
      newRess.credits -= reactor.cost;
      return { ...ls, resources: newRess, reactors: ls.reactors.concat(reactor) }
    })
  }
  function addLog(message, severity = 'info') {
    setLabState(prev => ({
      ...prev,
      logs: [...prev.logs, { id: crypto.randomUUID(), message, severity, time: Date.now() }]
    }));
  }
// LabContext additions
function enqueueMachineActionRequest(request) {
  setLabState(prev => {
    const lab = { ...prev };
    lab.pendingMachineActions = [...(lab.pendingMachineActions || []), { ...request, id: crypto.randomUUID(), createdAt: Date.now() }];
    return lab;
  });
}

function unlockGene(geneId) {
  // research.current est une Ref — utilise la manière dont tu veux l'actualiser.
  // Ici on propose deux chemins : si tu gères research via labState.research, mutate; sinon expose une fonction pour research.current
  if (labState.research && Array.isArray(labState.research.unlockedGenes)) {
    setLabState(prev => {
      const lab = { ...prev };
      lab.research = { ...(lab.research || {}), unlockedGenes: Array.from(new Set([...(lab.research.unlockedGenes || []), geneId])) };
      return lab;
    });
  } else if (research && research.current) {
    research.current.unlockedGenes = Array.from(new Set([...(research.current.unlockedGenes || []), geneId]));
    // optionally force react re-render via setLabState
    setLabState(prev => ({ ...prev }));
  }
  
}

  function addMachine(machineID) {
    let machine = null;
    if (machineID == null)
      machine = MACHINE_DATA[0];
    else
      machine = MACHINE_DATA.find(m => m.id === machineID);
    addLog("Nouvelle machine achetée " + machine.name, 'urgent');
    machine.active = true;
    
    setLabState(ls => {
      if(typeof machine.effectAchat === 'function')
        machine.effectAchat(ls);
      const newRess = { ...ls.resources }
      newRess.credits -= machine.cost;
      return { ...ls, resources: newRess, machines: ls.machines.concat(machine) }
    })
  }
  function removeHint(activeHint) {
    setLabState(ls => {
      return { ...ls, guidance: { ...ls.guidance, active: ls.guidance.active.filter(h => h.ruleId != activeHint.ruleId) } }
    })
  }
  function updateReactor(rid, def) {
    setLabState(ls => {
      const newReactors = ls.reactors.map(reactor => {
        if (reactor.id === rid) {
          return { ...reactor, ...def }
        }
        return reactor;
      })
      return { ...ls, reactors: newReactors }
    })
  }
 
  function addBacteria(souche) {
    if (souche == null)
      souche = BACTERIA_DATA[0];
    addLog("Nouvelle souche achetée " + souche.name);
    setLabState(ls => {
      const newRess = { ...ls.resources }
      newRess.credits -= souche.cost;
      return { ...ls, resources: newRess, bacteria: ls.bacteria.concat(souche) }
    })
  }

function attachGene(bactId, geneId) {
  setLabState(prev => {
    const lab = { ...prev };
    // s'assurer que arrays existent
   
    // applique le gène
    const out = applyGeneToBacterium(lab, research, bactId, geneId);
    return out;
  });
}
  function tick() {
    // market update rarely
    if (Math.random() < 0.1)
      setMarket(prev => {
        return updateProductMarket(prev)
      });

    setLabState(prev => {
      let lab = { ...prev };

      lab.time += 1;

      lab = applyWasteAndDecay(lab, research);
      lab = applyReactorProcesses(lab);
      lab = applyBacteriaGrowth(lab);
      lab = applyMachinesProcess(lab);
      lab = applyResearchProgress(lab, research);
      if(Math.random()<0.2)
        lab = processDNAResearch(lab,research);
      lab = processGeneTickEffects(lab, research.current);

      const api = buildAPI(lab);
      lab = processRandomEvents(lab, RANDOM_EVENTS, api);
      lab = evaluateGuidance(lab, GUIDANCE_RULES(), api);

      return lab;
    });

  }
  useEffect(() => {
    if (labState.paused) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [labState.paused]);
  useEffect(() => {
   if(labState.pendingResearch!=null){
  research.current = labState.pendingResearch(research.current);
   }
  }, [labState.pendingResearch]);
  

  const { saveLab, loadLab, clearLab } = useLabSave(labState, setLabState, research.current
      , {setResearch:rch=>{research.current=rch}});

  useEffect(() => {
    // Auto-load au démarrage
    const loaded = loadLab();
    if (!loaded) {
      console.log("🌱 Nouveau laboratoire initialisé");
    }
  }, [loadLab]);


  return (
    <LabContext.Provider value={{
      labState, setLabState,
      research: research.current, startResearch,
      market, saveLab, loadLab, clearLab, removeHint,
      tick, updateReactor, addLog, addResource, removeContract,
      addReactor, addBacteria, addMachine, attachGene
      , enqueueMachineActionRequest, unlockGene
    }}>
      {children}
    </LabContext.Provider>

  );
}

export const useLab = () => useContext(LabContext);

export const buildAPI = lab => {
  const api = {
    addLog: (msg, severity) => lab.logs = [...(lab.logs || []), { id: crypto.randomUUID(), message: msg, severity, time: Date.now() }],
    addResource: (k, amt) => lab.resources[k] = (lab.resources[k] || 0) + amt,
    hasMachine: machineid => lab.machines.find(m => m.id === machineid),
    goto: (lieu) => { lab.nextDest = lieu }, // hook pour UI
    activateMachine: (id) => { const m = lab.machines.find(x => x.id === id); if (m) m.active = true; },
    activateReactors: () => { const m = lab.reactors.forEach(r => r.status = 'running'); },
  }

  return api;
}
