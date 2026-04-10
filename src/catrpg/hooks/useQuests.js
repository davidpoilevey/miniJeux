import { useCallback, useEffect, useRef, useState } from 'react';
import { CATQuests as QUESTS } from '../data/quests';
import { Box, GlobalStyles, Typography } from '@mui/material';
import { soundManager } from '../../rpg/sons/SoundManager';
import { useWorld } from './useWorld';

export default function useQuests({ addItem, startDialogue,showQuestBanner, hasItem, levelUp, moveToZone, tilePosition, zone, addCroqs, addPdv }) {
  const [activeQuests, setActiveQuests] = useState({});
const currentQuest = useRef();

const setAllQuests = useCallback((questsStateFromSave) => {
  if (!questsStateFromSave || typeof questsStateFromSave !== 'object') return;

  setActiveQuests(() => {
    const cleanState = {};

    for (const questId in questsStateFromSave) {
      const saved = questsStateFromSave[questId];
      const quest = QUESTS[questId];

      if (!quest || typeof saved !== 'object') continue;

      cleanState[questId] = {
       stepsCompleted: saved.stepsCompleted ?? (saved.currentStep != null ? [...Array(saved.currentStep).keys()] : []),
        completed: !!saved.completed,
        isCurrent: !!saved.isCurrent
      };

      // synchronise currentQuest
      if (saved.isCurrent) {
        currentQuest.current = questId;
      }
    }

    return cleanState;
  });
}, []);

const startQuest = useCallback((questId) => {
  setActiveQuests((q) => {
    // Ne rien faire si déjà lancée
    if (q[questId]) return q;

    const quest = QUESTS[questId];
    if (!quest) return q;

    // ✅ Met à jour currentQuest
    currentQuest.current = questId;

    // 🔄 Reset tous les `isCurrent: false`, puis ajoute la nouvelle
    const newState = Object.fromEntries(
      Object.entries(q).map(([id, data]) => [
        id,
        { ...data, isCurrent: false }
      ])
    );

    newState[questId] = {
      stepsCompleted: [],
      completed: false,
      isCurrent: true
    };

    // 💬 Dialogue lié à la zone (si présent)
    const zoneDialogueId = quest?.dialogueId;
    if (zoneDialogueId) {
      startDialogue?.(zoneDialogueId, "start");
    }

    // ✨ Feedback "nouvelle quête"
    showQuestBanner?.(`Nouvelle quête : ${quest.name}`);
    soundManager?.play?.("finNiveau");

    return newState;
  });
}, [zone, showQuestBanner, startDialogue, soundManager]);

const getNextUncompletedStepIndex = (questId, state) => {
  const quest = QUESTS[questId];
  if (!quest) return null;

  const completed = new Set(state.stepsCompleted || []);
  for (let i = 0; i < quest.steps.length; i++) {
    if (!completed.has(i)) return i;
  }
  return null;
};


  const takeReward = useCallback((reward) => {
    if (reward?.croqs) addCroqs?.(reward.croqs);
    if (reward?.pdv) addPdv?.(reward.pdv);
     levelUp();
    if (reward?.newZone) moveToZone?.(reward.newZone);
    if (reward?.inventory) {
      reward.inventory.forEach((item) => {
        if (!hasItem(item)) addItem(item);
      });
    }
  }, [levelUp, addCroqs, addPdv, moveToZone, hasItem, addItem]);
const advanceQuest = useCallback((questId, toStepIndex = null) => {
  const quest = QUESTS[questId];
  if (!quest) return;
  if(isStepCompleted(questId,toStepIndex))
    return;
  setActiveQuests((q) => {
    const state = q[questId];
    if (!state || state.completed) return q;

    const newSteps = new Set(state.stepsCompleted || []);
    const nextIndex = toStepIndex != null ? toStepIndex : getNextUncompletedStepIndex(questId, state);

    if (nextIndex == null) return q; // aucune step à valider ?

    newSteps.add(nextIndex);

    const isComplete = newSteps.size >= quest.steps.length;

    // 🎁 Récompense si terminé
    if (isComplete) {
      takeReward(quest.reward);
      showQuestBanner?.(`Quête terminée : ${quest.name} 🎉`);
      soundManager?.play?.("questComplete");
    } else {
      const currentStepDesc = quest.steps[nextIndex]?.description;
      if (currentStepDesc) {
        showQuestBanner?.(`✅ Étape validée : ${currentStepDesc}`);
        soundManager?.play?.("questStep");
      }
    }

    return {
      ...q,
      [questId]: {
        ...state,
        stepsCompleted: Array.from(newSteps),
        completed: isComplete
      }
    };
  });
}, [takeReward, showQuestBanner]);



  const completeQuest = useCallback((questId) => {
    const quest = QUESTS[questId];
    if (!quest) return;
     showQuestBanner?.(`Quête achevée: ${quest.name}`);
    setActiveQuests((q) => ({
      ...q,
      [questId]: {
        completed: true
      }
    }));
    takeReward(quest.reward);
  }, [takeReward]);

  const getCurrentStep = useCallback((questId) => {
  const quest = QUESTS[questId];
  const state = activeQuests[questId];
  if (!quest || !state) return null;

  const completed = new Set(state.stepsCompleted || []);
  for (let i = 0; i < quest.steps.length; i++) {
    if (!completed.has(i)) return i;
  }
  return null;
}, [activeQuests]);


 const isStepCompleted = useCallback((questId, stepIndex) => {
  const completed = activeQuests[questId]?.stepsCompleted ?? [];
  return completed.includes(stepIndex);
}, [activeQuests]);


  const hasStarted = useCallback((questId, toStepIndex = 0) => {
    const step = activeQuests[questId]?.stepsCompleted;
    return step instanceof Array;
  }, [activeQuests]);

  const isAboveStep = useCallback((questId, minStepIndex) => {
    const current = getCurrentStep(questId);
    return current != null && current >= minStepIndex;
  }, [getCurrentStep]);

  
  const notifyDialogue = useCallback((dialogueId) => {
    Object.entries(activeQuests).forEach(([questId, state]) => {
      const quest = QUESTS[questId];
     const completed = new Set(state.stepsCompleted || []);

      quest?.steps.forEach((step, i) => {
        if (completed.has(i)) return;
        if (step?.type === 'dialogue' && step.dialogueId === dialogueId) {
          advanceQuest(questId, i);
        }
      });

    });
  }, [advanceQuest, activeQuests]);

  const checkQuestProgressionOnZoneEnter = (zoneName) => {
  Object.entries(activeQuests).forEach(([questId, state]) => {
    if (state.completed) return;

    const quest = QUESTS[questId];
   const completed = new Set(state.stepsCompleted || []);

quest?.steps?.forEach((step, i) => {
  if (completed.has(i)) return;
  if (step?.type === 'zone' && step.zone === zoneName) {
    advanceQuest(questId, i);
  }
});

  });
};

  // Auto-avancement item / position
  useEffect(() => {
    Object.entries(activeQuests).forEach(([questId, state]) => {
      const quest = QUESTS[questId];
     const completed = new Set(state.stepsCompleted || []);

quest?.steps.forEach((step, i) => {
  if (completed.has(i) || state.completed) return;

  if (step.type === 'item' && hasItem(step.item)) {
    advanceQuest(questId, i);
  }

  if (
    step.type === 'position' &&
    zone.name === step.zone &&
    tilePosition.col === step.x &&
    tilePosition.row === step.y
  ) {
    advanceQuest(questId, i);
  }

  if (step.type === 'zone' && step.zone === zone.name) {
    advanceQuest(questId, i);
  }
});

    });
  }, [hasItem, tilePosition, zone, advanceQuest, activeQuests]);

  return {
    activeQuests,
    hasStarted,
    startQuest,
    advanceQuest,
    notifyDialogue,
    takeReward,
    completeQuest,
    getCurrentStep,
    isAboveStep,
    setAllQuests,
    isStepCompleted
  };
}


