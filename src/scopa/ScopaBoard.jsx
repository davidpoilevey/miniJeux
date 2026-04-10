import { GameBoardScopa } from "../belote/GameBoard"

import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useEffect, useMemo, useState } from 'react';
import { Carte } from "../poker/Card";
import { FlyingCard } from "./ScopaFlying";

export const ScopaBoard = ({ playerHands, currentDealer, playCard, ...props }) => {

    const handleCardClick = (card) => {
        playCard('bottom', card);
    }
    return <GameBoardScopa playerHands={playerHands}
currentDealer={currentDealer}
        handleCardClick={handleCardClick}>

        <ScopaDeck {...props} />
    </GameBoardScopa>
}

export const ScopaDeck = ({
    tableCards,
    pendingCapture,
    onSelectCapture, animation, setAnimation
}) => {
    // positions stables par index


    const positions = useMemo(() => {
        return tableCards.map((_, index) => ({
            x: (index % 4) * 70 - 100,
            y: Math.floor(index / 4) * 90 - 80,
            rotate: (index % 2 === 0 ? -1 : 1) * (5 + index)
        }));
    }, [tableCards.length]);

    // cartes impliquées dans au moins une capture
    const selectableCards = useMemo(() => {
        if (!pendingCapture) return new Set();

        const set = new Set();
        pendingCapture.options.forEach(combo =>
            combo.forEach(card => set.add(card))
        );
        return set;
    }, [pendingCapture]);
    useEffect(() => {
        if (animation?.phase === 'highlight') {
            const t = setTimeout(() => {
                setAnimation(a => ({ ...a, phase: 'capture' }));
            }, 400);

            return () => clearTimeout(t);
        }
        if (animation?.phase === 'capture') {
            const t = setTimeout(() => {
                setAnimation(null);
                onSelectCapture( animation.player,
                                    animation.playedCard,
                                    animation.takenCards); // MAJ state réel
            }, 400);

            return () => clearTimeout(t);
        }
    }, [animation]);



    return (
        <TableRoot>
           {animation&&<FlyingCard
  player={animation.player}
  card={animation.playedCard}
  onDone={() =>
    setAnimation(a => ({ ...a, phase: 'highlight' }))
  }
/>}

            {tableCards.map((card, index) => {
                const isSelectable =
                    pendingCapture && selectableCards.has(card);
                const isHighlighted =
                    animation?.phase === 'highlight' &&
                    animation.takenCards.includes(card);

                return (

                    <TableCard
                        key={index}
                        sx={{
                            transform: `
                translate(${positions[index].x}px, ${positions[index].y}px)
                rotate(${positions[index].rotate}deg)
              `,
                            ...(isHighlighted && highlightStyle),
                            filter:
                                pendingCapture ? 'brightness(0.5)' : null,
                            cursor: isSelectable ? 'pointer' : 'default'
                        }}
                    >
                        <Carte card={card} retourne={false} />
                    </TableCard>
                )
            })}

            {/* overlay des combinaisons */}
            {pendingCapture && (
                <CombosOverlay>
                    {pendingCapture.options.map((combo, i) => (
                        <ComboBox
                            key={i}
                            onClick={() => {
                                return onSelectCapture(
                                    pendingCapture.player,
                                    pendingCapture.playedCard,
                                    combo
                                )
                            }
                            }
                        >
                            {combo.map((card, j) => (
                                <MiniCard key={j}>
                                    <Carte card={card} retourne={false} />
                                </MiniCard>
                            ))}
                        </ComboBox>
                    ))}
                </CombosOverlay>
            )}
        </TableRoot>
    );
};
const highlightStyle = {
    boxShadow: '0 0 18px gold',
    transform: 'scale(1.05)'
};

const TableRoot = styled(Box)({
    position: 'relative',
    top: '50%',
    left: '50%',
    transform: 'translateX(-10%)',
});

const TableCard = styled(Box)({
    position: 'absolute',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    pointerEvents: 'none'
});

const CombosOverlay = styled(Box)({
    position: 'absolute',
    top: '0',
    left: '10%',
    transform: 'translateX(-50%) translateY(-50%)',
    display: 'flex',
    gap: 12,
    zIndex: 20
});

const ComboBox = styled(Box)({
    display: 'flex',
    gap: 4,
    padding: 6,
    borderRadius: 8,
    zIndex: 21,
    background: 'rgba(0,0,0,0.75)',
    cursor: 'pointer',
    border: '2px solid transparent',

    '&:hover': {
        borderColor: 'gold',
        transform: 'translateY(-4px)'
    }
});

const MiniCard = styled(Box)({
    transform: 'scale(0.6)',
    transformOrigin: 'center'
});
