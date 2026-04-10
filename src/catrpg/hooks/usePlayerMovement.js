// hooks/usePlayerMovement.js
import { useState, useCallback, useEffect } from 'react';
import { tileBehaviors } from '../data/tileTypes';
import { soundManager } from '../../rpg/sons/SoundManager';

const directions = {
  ArrowUp: { dx: 0, dy: -1, name: 'up' },
  ArrowDown: { dx: 0, dy: 1, name: 'down' },
  ArrowLeft: { dx: -1, dy: 0, name: 'left' },
  ArrowRight: { dx: 1, dy: 0, name: 'right' },
  w: { dx: 0, dy: -1, name: 'up' },
  s: { dx: 0, dy: 1, name: 'down' },
  a: { dx: -1, dy: 0, name: 'left' },
  d: { dx: 1, dy: 0, name: 'right' },
};

const usePlayerMovement = ({ zone, moveTo, getTileState, getTileData, setInventoryOpen, updateTileState
  , playerState, updatePlayerState, quests,dialogueEngine, setDialogue, safeStartDialogue, addItemToInventory
  , tilePosition, isAnimating, triggerExplosionAt, hasItemInInventory, CATManager, isSaoul }) => {
  const [direction, setDirection] = useState('down');
  const [playedDialogues, setPlayedDialogues] = useState({});

  const hasPlayedDialogue = (id) => !!playedDialogues[id];
  const markDialoguePlayed = (id, newValue = true) =>
    setPlayedDialogues((prev) => ({ ...prev, [id]: newValue }));

  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    setIsMoving(isAnimating);
  }, [isAnimating]);
  useEffect(() => {
    setPlayedDialogues((prev) => ({ ...prev, [CATManager.resetDialoguePlayed]: false }));
  }, [CATManager.resetDialoguePlayed]);

  const handleKeyUp = useCallback(
    (e) => {
      setIsMoving(false);
    })
  const handleKeyDown = useCallback(
    (e) => {
      e.preventDefault()
      if (isMoving||dialogueEngine.active) return; // ← empêcher tout nouveau mouvement pendant l'anim
      if (document.querySelector('.dialogue-box')) return;

      if (e.key === 'i' || e.key === 'I') {
        setInventoryOpen((prev) => !prev);
      }
      const tryInteract = (row, col, justAction = false) => {
        let tileId = zone.tileMap?.[row]?.[col];

        const fgData = zone.foreground?.[`${row},${col}`];
        if (fgData) {
          tileId = fgData.tileType;
        }

        const tileData = getTileData(zone.name, row, col); // <- contient dialogueId, behaviorType, etc.

        const tileState = getTileState(zone.name, row, col);
        const behaviorId = tileData?.behaviorType ?? tileId; // priorité à behaviorType
        const behavior = tileBehaviors[behaviorId];
        //  const behavior = tileBehaviors[tileId];

        const behaviourArgs = {
          tileState,
          tileData,
          quests,
          CATManager,
          triggerEffect: (type) => triggerExplosionAt(row, col, type),
          updateTileState: (newState) => updateTileState(zone.name, row, col, newState),
          playerState, hasItemInInventory, updatePlayerState,
          addItem: (item) => addItemToInventory(item),
          showDialogue: (text, force, onStartNode) => {

            if (tileData == null) {
              if (text != null) {
                setDialogue(text);
              }
              return;
            }
            const { dialogueId, once, startNode = onStartNode } = tileData;

            if (once && startNode==null && hasPlayedDialogue(dialogueId)) {
              if (force && text != null)
                setDialogue(text);
              return; // déjà joué
            }
            if (text != null && (force || dialogueId == null || tileState === 'open')) {
              return setDialogue(text);
            }

            safeStartDialogue(dialogueId, startNode); // ← accepte un second param
            if (once)
              markDialoguePlayed(dialogueId);

          }
        }
        if (!justAction && behavior?.onEnter) {
          behavior.onEnter(behaviourArgs);
        }
        if (justAction && behavior?.onInteract) {

          behavior.onInteract(behaviourArgs);
        }
      }
      if (e.key === 'e' || e.code === 'Space' || e.code ==='Enter') {
        // action aussi sur tile devant
        const currentPos = tilePosition; // Assure-toi qu’elle est stockée
        if (!currentPos || !direction) return;

        // 👉 Position devant le joueur
        const frontTile = getFrontTilePosition(currentPos, direction);

        // 🐾 Interagir avec le tile devant (justAction = true)
        tryInteract(frontTile.row, frontTile.col, true);
        tryInteract(tilePosition.row, tilePosition.col, true);// et aussi le tile dessus
      }
      if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'q') {
        soundManager.play('miaou');
        const baseRow = tilePosition.row;
        const baseCol = tilePosition.col;

        const tileDataAround = [-1, 0, 1]
          .flatMap(dy => [-1, 0, 1].map(dx => ({ dx, dy })))
          .map(({ dx, dy }) => {
            const row = baseRow + dy;
            const col = baseCol + dx;
            const data = getTileData(zone.name, row, col);
            return { row, col, data };
          })
          .filter(({ data }) => data?.miaulable);


        if (tileDataAround.length > 0) {
          const { row, col, data } = tileDataAround[0]; // on prend le premier trouvable
          const { dialogueId, once } = data;

          if (dialogueId) {
            safeStartDialogue(dialogueId, "miauled");
            if (once) markDialoguePlayed(dialogueId + 'miauled');
          }
        }

        return; // pour éviter aussi mouvement sur M
      }

      let dir = directions[e.key];
      if (!dir) return;
      if(isSaoul){
        dir = { ...dir, dx: -dir.dx, dy: -dir.dy }
      }
      const row = tilePosition.row;
      const col = tilePosition.col;
      const nextRow = row + dir.dy;
      const nextCol = col + dir.dx;

      setDirection(dir.name);
      setIsMoving(true);

      moveTo(nextRow, nextCol); // ← logique propre, alignée
      tryInteract(nextRow, nextCol);


    },
    [isMoving, tilePosition, zone, moveTo, playerState, getTileState]
  );

  return {
    direction,
    isMoving,
    handleKeyUp,
    handleKeyDown
  };
};

export default usePlayerMovement;


const getFrontTilePosition = ({ row, col }, direction) => {
  switch (direction) {
    case 'up':
      return { row: row - 1, col };
    case 'down':
      return { row: row + 1, col };
    case 'left':
      return { row, col: col - 1 };
    case 'right':
      return { row, col: col + 1 };
    default:
      return { row, col };
  }
};

