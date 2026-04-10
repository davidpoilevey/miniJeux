import React from "react";
import { makeStyles } from '@mui/styles';
import { Card, CardContent } from "@mui/material";

const useStyles = makeStyles({
  card: {
    backgroundColor: 'lightgray',
    padding: '10px',
  },
});

const Plante = ()=> {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        {/* Contenu de la plante */}
      </CardContent>
    </Card>
  );
}
