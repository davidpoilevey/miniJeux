import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from "@mui/material";
import { playersByPosition } from "./beloteUtils";
import { getCardColor, getSuitSymbol } from "./BeloteBar";

const STATUS_EMOJI = {
    winner: '🏆',
    loser: '😐',
    renverse: '💥'
};

const STATUS_COLOR = {
    winner: '#2e7d32',
    loser: '#616161',
    renverse: '#c62828'
};

export const EndRoundDialog = ({ teams, open, roundSummary, nextRound }) => {

    return open?<Dialog
        open={open}
        maxWidth="sm"
        fullWidth
    >
        <DialogTitle sx={{ textAlign: 'center' }}>
            Fin de la manche 🎴
        </DialogTitle>

       {roundSummary&&<DialogContent>
            {[['team1', teams.team1], ['team2', teams.team2]].map(
                ([key, team]) => {
                    const summary = roundSummary[key];

                    return (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                my: 1,
                                borderRadius: 2,
                                bgcolor: '#f5f5f5'
                            }}
                        >
                            <Box>
                                <Typography variant="h6">
                                    {STATUS_EMOJI[summary.status]} {team.name}
                                </Typography>
                                <Typography variant="body2">
                                    Manche : {summary.roundPoints} pts
                                </Typography>
                                <Typography variant="caption">
                                    Total : {summary.totalScore} pts
                                </Typography>
                            </Box>

                            <Typography
                                variant="h5"
                                sx={{ color: STATUS_COLOR[summary.status] }}
                            >
                                {summary.status === 'renverse'
                                    ? 'Renversée'
                                    : summary.status === 'winner'
                                        ? 'Gagnante'
                                        : 'Perdante'}
                            </Typography>
                        </Box>
                    );
                }
            )}

            {/* Message spécial renversé */}
            {Object.values(roundSummary).some(
                t => t.status === 'renverse'
            ) && (
                    <Typography
                        sx={{ mt: 2, textAlign: 'center', color: '#c62828' }}
                    >
                        💥 Contrat chuté — 162 points pour l’équipe adverse
                    </Typography>
                )}
                 <Typography
                        sx={{ mt: 1, textAlign: 'center', color: '#203d83' }}
                    >
                      La premiere equipe a 1000 points gagne
                    </Typography>
        </DialogContent>}

        <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    nextRound();
                }}
            >
                Manche suivante ▶
            </Button>
        </DialogActions>
    </Dialog>:null

}


export const BeloteSnack=({showTakeAlert, setShowTakeAlert, taker, atout})=>{
    return <Snackbar
  open={showTakeAlert}
  autoHideDuration={2000}
  onClose={() => setShowTakeAlert(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    severity="info"
    variant="filled"
    sx={{
      fontSize: '16px',
      alignItems: 'center'
    }}
  >
    🂡 <strong>{taker==='bottom' ? 'Vous prenez' : `${playersByPosition[taker]?.name} prend`}</strong> à&nbsp;
    <span
      style={{
        color: getCardColor(atout),
        fontWeight: 'bold',
        fontSize: '18px',
        marginLeft: '4px'
      }}
    >
      {getSuitSymbol(atout)}
    </span>
  </Alert>
</Snackbar>

}