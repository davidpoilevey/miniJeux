// CatRPG.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage} from 'react-konva';

import usePlayerMovement from '../hooks/usePlayerMovement';
import CatPlayer, { MiaulableIndicator } from './CatPlayer';
import { useWorld } from '../hooks/useWorld';
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from '../data/maps';
import { Fade } from '@mui/material';
import TiledMapRenderer from './TiledMapRenderer';
import DialogueBox from './DialogueBox';
import InventoryDrawer from './InventoryDrawer';
import { soundManager } from '../../rpg/sons/SoundManager';
import { soundMap } from '../assets/sonsSources';
import PlayerHUD, { QuestBox } from './PlayerHud';
import PanneauMessage from './PanneauMessage';
import { useCATImage } from '../hooks/useCATImage';
import { UnPeuDeMusique } from '../../towerDefense/TowerDefense';
import {  useQuestFeedback } from '../hooks/useQuests';
import { GameOver } from '../../ChuckNorrisFact';
import ThunderFlash from './ThunderFlash';
import CuiteEffect from './CuiteEffect';


const CatRPGUI = ({loadGame, onSave, loadedData}) => {
const { showQuestBanner, bannerComponent } = useQuestFeedback();
  const [inventoryOpen, setInventoryOpen] = useState(true);
   const [gameOver, setGameOver] = useState(false);
   const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [lightning, setLightning] = useState(false);
  const { triggerKey, onFadeComplete, dialogue, dialogueEngine, effects, isSaoul
    , getAllTileStates, mute,safeStartDialogue,handleLoad,handleSave, reset,cLaFin,nuit,
     ...worldContext } = useWorld({showQuestBanner, loadGame, onSave, loadedData ,setGameOver, setLightning});
  const { direction, isMoving, handleKeyDown, handleKeyUp } = usePlayerMovement({ 
    setInventoryOpen, isSaoul, 
    dialogueEngine, safeStartDialogue,
    ...worldContext });
  const images =useCATImage();
  const playerImage = images['player'];
  const pancarteImage = images['pancarte'];
  const [fadeVisible, setFadeVisible] = useState(false);
  useEffect(() => {
    //Initialization
    soundManager.loadSounds(soundMap);
     setStartTime(Date.now());
  }, [])

  useEffect(() => {
    if (dialogue) {
      if (dialogueEngine.hasDialog(dialogue)) {
        safeStartDialogue(dialogue)
        worldContext.setDialogue(null);
      }
      else
        worldContext.setDialogue(dialogue);
    }
  }, [dialogue]);


  // Ajoute le listener clavier
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, [handleKeyDown]);

useEffect(() => {
  if (!cLaFin) return;

  setGameOver(true);

  const baseTime = 1200000; // 20 minutes, 1200 sec, 1 200 000ms
  const timePenalty = Math.min(Date.now()-startTime, baseTime);
  const scoreChrono = Math.round((baseTime - timePenalty)/1000);

  const croqBonus = worldContext.playerState.croqs * 10;
  const levelBonus = worldContext.playerState.level * 100;
  const vomiBonus = worldContext.playerState?.nbVomi||0 * 100;

  const labyBonus = worldContext.quests?.hasStarted?.("LabyrintheGPT")
    ? 1000
    : 0;

  const finalScore = scoreChrono + croqBonus + levelBonus + vomiBonus + labyBonus;

  setScore(finalScore);


}, [cLaFin, startTime,worldContext.playerState]);
const stageRef = useRef();


  useEffect(() => {
    setFadeVisible(false);
    // A reactiver apres le debug
    //   soundManager.play('finNiveau');
    let timeout = setTimeout(() => {
      onFadeComplete?.();
      setFadeVisible(true);
    }, 500); // durée du fade


    return () => {
      clearTimeout(timeout);
    };
  }, [triggerKey]);



  return <div style={{ width: '100%', height: '100%', overflow:'auto',
    backgroundColor:'#63436aff'}}>
    <ThunderFlash trigger={lightning} onComplete={() => setLightning(false)} />

    <Fade in={fadeVisible} timeout={500}>
 
    <div >
        <GameOver open={gameOver} score={score}  gameName="ezioTrip"
    handleClose={() => { setGameOver(false) }} handleRestart={reset} />
      <UnPeuDeMusique mute={mute}/>
      {bannerComponent}
  {!inventoryOpen && <QuestBox quests={worldContext.quests}/>}
      <PlayerHUD 
        startTime={startTime}
        pdv={worldContext.playerState.pdv}
        croqs={worldContext.playerState.croqs}
        vomito={worldContext.playerState.vomito}
        level={worldContext.playerState.level}
      />
      <DialogueBox node={dialogueEngine.node} 
      onOptionClick={dialogueEngine.chooseOption} 
       context={{
    hasItem: worldContext.hasItemInInventory,
    soundManager,
    ...worldContext
  }}/>
      <InventoryDrawer
        open={inventoryOpen}
        startTime={startTime}
        onLoad={handleLoad}
        onSave={handleSave}
        updatePlayerState={worldContext.updatePlayerState}
        onClose={() => setInventoryOpen(false)}
        playerState={worldContext.playerState}
        quests={worldContext.quests}
        inventory={worldContext.inventory}
      />

      <Stage width={MAP_WIDTH} height={MAP_HEIGHT} ref={stageRef}>
        {/* Layer du sol */}
        <Layer>
          <TiledMapRenderer
            tileMap={worldContext.zone.tileMap}
            tileStates={getAllTileStates(worldContext.zone.name)}
            effects={effects}
            nightVision={nuit}
            visionRadius={worldContext.hasItemInInventory('lanterne')?20:(worldContext.hasItemInInventory('torche')?13:8)}
            layer="base"
            playerPosition={worldContext.tilePosition}
          />
        </Layer>


        {/* Layer de superposition */}
        <Layer>
          <TiledMapRenderer
            tileMap={worldContext.zone.tileMap} // pour récupérer largeur/hauteur
            tileStates={getAllTileStates(worldContext.zone.name)}
            foreground={worldContext.zone.foreground}
            layer="foreground"
          />

          {Object.entries(worldContext.zone.interactions || {})
  .filter(([_, data]) => data.miaulable)
  .map(([coord, _]) => {
    const [row, col] = coord.split(',').map(Number);
    return <MiaulableIndicator key={`miaulable-${coord}`} row={row} col={col} />;
  })}
        </Layer>

        {/* Layer des entités */}
        <Layer>
          <CatPlayer
            x={worldContext.position.x}
            y={worldContext.position.y}
            direction={direction}
            isMoving={isMoving}
            image={playerImage}
          />
        </Layer>
       

        <CuiteEffect stageRef={stageRef} active={isSaoul} />
        <Layer>
{dialogue !== '' && pancarteImage && (
  <PanneauMessage image={pancarteImage} message={dialogue} 
   onDone={() => worldContext.setDialogue(null)} />
)}

        </Layer>

      </Stage>

    </div>
  </Fade>
  </div>
};

export default CatRPGUI;

