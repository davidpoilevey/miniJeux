import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { InfoDiv } from './BacterieDiv';

const BacterieTable = ({ open,setOpen, bacteries }) => {
  const [expanded, setExpanded] = useState(null);

  const handleAccordionChange = (index) => {
    setExpanded(index === expanded ? null : index);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Liste des bactéries</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bacteries.map((bacterie, index) => (
                <React.Fragment key={index}>
                  <TableRow onClick={() => handleAccordionChange(index)}>
                    <TableCell colSpan={1}>
                      <Accordion expanded={expanded === index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{bacterie.ptiNom}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <InfoDiv bact={bacterie}/>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Fermer</Button>
        </DialogActions>
      </Dialog>
  )
};

export default BacterieTable;
