/**
 * EspeceControl — carte d'identité de l'espèce joueur + dialogue Évolution
 */

import { useMemo, useState } from 'react';
import {
  Box, Typography, Chip, Button,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { GENES, GENE_CATEGORIES } from '../data/genes';
import { BIOMES, BIOME_ORDER }    from '../data/biomes';
import { buildPlayerSpecies }     from './buildPlayerSpecies';

const CATEGORY_COLORS = {
  ALIMENTATION: '#e8a020',
  LOCOMOTION:   '#4a9eff',
  DEFENSE:      '#c04444',
  SOCIAL:       '#8855cc',
  REPRODUCTION: '#cc55aa',
  ADAPTATION:   '#44aa88',
};

// ── Composant ─────────────────────────────────────────────────────────────────

const EspeceControl = ({ engine, playerState, stats, onUpdate }) => {
  const [evoOpen, setEvoOpen] = useState(false);

  const playerSvgUrl = useMemo(
    () => buildPlayerSpecies(playerState.genes ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify([...(playerState.genes ?? [])].sort())],
  );

  const biomeName = BIOMES[playerState.currentBiome]?.name ?? playerState.currentBiome;
  const ownedSet  = new Set(playerState.genes);

  const handleBuyGene = (geneId) => {
    engine.unlockGene(geneId);
    onUpdate();
  };

  const handleMigrate = (biomeId) => {
    engine.migrateToBiome(biomeId);
    onUpdate();
  };

  const handleSellGene = (geneId) => {
    engine.sellGene(geneId);
    onUpdate();
  };

  const handleRestart = () => {
    engine.restartBiome();
    onUpdate();
  };

  const dominatedSet = new Set(playerState.dominatedBiomes ?? []);

  const unlockedSet = new Set(playerState.biomesUnlocked);

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

      {/* ── Carte espèce ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
        <Box sx={{
          width: 96, height: 84,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: '#081220', borderRadius: 1, border: '1px solid #1e2d45',
        }}>
          <img
            src={playerSvgUrl}
            width={96} height={84}
            alt="espèce joueur"
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Typography sx={{ color: '#00ffaa', fontSize: '0.75rem', fontWeight: 'bold' }}>
          {playerState.name}
        </Typography>
        <Typography sx={{ color: '#446688', fontSize: '0.6rem' }}>
          {biomeName}
        </Typography>
      </Box>

      {/* ── Stats ── */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-around',
        bgcolor: '#081220', borderRadius: 1, p: 1, border: '1px solid #1e2d45',
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#00ffaa', fontSize: '1rem', fontWeight: 'bold', lineHeight: 1 }}>
            {stats.population}
          </Typography>
          <Typography sx={{ color: '#446688', fontSize: '0.55rem', mt: 0.25 }}>POP</Typography>
        </Box>
        <Box sx={{ width: '1px', bgcolor: '#1e2d45' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#ffcc44', fontSize: '1rem', fontWeight: 'bold', lineHeight: 1 }}>
            {playerState.evolutionPoints}
          </Typography>
          <Typography sx={{ color: '#446688', fontSize: '0.55rem', mt: 0.25 }}>PTS ÉVO</Typography>
        </Box>
      </Box>

      {/* ── Biomes ── */}
      <Box>
        <Typography sx={{
          color: '#2a4a6a', fontSize: '0.55rem', mb: 0.5,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Biomes
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          {BIOME_ORDER.map(biomeId => {
            const biome    = BIOMES[biomeId];
            const unlocked = unlockedSet.has(biomeId);
            const current  = playerState.currentBiome === biomeId;
            const dominated = dominatedSet.has(biomeId);
            return (
              <Box
                key={biomeId}
                onClick={() => unlocked && !current && handleMigrate(biomeId)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 1, py: 0.5, borderRadius: 0.75, border: '1px solid',
                  borderColor: current ? '#00ffaa55' : dominated ? '#aaaa0033' : unlocked ? '#1e3a5a' : '#0d1a26',
                  bgcolor: current ? '#00ffaa0d' : dominated ? '#1a1a0008' : 'transparent',
                  cursor: unlocked && !current ? 'pointer' : 'default',
                  opacity: unlocked ? 1 : 0.35,
                  transition: 'background-color 0.15s',
                  '&:hover': unlocked && !current ? { bgcolor: biome.color + '22' } : {},
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', lineHeight: 1 }}>{biome.emoji}</Typography>
                <Typography sx={{
                  fontSize: '0.62rem', flex: 1,
                  color: current ? '#00ffaa' : dominated ? '#888855' : unlocked ? '#aabbcc' : '#3a4a5a',
                  fontWeight: current ? 'bold' : 'normal',
                }}>
                  {biome.name}
                </Typography>
                {dominated && <Typography sx={{ fontSize: '0.6rem', lineHeight: 1 }}>👑</Typography>}
                {current && !dominated && (
                  <Typography sx={{ fontSize: '0.5rem', color: '#00ffaa88' }}>◀</Typography>
                )}
                {!unlocked && (
                  <Typography sx={{ fontSize: '0.55rem', color: '#3a4a5a' }}>🔒</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Gènes actifs ── */}
      {playerState.genes.length > 0 && (
        <Box>
          <Typography sx={{
            color: '#2a4a6a', fontSize: '0.55rem', mb: 0.5,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            Gènes actifs
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
            {playerState.genes.map(gId => {
              const gene = GENES[gId];
              const col  = CATEGORY_COLORS[gene?.category] ?? '#aaa';
              return (
                <Chip
                  key={gId}
                  label={gene?.name ?? gId}
                  size="small"
                  sx={{
                    height: 17, fontSize: '0.52rem',
                    bgcolor: col + '22', color: col,
                    border: `1px solid ${col}44`,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── Bouton RECOMMENCER (population à 0) ── */}
      {stats.population === 0 && (
        <Button
          variant="outlined"
          fullWidth
          size="small"
          onClick={handleRestart}
          sx={{
            color: '#ff6644', borderColor: '#ff664433', fontSize: '0.7rem',
            letterSpacing: '0.15em', py: 0.75,
            '&:hover': { borderColor: '#ff6644', bgcolor: '#ff66440d' },
          }}
        >
          🔄 RECOMMENCER CE BIOME
        </Button>
      )}

      {/* ── Bouton ÉVOLUTION ── */}
      <Button
        variant="outlined"
        fullWidth
        size="small"
        onClick={() => setEvoOpen(true)}
        sx={{
          color: '#00ffaa', borderColor: '#00ffaa33', fontSize: '0.7rem',
          letterSpacing: '0.15em', py: 0.75,
          '&:hover': { borderColor: '#00ffaa', bgcolor: '#00ffaa0d' },
        }}
      >
        🧬 ÉVOLUTION
      </Button>

      {/* ── Dialog Évolution ── */}
      <Dialog
        open={evoOpen}
        onClose={() => setEvoOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#070d1a', border: '1px solid #1e2d45',
            color: '#ccc', maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ color: '#00ffaa', fontSize: '0.9rem', pb: 0.5 }}>
          🧬 Évolution — {playerState.evolutionPoints} pts disponibles
        </DialogTitle>

        <DialogContent sx={{ p: 1.5 }}>
          {GENE_CATEGORIES.map(cat => {
            const catGenes = Object.values(GENES).filter(g => g.category === cat);
            const catColor = CATEGORY_COLORS[cat];
            return (
              <Box key={cat} sx={{ mb: 2 }}>
                <Typography sx={{
                  color: catColor, fontSize: '0.6rem',
                  textTransform: 'uppercase', letterSpacing: '0.12em', mb: 0.75,
                }}>
                  {cat}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {catGenes.map(gene => {
                    const owned      = ownedSet.has(gene.id);
                    const available  = !owned && gene.requires.every(r => ownedSet.has(r));
                    const affordable = playerState.evolutionPoints >= gene.cost;
                    const clickable  = available && affordable;
                    const canSell    = owned && !playerState.genes.some(id => GENES[id]?.requires.includes(gene.id));

                    return (
                      <Box
                        key={gene.id}
                        onClick={() => clickable && handleBuyGene(gene.id)}
                        sx={{
                          display: 'flex', alignItems: 'flex-start', gap: 1,
                          p: 0.75, borderRadius: 0.75, border: '1px solid',
                          borderColor: owned
                            ? '#0a2a18'
                            : available ? catColor + '44' : '#141e30',
                          bgcolor: owned
                            ? '#081a10'
                            : available ? catColor + '0d' : 'transparent',
                          cursor: clickable ? 'pointer' : 'default',
                          opacity: owned ? 0.55 : available ? (affordable ? 1 : 0.45) : 0.3,
                          transition: 'background-color 0.15s',
                          '&:hover': clickable ? { bgcolor: catColor + '1a' } : {},
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{
                            fontSize: '0.68rem',
                            color: owned ? '#44cc88' : available ? '#ddd' : '#556',
                            fontWeight: owned ? 'bold' : 'normal',
                          }}>
                            {owned ? '✓ ' : available ? '' : '🔒 '}{gene.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.56rem', color: '#445566', mt: 0.15 }}>
                            {gene.description}
                          </Typography>
                          {!owned && !available && gene.requires.length > 0 && (
                            <Typography sx={{ fontSize: '0.53rem', color: '#442a10', mt: 0.25 }}>
                              Requis : {gene.requires.map(r => GENES[r]?.name ?? r).join(', ')}
                            </Typography>
                          )}
                        </Box>
                        {owned ? (
                          <Typography
                            onClick={(e) => { e.stopPropagation(); if (canSell) handleSellGene(gene.id); }}
                            sx={{
                              fontSize: '0.55rem', flexShrink: 0, mt: 0.1,
                              color: canSell ? '#665500' : '#222',
                              cursor: canSell ? 'pointer' : 'default',
                              '&:hover': canSell ? { color: '#cc9900' } : {},
                            }}
                          >
                            ↩ {Math.floor(gene.cost / 2)}pt
                          </Typography>
                        ) : (
                          <Typography sx={{
                            fontSize: '0.65rem', fontWeight: 'bold',
                            flexShrink: 0, mt: 0.1,
                            color: affordable ? '#ffcc44' : '#553300',
                          }}>
                            {gene.cost}pt
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default EspeceControl;
