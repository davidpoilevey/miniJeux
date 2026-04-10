import React, { useState, useEffect, useRef } from 'react';
import CurlingField, { stoneSize } from './CurlingField';
import Stone from './Stone';
const fieldWidth = 1350;
export const ROUGE = 'rouges';
export const BLEU = 'bleus';

const CurlingGame = () => {
    const [stones, setStones] = useState([]);
    const [currentTour, setcurrentTour] = useState(ROUGE);
    const [glisseFactor, setGlisseFactor] = useState(0.99);
    const [alertMsg, setalertMsg] = useState();
    const [frameTop, setft] = useState(0);
    const [frameBottom, setfb] = useState(500);
    const [winner, setWinner] = useState(ROUGE);
    const [remainingStones, setRemainingStones] = useState({
        [ROUGE]: 6,
        [BLEU]: 6,
    });
    const addStone = (stone) => {
        if(remainingStones[currentTour]<=0){
          return setWinner('Bravo '+winner);
        }
        stone.color = currentTour;// set color stone
        setcurrentTour(currentTour === ROUGE ? BLEU : ROUGE);// set current tour et remove une stone
        setRemainingStones((prevRemainingStones) => ({
            ...prevRemainingStones,
            [currentTour]: prevRemainingStones[currentTour] - 1,
        }));
        setStones((olds) => olds.concat(stone));
    };
    const resetGame = () => {
        setStones([]);
        setRemainingStones({ [ROUGE]: 6, [BLEU]: 6 });
    }
    const fieldRef = useRef();
    useEffect(() => {
        const curlingFieldElement = fieldRef.current;
        const { top, left , bottom} = curlingFieldElement.getBoundingClientRect();
        setft(top);
        setfb(bottom);
      }, []);
    useEffect(() => {
        const animationInterval = setInterval(() => {
            setStones((prevStones) => {
                const updatedStones = prevStones.map((stone) => {
                    if (stone.velocity) {
                        const newX = stone.position.x + stone.velocity.x;
                        const newY = stone.position.y + stone.velocity.y;
                        const newVelocity = {
                            x: stone.velocity.x * glisseFactor
                            , y: stone.velocity.y * glisseFactor
                        }
                        if (Math.abs(newVelocity.x) < 0.1 && Math.abs(newVelocity.y) < 0.1) {
                            newVelocity.x = 0;
                            newVelocity.y = 0;
                            //stop if too slow
                        }
                        if((newY+20)<frameTop||(newY+stoneSize+20)>frameBottom||newX<0){// rebondit sur le mur
                            newVelocity.y=-newVelocity.y;
                        } 
                     
                        const updatedPosition = { x: newX, y: newY };
                        //reset closest
                        return { ...stone, winner: false, position: updatedPosition, velocity: newVelocity };
                    }
                    return stone;
                });

                // highlight la plus proche
                const closest = findClosestStoneToTarget(updatedStones);
                if (closest != null) {
                    setWinner(closest.color);
                    closest.winner = true;
                }
                // Gérer les collisions ici
                const stonesWithCollisionsHandled = handleCollisions(updatedStones);

                // remove out of field
                return stonesWithCollisionsHandled.filter(stone => {
                    return stone.position.x < fieldWidth
                });
            });
        }, 16); // 60 FPS

        return () => clearInterval(animationInterval);
    }, [glisseFactor]);

useEffect(()=>{
    // si fin du jeu, cherche toute4s les plus proches dans l'ordre pour donner le score final
    if(remainingStones[ROUGE]<=0 && remainingStones[BLEU]<=0 ){
        let nextClosest = findClosestStoneToTarget(stones);
        let stonesRestantes=[...stones];
        let points=0;
        const gagnants = nextClosest.color;
        while(nextClosest!=null && nextClosest.color===gagnants){
            points++;
            stonesRestantes = stonesRestantes.filter(s=>s.id!=nextClosest.id);
            nextClosest =  findClosestStoneToTarget(stonesRestantes);
        }
        setalertMsg('Le gagnant est '+winner+' avec '+points+' points');
        playVictoryMelody();
    }
    else{
        setalertMsg('la pierre la plus proche est '+winner);
    }
},[remainingStones, winner]);
const winnerColor = winner==ROUGE?'red':'blue';
const tourColor = currentTour==ROUGE?'red':'blue';
    return (
        <div style={{ position: 'relative' }}>
      <div className="game-header">
    <h1 className="game-title">Jeu de Curling</h1>
    <div style={{ display: 'flex', alignItems: 'center' }}>

  <h5 className="current-tour">
    Au tour des {currentTour}
  </h5>
      <button className="reset-button" onClick={resetGame}>Reset</button>
    
    </div>
  </div>
  <div className="summary">
  {alertMsg && (
        <div style={{ color: winnerColor, fontSize: '14px', fontWeight: 'bold', margin: '6px' }}>
          {alertMsg}
        </div>
      )}
    <div className="team-summary">
      <div className="team-color rouge"></div>
      <div className="stone-count">{remainingStones[ROUGE]}</div>
    </div>
    <div className="team-summary">
      <div className="team-color bleu"></div>
      <div className="stone-count">{remainingStones[BLEU]}</div>
    </div>
  </div>
            <CurlingField ref={fieldRef} addStone={addStone}>
                {stones.map((stone) => (
                    <Stone key={stone.id}
                        {...stone}
                        setGlisseFactor={setGlisseFactor} />
                ))}
            </CurlingField>
            <Spectators nbRow={8} nbSpectator={72}/>
        </div>
    );
};

