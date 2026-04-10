// components/MachineActionDialog.jsx
import React, { useState, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, Typography
} from "@mui/material";
import { useLab } from "../LabContext";
import { GENE_DATA } from "../bactData";

export default function MachineActionDialog() {
  const { labState, setLabState, attachGene, unlockGene } = useLab();
  const pending = labState.pendingMachineActions || [];
  const current = pending[0] || null; // consume FIFO

  const [selectedGene, setSelectedGene] = useState(null);

  // quick map for genes
  const genes = useMemo(() => GENE_DATA, []);

  if (!current) return null;

  const handleClose = (cancel = false) => {
    if (cancel) {
      // rollback reservation cost if you reserved it earlier
      setLabState(prev => {
        const lab = { ...prev };
        lab.pendingMachineActions = (lab.pendingMachineActions || []).filter(p => p.id !== current.id);
        // example rollback if meta.reservedCredits === true
        if (current.meta?.reservedCredits) {
          lab.resources = lab.resources || {};
          lab.resources.credits = (lab.resources.credits || 0) + (current.meta.cost || 0);
        }
        return lab;
      });
    } else {
      // do nothing here (other handlers will consume)
    }
  };

  const handleConfirmCRISPR = () => {
    if (!selectedGene) return;
    // Perform action: attach the chosen gene to a bacterium or unlock globally
    // meta expected contain { targetBacteriaId? } or the UI will ask later
    setLabState(prev => {
      const lab = { ...prev };
      // consume request
      lab.pendingMachineActions = (lab.pendingMachineActions || []).filter(p => p.id !== current.id);
      // perform effect: here we unlock the gene globally (could be attachGene directly)
      // Prefer using unlockGene/attachGene exposed from useLab to keep logic consistent
      return lab;
    });

    // now call helper functions (outside setLabState to use hooks)
    if (selectedGene) {
      // two options: unlock globally or attach to a specific bacterium (we assume unlock)
      unlockGene(selectedGene.id);
    }

    // close handled by state change
  };

  // Render different dialogs by actionId
  return (
    <Dialog open={!!current} onClose={() => handleClose(true)}>
      <DialogTitle>
        {current.actionId === "useCRISPR" ? "CRISPR — sélectionner un gène" : "Action machine"}
      </DialogTitle>

      <DialogContent>
        {current.actionId === "useCRISPR" && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Choisissez un gène à débloquer / appliquer (coût estimé: {current.meta?.cost || '?'}).
            </Typography>
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {genes.map((g) => (
                <ListItem
                  key={g.id}
                  button
                  selected={selectedGene?.id === g.id}
                  onClick={() => setSelectedGene(g)}
                >
                  <ListItemText primary={`${g.icon || ""} ${g.name}`} secondary={g.description} />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* autres actionIds possibles */}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => handleClose(true)}>Annuler</Button>
        {current.actionId === "useCRISPR" && (
          <Button variant="contained" onClick={handleConfirmCRISPR} disabled={!selectedGene}>
            Confirmer ({current.meta?.cost || 0} ₡)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
