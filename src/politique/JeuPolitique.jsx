import React from 'react';
import { PolitiqueProvider, usePolitiqueState } from './PolitiqueContext';
import AccueilPolitique from './AccueilPolitique';
import EcranJeu from './EcranJeu';

function PolitiqueRouter() {
  const { ecran } = usePolitiqueState();
  return ecran === 'accueil' ? <AccueilPolitique /> : <EcranJeu />;
}

export default function JeuPolitique() {
  return (
    <PolitiqueProvider>
      <PolitiqueRouter />
    </PolitiqueProvider>
  );
}
