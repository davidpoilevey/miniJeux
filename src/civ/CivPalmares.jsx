import React from 'react';
import {
  Box, Card, CardContent, CardHeader, Avatar, LinearProgress,
  Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip,
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useCivContext } from './CivContext';
import { computeCivStats } from './utils/utils';
import { paperPropsCiv, TypoCiv } from './utils/civUI';

const MEDALS = ['🥇', '🥈', '🥉'];

const CivPalmares = () => {
  const { civsInGame, cities, tiles, techsUnlocked, builtWonders, turn, playerNation, getDiplomaticRelation, requestWar, requestTribute } = useCivContext();

  const classement = civsInGame
    .map(civ => computeCivStats(
      civ, cities, tiles,
      civ.id === playerNation.id ? techsUnlocked : (civ.technologies || civ.startingTechs || []),
      builtWonders, turn
    ))
    .sort((a, b) => b.score - a.score);

  const maxScore = Math.max(1, ...classement.map(c => c.score));

  return (
    <Box sx={paperPropsCiv.sx}>
      <Card sx={paperPropsCiv.sx}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: 'goldenrod' }}><EmojiEvents /></Avatar>}
          title={<TypoCiv variant="h4">Palmarès des civilisations</TypoCiv>}
          subheader={<TypoCiv>Tour {turn} — que l'histoire retienne les plus grands</TypoCiv>}
        />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><TypoCiv>Rang</TypoCiv></TableCell>
                <TableCell><TypoCiv>Civilisation</TypoCiv></TableCell>
                <TableCell><TypoCiv>Diplomatie</TypoCiv></TableCell>
                <TableCell sx={{ minWidth: 180 }}><TypoCiv>Score</TypoCiv></TableCell>
                <TableCell align="right"><TypoCiv>🏛️ Villes</TypoCiv></TableCell>
                <TableCell align="right"><TypoCiv>👥 Population</TypoCiv></TableCell>
                <TableCell align="right"><TypoCiv>⚔️ Puissance</TypoCiv></TableCell>
                <TableCell align="right"><TypoCiv>🧪 Technologies</TypoCiv></TableCell>
                <TableCell align="right"><TypoCiv>🏛️ Merveilles</TypoCiv></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classement.map((entry, i) => {
                const isPlayer = entry.civ.id === playerNation.id;
                return (
                  <TableRow
                    key={entry.civ.id}
                    sx={isPlayer ? { backgroundColor: 'rgba(255, 215, 0, 0.15)' } : undefined}
                  >
                    <TableCell><TypoCiv fontSize={20}>{MEDALS[i] || `${i + 1}.`}</TypoCiv></TableCell>
                    <TableCell>
                      <TypoCiv fontWeight={isPlayer ? 'bold' : 'normal'}>
                        {entry.civ.flag} {entry.civ.name}{isPlayer ? ' (vous)' : ''}
                      </TypoCiv>
                    </TableCell>
                    <TableCell>
                      {!isPlayer && <Stack spacing={0.5}>
                        <TypoCiv>{{ war: 'Guerre', tendu: 'Relations tendues', neutral: 'Neutre', peace: 'Paix', allied: 'Alliance' }[getDiplomaticRelation(playerNation, entry.civ)]}</TypoCiv>
                        {getDiplomaticRelation(playerNation, entry.civ) !== 'war' && <Button size="small" onClick={() => requestWar(entry.civ)}>Déclarer la guerre</Button>}
                        <Button size="small" onClick={() => requestTribute(entry.civ)}>Exiger un tribut</Button>
                      </Stack>}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(entry.score / maxScore) * 100}
                          sx={{
                            flex: 1, height: 10, borderRadius: 5,
                            '& .MuiLinearProgress-bar': { backgroundColor: entry.civ.color },
                          }}
                        />
                        <TypoCiv variant="body2">{entry.score}</TypoCiv>
                      </Box>
                    </TableCell>
                    <TableCell align="right"><TypoCiv>{entry.cities}</TypoCiv></TableCell>
                    <TableCell align="right">
                      <TypoCiv>{(entry.population * 1000).toLocaleString('fr-FR')}</TypoCiv>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={`${entry.unitCount} unité(s)`}>
                        <span><TypoCiv>{entry.military}</TypoCiv></span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right"><TypoCiv>{entry.techCount}</TypoCiv></TableCell>
                    <TableCell align="right"><TypoCiv>{entry.wonders}</TypoCiv></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CivPalmares;
