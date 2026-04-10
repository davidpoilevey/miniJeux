import { useState, useEffect, useRef } from "react";

const COLORS = ['#1565C0', '#B71C1C', '#1B5E20', '#E65100'];
const NAMES = ['Vous', 'Rodrigo', 'El Dudo', 'Paco'];
const FACE_SYM = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const PIP_GRID = {
  1: [0,0,0, 0,1,0, 0,0,0],
  2: [1,0,0, 0,0,0, 0,0,1],
  3: [1,0,0, 0,1,0, 0,0,1],
  4: [1,0,1, 0,0,0, 1,0,1],
  5: [1,0,1, 0,1,0, 1,0,1],
  6: [1,0,1, 1,0,1, 1,0,1],
};

const roll = n => Array.from({length:n}, () => Math.ceil(Math.random()*6));

const nextAlive = (players, from) => {
  const n = players.length;
  let i=(from+1)%n, c=0;
  while(players[i].diceCount===0 && c++<n) i=(i+1)%n;
  return i;
};
const prevAlive = (players, from) => {
  const n = players.length;
  let i=(from-1+n)%n, c=0;
  while(players[i].diceCount===0 && c++<n) i=(i-1+n)%n;
  return i;
};

const isValidBid = (qty, face, prev, total) => {
  if (qty<1||qty>total||face<1||face>6) return false;
  if (!prev) return true;
  if (qty > prev.qty) return true;
  if (qty===prev.qty && face>prev.face) return true;
  if (prev.face!==1 && face===1 && qty>=Math.ceil(prev.qty/2)) return true;
  if (prev.face===1 && face!==1 && qty>=prev.qty*2+1) return true;
  return false;
};

const countFace = (dice, face) =>
  face===1 ? dice.filter(d=>d===1).length : dice.filter(d=>d===face||d===1).length;

// — Die CSS —
const Die = ({ value, size=56, highlight=false }) => {
  const isAce = value===1;
  const pips = PIP_GRID[value] || Array(9).fill(0);
  return (
    <div style={{
      width:size, height:size,
      background:'white', borderRadius:size*.15,
      border: highlight ? '2.5px solid #f0d060' : isAce ? '2px solid #cc0000' : '1.5px solid #ccc',
      boxShadow: highlight ? '0 0 12px #f0d060bb' : '0 3px 8px rgba(0,0,0,.3)',
      display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'repeat(3,1fr)',
      padding:size*.07, gap:size*.03,
      transform: highlight ? 'scale(1.08)' : 'none',
      transition:'all .2s', flexShrink:0,
    }}>
      {pips.map((hasPip,i) => (
        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          {hasPip===1 && <div style={{
            width:isAce ?size-20:'65%', height:isAce ?size-20:'65%', borderRadius:'50%',
            background: isAce ? '#cc0000' : '#1a1a2e',
            boxShadow: isAce ? '0 0 5px #cc000077' : undefined,
          }}/>}
        </div>
      ))}
    </div>
  );
};

const HiddenDie = ({ size=32 }) => (
  <div style={{
    width:size, height:size,
    background:'#5D4037', borderRadius:size*.15,
    border:'1.5px solid #8D6E63',
    boxShadow:'0 2px 4px rgba(0,0,0,.3)',
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'#D7CCC8', fontSize:size*.35, userSelect:'none', flexShrink:0,
  }}>?</div>
);

// — Player cup for opponents —
const OpponentCup = ({ player, isCurrentTurn, revealInfo, phase }) => {
  const showing = (phase==='reveal'||phase==='gameover') && revealInfo && player.dice.length>0;
  return (
    <div style={{
      flex:1, textAlign:'center', padding:'10px 6px',
      borderRadius:10,
      border: isCurrentTurn ? `2px solid ${player.color}` : '2px solid transparent',
      background: isCurrentTurn ? `${player.color}20` : '#00000022',
      transition:'all .3s', minWidth:0,
    }}>
      <div style={{color:player.color, fontWeight:'bold', fontSize:13, marginBottom:3}}>
        {isCurrentTurn ? '▶ ':''}{player.name}
      </div>
      <div style={{fontSize:28, margin:'2px 0'}}>🏺</div>
      {player.diceCount>0 ? (
        <>
          <div style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:3, marginTop:4}}>
            {Array.from({length:player.diceCount}).map((_,i) => <HiddenDie key={i} />)}
          </div>
          {showing && (
            <div style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:3, marginTop:6}}>
              {player.dice.map((d,k) => (
                <Die key={k} value={d} size={28}
                  highlight={d===revealInfo.face||(revealInfo.face!==1&&d===1)}/>
              ))}
            </div>
          )}
        </>
      ) : (
        <span style={{
          display:'inline-block', background:'#c62828', color:'white',
          borderRadius:10, padding:'2px 7px', fontSize:11, marginTop:4
        }}>Éliminé</span>
      )}
      <div style={{color:'#aaa7', fontSize:11, marginTop:4}}>
        {player.diceCount} dé{player.diceCount!==1?'s':''}
      </div>
    </div>
  );
};

