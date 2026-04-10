import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useMaqCity } from './GangContext';            // <-- adapte le chemin
import { BONUS_POOL } from './MarketView';             // <-- adapte le chemin
import { GirlRecruitCard } from './RecruitView';
import { IntimacyMiniGame, PersonalActionsDialog, ProfessionalActionsDialog, SPECIALITE_PRICE } from './GangDialogs';
import miniGameFond from './miniGameBaise.png';
import biteImage from './bite.png';


export const StableView = () => {
  const { state, applyBonusToGirl, removeGirl, showAlert, assignGirlToDistrict, updateGirl, setState } = useMaqCity();

  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false);
  const [personalDialogOpen, setPersonalDialogOpen] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState(null);
  const [miniGameOpen, setMiniGameOpen] = useState(false);

  // ── Bonus de type 'girl' encore actifs ──
  const girlBonusDefs = [];
  state.bonuses.forEach((b) => {
    const def = BONUS_POOL.find((x) => x.id === b.poolId);
    if (def != null && def.target === 'girl' && def.duree > 0)
      girlBonusDefs.push({...def, id:b.id, poolId:def.id});
  });

  // ── Handlers ──
  const handleCaliner = (girl) => {
    const updated = { ...girl, stress: Math.max(0, girl.stress - 15), fatigue: Math.max(0, girl.fatigue - 5) };
    updateGirl(updated);
    showAlert(`${girl.name} se sent mieux 💖`, 'success');
  };

  const handleBaiser = (girl) => {
    const updated = { ...girl, stress: Math.max(0, girl.stress * 0.25), fatigue: Math.max(0, girl.fatigue * 0.8) };
    updateGirl(updated);
    showAlert(`${girl.name} est ravie et détendue 🔥`, 'success');
  };

  const handleRepos = (girl) => {
    const updated = { ...girl, assignedDistrictId: null };
    updateGirl(updated);
    showAlert(`${girl.name} est au repos.`, 'info');
  };

  const handleRenvoyer = (girl) => {
    removeGirl(girl);
    showAlert(`${girl.name} a quitté l'établissement.`, 'warning');
  };

  const handleLearnSpecialite = (girlId, specialite, cost) => {
    const girl = state.girls.find((g) => g.id === girlId);
    if (!girl) return;

    const updated = { ...girl, specialites: [...(girl.specialites || []), specialite] };
    updateGirl(updated);
   setState(prev=>({...prev, money:prev.money-SPECIALITE_PRICE}))
    showAlert(`${girl.name} a appris : ${specialite} !`, 'success');
  };

  const handleOpenProfessional = (girl) => {
    setSelectedGirl(girl);
    setProfessionalDialogOpen(true);
  };

  const handleOpenPersonal = (girl) => {
    setSelectedGirl(girl);
    setPersonalDialogOpen(true);
  };
  const handleOpenMiniGame = (girl) => { // <-- NOUVEAU
    setSelectedGirl(girl);
    setMiniGameOpen(true);
  };

  const handleMiniGameComplete = () => { // <-- NOUVEAU
    if (selectedGirl) {
      handleBaiser(selectedGirl);
    }
  };

  // ── On prépare les bonus avec le callback onApply déjà lié à chaque fille ──
  const getBonusesForGirl = (girl) =>
    girlBonusDefs.map((def) => ({
      ...def, 
      onApply: (bonusId) => applyBonusToGirl(bonusId, def.poolId, girl.id),
    }));

  return (
    <Box sx={{ background: '#121215', minHeight: '100%', p: 2 }}>
      {/* ── Cas vide ── */}
      {state.girls.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 280,
            border: '1px dashed #2e2e35',
            borderRadius: 12,
            background: '#1a1a1e',
          }}
        >
          <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
            Aucune fille — rendez-vous en Recrutement pour en embaucher
          </Typography>
        </Box>
      )}

      {/* ── Grille de cards ── */}
      <Grid container spacing={2}>
        {state.girls.map((girl) => (
          <Grid item xs={12} md={4} key={girl.id}>
            <GirlRecruitCard
              girl={girl}
              inStable
              girlBonuses={getBonusesForGirl(girl)}
              onOpenProfessional={handleOpenProfessional}
              onOpenPersonal={handleOpenPersonal}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Dialogues ── */}
      <ProfessionalActionsDialog
        open={professionalDialogOpen}
        onClose={() => setProfessionalDialogOpen(false)}
        girl={selectedGirl}
        districts={state.districts}
        playerMoney={state.money}
        onRepos={handleRepos}
        onRenvoyer={handleRenvoyer}
        onAssignDistrict={assignGirlToDistrict}
        onLearnSpecialite={handleLearnSpecialite}
      />

      <PersonalActionsDialog
        open={personalDialogOpen}
        onClose={() => setPersonalDialogOpen(false)}
        girl={selectedGirl}
        playerMoney={state.money}
        onCaliner={handleCaliner}
        onBaiser={handleBaiser}
        onOpenMiniGame={handleOpenMiniGame}
        onLearnSpecialite={handleLearnSpecialite}
      />
       <IntimacyMiniGame
        open={miniGameOpen}
        onClose={() => setMiniGameOpen(false)}
        onComplete={handleMiniGameComplete}
        girl={selectedGirl}
        backgroundImage={miniGameFond}
        cursorImage={biteImage}  
      />
    </Box>
  );
};