export const QuestBanner = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  const sx = {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#FFD700', // or gold
    color: '#111',
    padding: '24px 48px',
    borderRadius: '12px',
    fontFamily: '"Press Start 2P", sans-serif',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 999,
    border: '3px dashed #8B4513', // marron pixel vibe
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
    animation: 'slide-in 0.4s ease-out, fade-out 0.4s ease-in 3.6s forwards',
    textAlign: 'center',
    whiteSpace: 'pre-wrap'
  };

  return (<>
  <GlobalStyles
      styles={{
        '@keyframes fadeBlackOut': {
          '0%': { opacity: 0 },
          '50%': { opacity: 0.8 },
          '100%': { opacity: 0 }
        },
        '@keyframes slide-in': {
  from :{
    transform: 'translate(-50%, -20px)'
    ,opacity: 0
  },
  to: {
    transform: 'translate(-50%, 0)',
    opacity: 1
  }
},

'@keyframes fade-out': {
  to :{
    opacity: 0
  }
}
      }}
    />
    <Box sx={sx}>
      🚨 {message} 🚨
    </Box>
    </>
  );
};

export const useQuestFeedback = () => {
  const [banner, setBanner] = useState(null);

  const showQuestBanner = (message) => {
    setBanner(message);
    setTimeout(() => setBanner(null), 4000);
  };

  return {
    showQuestBanner,
    bannerComponent: banner && <QuestBanner message={banner} />
  };
};