export default CurlingGame;


const findClosestStoneToTarget = (stones) => {
    const target = { x: 1180, y: 380 };
    let closestStone = null;
    let closestDistance = Infinity;

    for (const stone of stones) {
        const distance = calculateDistance(stone.position, target);
        if (distance < closestDistance) {
            closestStone = stone;
            closestDistance = distance;
        }
    }

    return closestStone;
};

const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};


const handleCollisions = (stones) => {
    const updatedStones = [...stones];

    for (let i = 0; i < updatedStones.length; i++) {
        const stoneA = updatedStones[i];

        for (let j = i + 1; j < updatedStones.length; j++) {
            const stoneB = updatedStones[j];

            const distanceX = stoneB.position.x - stoneA.position.x;
            const distanceY = stoneB.position.y - stoneA.position.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < stoneSize) {
                // Collision détectée

                // Calculer la nouvelle vélocité des pierres en fonction des règles du curling

                // Exemple de mise à jour des vélocités avec une collision élastique simple
                const normalX = distanceX / distance;
                const normalY = distanceY / distance;

                const relativeVelocityX = stoneB.velocity.x - stoneA.velocity.x;
                const relativeVelocityY = stoneB.velocity.y - stoneA.velocity.y;

                const dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

                const impulseX = normalX * dotProduct;
                const impulseY = normalY * dotProduct;

                stoneA.velocity.x += impulseX;
                stoneA.velocity.y += impulseY;

                stoneB.velocity.x -= impulseX;
                stoneB.velocity.y -= impulseY;
            }
        }
    }

    return updatedStones;
};
const playVictoryMelody = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    const notes = [
      { frequency: 659.25, duration: 300 }, // E5
      { frequency: 783.99, duration: 150 }, // G5
      { frequency: 987.77, duration: 400 }, // B5
      { frequency: 1174.66, duration: 300 }, // D6
      { frequency: 783.99, duration: 150 }, // G5
      { frequency: 987.77, duration: 400 }, // B5
      { frequency: 1174.66, duration: 300 }, // D6
      { frequency: 1467.98, duration: 500 }, // E6
      { frequency: 1244.51, duration: 250 }, // C6
      { frequency: 1046.50, duration: 160 }, // C6
      { frequency: 880.00, duration: 350 }, // A5
      { frequency: 983.99, duration: 600 }, // G5
    ];
  
    const playNote = (note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
  
      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;
  
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
  
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (note.duration / 1000));
  
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
      }, note.duration);
    };
  
    const playMelody = (index) => {
      if (index >= notes.length) {
        audioContext.close();
        return;
      }
  
      const note = notes[index];
      playNote(note);
  
      setTimeout(() => {
        playMelody(index + 1);
      }, note.duration);
    };
  
    playMelody(0);
  };
  

  const Spectators = ({ nbRow, nbSpectator }) => {
    const [spectatorColors, setSpectatorColors] = useState([]);
  
    useEffect(() => {
      const colors = [];
  
      for (let i = 0; i < nbRow; i++) {
        const rowColors = [];
  
        for (let j = 0; j < nbSpectator; j++) {
          const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
          rowColors.push(randomColor);
        }
  
        colors.push(rowColors);
      }
  
      setSpectatorColors(colors);
    }, [nbRow, nbSpectator]);
  
    return (
      <div className="spectators">
        {spectatorColors.map((rowColors, rowIndex) => (
          <div key={rowIndex} className="row">
            {rowColors.map((color, spectatorIndex) => (
              <div key={spectatorIndex} className="spectator" style={{ backgroundColor: color }}></div>
            ))}
          </div>
        ))}
      </div>
    );
  };