export default function Perudo() {
  const init = () => ({
    players: NAMES.map((name,i) => ({id:i, name, dice:[], diceCount:5, color:COLORS[i], isHuman:i===0})),
    phase: 'rolling',
    currentBid: null,
    currentIdx: 0,
    turnStart: 0,
    message: 'Bienvenue au Perudo ! Lancez les dés pour commencer.',
    revealInfo: null,
    winner: null,
  });

  const [G, setG] = useState(init);
  const [bidQty, setBidQty] = useState(1);
  const [bidFace, setBidFace] = useState(2);
  const stateRef = useRef(G);
  useEffect(() => { stateRef.current = G; });

  const totalDice = G.players.filter(p=>p.diceCount>0).reduce((s,p)=>s+p.diceCount,0);
  const human = G.players[0];
  const isHumanTurn = G.phase==='bidding' && G.currentIdx===0 && human.diceCount>0;
  const humanBidValid = isValidBid(bidQty, bidFace, G.currentBid, totalDice);

  const doRollAll = () => setG(g => {
    const newPlayers = g.players.map(p => ({...p, dice: p.diceCount>0 ? roll(p.diceCount) : []}));
    const startIdx = newPlayers[g.turnStart].diceCount > 0
      ? g.turnStart
      : nextAlive(newPlayers, g.turnStart);
    return {
      ...g,
      players: newPlayers,
      phase:'bidding', currentBid:null, currentIdx:startIdx, revealInfo:null,
      message:`Les dés sont lancés ! C'est à ${newPlayers[startIdx].name} de miser.`,
    };
  });

  const doPlaceBid = (qty, face, fromIdx) => {
    const {players} = stateRef.current;
    setG(g => ({
      ...g,
      currentBid:{qty,face},
      currentIdx: nextAlive(players, fromIdx),
      message:`${players[fromIdx].name} mise : ${qty}× ${FACE_SYM[face]}`,
    }));
  };

  const doCallPerudo = (challengerIdx) => {
    const {players:p, currentBid:cb} = stateRef.current;
    if (!cb) return;
    const ad = p.filter(x=>x.diceCount>0).flatMap(x=>x.dice);
    const actual = countFace(ad, cb.face);
    const bidderIdx = prevAlive(p, challengerIdx);
    const bidWasRight = actual >= cb.qty;
    const loserIdx = bidWasRight ? challengerIdx : bidderIdx;
    const newPlayers = p.map((pl,i) => i===loserIdx ? {...pl, diceCount:Math.max(0,pl.diceCount-1)} : pl);
    const alive = newPlayers.filter(pl=>pl.diceCount>0);
    const gameWinner = alive.length===1 ? alive[0] : null;
    setG(g => ({
      ...g, players:newPlayers,
      phase: gameWinner ? 'gameover' : 'reveal',
      currentBid:null, winner:gameWinner, turnStart:loserIdx,
      revealInfo:{qty:cb.qty, face:cb.face, actual, bidWasRight, loserIdx},
      message: bidWasRight
        ? `${actual}× ${FACE_SYM[cb.face]} ! ${p[challengerIdx].name} avait tort — il perd un dé !`
        : `${actual}× ${FACE_SYM[cb.face]} ! ${p[bidderIdx].name} avait menti — il perd un dé !`,
    }));
  };

  // Bid suggestion
  useEffect(() => {
    const cb = G.currentBid;
    if (!cb) { setBidQty(1); setBidFace(2); return; }
    if (cb.qty+1 <= totalDice) { setBidQty(cb.qty+1); setBidFace(cb.face); }
    else if (cb.face < 6) { setBidQty(cb.qty); setBidFace(cb.face+1); }
    else { setBidQty(Math.ceil(cb.qty/2)); setBidFace(1); }
  }, [G.currentBid]);

  // Auto-roll when human eliminated
  useEffect(() => {
    if (G.phase!=='reveal') return;
    if (G.players[0].diceCount===0) {
      const t = setTimeout(doRollAll, 2400);
      return () => clearTimeout(t);
    }
  }, [G.phase]);

  // AI
  useEffect(() => {
    if (G.phase!=='bidding') return;
    const current = G.players[G.currentIdx];
    if (!current||current.isHuman||current.diceCount===0) return;
    const t = setTimeout(() => {
      const {players:p, currentBid:cb} = stateRef.current;
      const me = p[G.currentIdx];
      if (!me||me.diceCount===0) return;
      const ownDice = me.dice;
      const td = p.filter(x=>x.diceCount>0).reduce((s,x)=>s+x.diceCount,0);
      const unknown = td - ownDice.length;

      if (!cb) {
        const freq = {};
        ownDice.forEach(d=>freq[d]=(freq[d]||0)+1);
        const aces=freq[1]||0;
        let bF=2,bE=0;
        for(let f=2;f<=6;f++){
          const e=(freq[f]||0)+aces+Math.round(unknown/3);
          if(e>bE){bE=e;bF=f;}
        }
        doPlaceBid(Math.max(1,bE-1), bF, G.currentIdx);
        return;
      }

      const {qty,face}=cb;
      const own=countFace(ownDice,face);
      const est=own+Math.round(unknown*(face===1?1/6:1/3));

      if(qty>est+2){ doCallPerudo(G.currentIdx); return; }

      if(qty+1<=td) doPlaceBid(qty+1,face,G.currentIdx);
      else if(face<6) doPlaceBid(qty,face+1,G.currentIdx);
      else if(face!==1) doPlaceBid(Math.ceil(qty/2),1,G.currentIdx);
      else doCallPerudo(G.currentIdx);
    }, 900+Math.random()*900);
    return ()=>clearTimeout(t);
  }, [G.phase, G.currentIdx]);

  // — Render —
  return (
    <div style={{
      minHeight:'100vh', background:'#0f1923', display:'flex',
      flexDirection:'column', alignItems:'center', padding:'16px', paddingBottom:32,
      fontFamily:"'Segoe UI', sans-serif",
    }}>
      <div style={{color:'#f0d060', fontSize:28, fontWeight:'bold', letterSpacing:6,
                   textShadow:'0 0 20px #f0d06066', margin:'12px 0 16px'}}>
        🎲 PERUDO 🎲
      </div>

      {/* TABLE */}
      <div style={{
        width:'100%', maxWidth:660,
        background:'#2c5840', borderRadius:16, padding:20,
        border:'4px solid #8B6914',
        boxShadow:'0 16px 48px #000d',
      }}>
        {/* Message */}
        <div style={{
          background:'#00000066', borderRadius:8, padding:'9px 14px',
          marginBottom:14, textAlign:'center',
          border:'1px solid #f0d06033',
          color:'#f0d060', fontSize:13, fontStyle:'italic',
          minHeight:36, display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {G.message}
        </div>

        {/* Current bid chip */}
        {G.currentBid && (
          <div style={{textAlign:'center', marginBottom:12}}>
            <span style={{
              display:'inline-block', background:'transparent',
              color:'#f0d060', fontSize:16, fontWeight:'bold',
              border:'1.5px solid #f0d060', borderRadius:20,
              padding:'5px 18px',
            }}>
              Pari : {G.currentBid.qty}× {FACE_SYM[G.currentBid.face]}
            </span>
          </div>
        )}

        {/* Opponents */}
        <div style={{display:'flex', gap:8, marginBottom:14}}>
          {G.players.slice(1).map(p => (
            <OpponentCup
              key={p.id} player={p}
              isCurrentTurn={G.currentIdx===p.id && G.phase==='bidding'}
              revealInfo={G.revealInfo} phase={G.phase}
            />
          ))}
        </div>

        {/* Reveal count */}
        {G.revealInfo && (G.phase==='reveal'||G.phase==='gameover') && (
          <div style={{
            background:'#00000055', borderRadius:8, padding:'7px 14px',
            marginBottom:10, textAlign:'center',
            color:'#f0d060', fontWeight:'bold', fontSize:13,
          }}>
            {G.revealInfo.actual}× {FACE_SYM[G.revealInfo.face]} comptés
            — pari était {G.revealInfo.qty}
            {' '}{G.revealInfo.bidWasRight ? '✓ Correct !' : '✗ Faux !'}
          </div>
        )}

        {/* Divider */}
        <div style={{borderTop:'1px dashed #8B691455', margin:'10px 0'}}/>

        {/* Human player */}
        <div style={{
          background:'#00000033', borderRadius:10, padding:14,
          border: isHumanTurn ? `2px solid ${COLORS[0]}` : '2px solid transparent',
          transition:'all .3s',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <span style={{color:COLORS[0], fontWeight:'bold', fontSize:15}}>
              {isHumanTurn?'▶ ':''}{human.name}
            </span>
            <span style={{color:'#aaa8', fontSize:12}}>
              {human.diceCount} dé{human.diceCount!==1?'s':''}
            </span>
          </div>
          {human.diceCount>0 ? (
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              {human.dice.map((d,i) => (
                <Die key={i} value={d} size={60}
                  highlight={!!(G.revealInfo&&(d===G.revealInfo.face||(G.revealInfo.face!==1&&d===1)))}/>
              ))}
            </div>
          ) : (
            <div style={{color:'#f44', textAlign:'center', padding:8}}>Vous êtes éliminé 😔 — observez la partie</div>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{marginTop:14, width:'100%', maxWidth:660}}>

        {/* ROLL */}
        {G.phase==='rolling' && (
          <button onClick={doRollAll} style={{
            width:'100%', height:64, fontSize:22, fontWeight:'bold',
            background:'#f0d060', color:'#1a1a2e', border:'none',
            borderRadius:12, cursor:'pointer',
            boxShadow:'0 4px 16px #f0d06066',
            transition:'all .2s',
          }}
          onMouseOver={e=>e.currentTarget.style.transform='scale(1.02)'}
          onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
            🎲 LANCER LES DÉS !
          </button>
        )}

        {/* HUMAN BID */}
        {isHumanTurn && (
          <div style={{
            background:'#1a1a2e', borderRadius:12, padding:18,
            border:'2px solid #1565C044',
          }}>
            <div style={{color:'#90CAF9', textAlign:'center', fontSize:14,
                         fontWeight:'bold', marginBottom:14}}>
              Votre enchère — {totalDice} dés en jeu
            </div>
            <div style={{display:'flex', gap:12, marginBottom:16}}>
              <div style={{flex:1}}>
                <div style={{color:'#aaa', fontSize:12, marginBottom:5}}>Quantité</div>
                <select value={bidQty} onChange={e=>setBidQty(Number(e.target.value))}
                  style={{width:'100%', height:38, fontSize:30, borderRadius:6, padding:'0 8px', border:'1px solid #999'}}>
                  {Array.from({length:totalDice},(_,i)=>i+1).map(n=>(
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div style={{flex:1}}>
                <div style={{color:'#aaa', fontSize:12, marginBottom:5}}>Face</div>
                <select value={bidFace} onChange={e=>setBidFace(Number(e.target.value))}
                  style={{width:'100%', height:38, fontSize:30, borderRadius:6, padding:'0 8px', border:'1px solid #999'}}>
                  {[1,2,3,4,5,6].map(f=>(
                    <option key={f} value={f}>{FACE_SYM[f]} {f===1?'— As (Paco)':''}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{display:'flex', gap:12}}>
              <button
                onClick={()=>doPlaceBid(bidQty,bidFace,0)}
                disabled={!humanBidValid}
                style={{
                  flex:1, height:58, fontSize:18, fontWeight:'bold',
                  background: humanBidValid ? '#1565C0' : '#444',
                  color: humanBidValid ? 'white' : '#666',
                  border:'none', borderRadius:10, cursor: humanBidValid ? 'pointer':'not-allowed',
                  transition:'all .2s',
                }}>
                📈 MONTER
              </button>
              {G.currentBid && (
                <button
                  onClick={()=>doCallPerudo(0)}
                  style={{
                    flex:1, height:58, fontSize:18, fontWeight:'bold',
                    background:'#B71C1C', color:'white',
                    border:'none', borderRadius:10, cursor:'pointer',
                    boxShadow:'0 4px 12px #B71C1C66',
                    transition:'all .2s',
                  }}
                  onMouseOver={e=>e.currentTarget.style.transform='scale(1.03)'}
                  onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                  ⚖️ PERUDO !
                </button>
              )}
            </div>
          </div>
        )}

        {/* WAITING */}
        {G.phase==='bidding' && !isHumanTurn && human.diceCount>0 && (
          <div style={{textAlign:'center', padding:16, color:'#888', fontSize:14, fontStyle:'italic'}}>
            ⏳ {G.players[G.currentIdx]?.name} réfléchit…
          </div>
        )}

        {/* NEW ROUND */}
        {G.phase==='reveal' && human.diceCount>0 && (
          <button onClick={doRollAll} style={{
            width:'100%', height:64, fontSize:20, fontWeight:'bold',
            background:'#f0d060', color:'#1a1a2e', border:'none',
            borderRadius:12, cursor:'pointer', marginTop:6,
            boxShadow:'0 4px 16px #f0d06066',
          }}>
            🎲 NOUVEAU TOUR !
          </button>
        )}

        {/* GAME OVER */}
        {G.phase==='gameover' && (
          <div style={{
            textAlign:'center', background:'#f0d06011',
            border:'2px solid #f0d060', borderRadius:12, padding:24, marginTop:6,
          }}>
            <div style={{color:'#f0d060', fontSize:24, fontWeight:'bold', marginBottom:16}}>
              🏆 {G.winner?.name} a gagné ! 🏆
            </div>
            <button onClick={()=>setG(init())} style={{
              fontSize:16, fontWeight:'bold', padding:'10px 28px',
              background:'#f0d060', color:'#1a1a2e',
              border:'none', borderRadius:8, cursor:'pointer',
            }}>
              🔄 Rejouer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}