// hooks/useDialogueEngine.js
import { useState } from 'react';
import { dialogues } from '../data/dialogues';

const useDialogueEngine = ({ onEffect }) => {
  const [currentDialogueId, setCurrentDialogueId] = useState(null);
  const [currentNodeKey, setCurrentNodeKey] = useState(null);

  const hasDialog = dialogueId=>dialogues[dialogueId]!=null
  const startDialogue = (dialogueId, startNode) => {
    const dialogue = dialogues[dialogueId];
    if (!dialogue) return;
    setCurrentDialogueId(dialogueId);
    const startingNode = dialogue['start'];

    setCurrentNodeKey(startNode||startingNode);
  };
const closeCurrentDialogue=()=>{
   setCurrentDialogueId(null);
      setCurrentNodeKey(null);
}
  const chooseOption = (nextKey) => {
    const node = getNode(nextKey);
    if (!node) return;

    if (node.effect) {
      node.effect(onEffect); // Exécution logique
    }

    if (node.end) {
      setCurrentDialogueId(null);
      setCurrentNodeKey(null);
    } else {
      setCurrentNodeKey(nextKey);
    }
  };

  const getNode = (key = currentNodeKey) => {
    if (!currentDialogueId) return null;
    const dialogue = dialogues[currentDialogueId];
    return key.text?key:dialogue?.nodes?.[key];// si obj a text, c'est un node
  };

  return {
    active: !!currentDialogueId,
    node: getNode(),
    startDialogue, hasDialog,closeCurrentDialogue,
    chooseOption
  };
};

export default useDialogueEngine;
