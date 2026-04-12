# SimulationShell — Guide d'intégration

Composant générique pour les simulations (bactéries, plantes, sprouts…).
Fichier source : `src/SimulationShell.jsx`

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Top bar : titre · cycle · play/pause · reset        │
├──────────────┬───────────────────────┬───────────────┤
│  Actions     │  Centre (simulation)  │  Stats        │
│  (gauche)    │  position: relative   │  (droite)     │
│  210px       │  flex: 1              │  240px        │
└──────────────┴───────────────────────┴───────────────┘
```

Les sidebars sont optionnelles : si `actions` ou `stats` est `undefined`, la colonne disparaît.

---

## Props de SimulationShell

| Prop           | Type       | Rôle                                              |
|----------------|------------|---------------------------------------------------|
| `title`        | string     | Affiché en haut à gauche                         |
| `day`          | number     | Compteur de cycle dans la top bar (optionnel)    |
| `dayLabel`     | string     | Libellé du compteur (défaut : `"Cycle"`)         |
| `isRunning`    | bool       | État play/pause                                   |
| `onToggle`     | () => void | Bascule play/pause                               |
| `onReset`      | () => void | Bouton reset (optionnel)                         |
| `onFastForward`| () => void | Bouton accélérer (optionnel)                     |
| `onSettings`   | () => void | Icône settings (optionnel)                       |
| `actions`      | ReactNode  | Slot sidebar gauche                              |
| `stats`        | ReactNode  | Slot sidebar droite                              |
| `children`     | ReactNode  | Zone de simulation centrale                      |

---

## Composants fils

### `SimAction` — bouton dans la sidebar gauche

```jsx
<SimAction
  label="Mon action"
  icon={SomeMuiIcon}   // composant icône MUI (pas <Icon />, juste Icon)
  onClick={handler}
  disabled={condition}
  variant="default"    // ou "primary" pour le bouton brun/vert principal
/>
```

### `SimStat` — stat chiffrée dans la sidebar droite

```jsx
<SimStat label="Bacteries" value={aliveBacts.length} />
<SimStat label="Predateurs" value={predators.length} highlight={predators.length > 0} />
```

`highlight` passe le fond en vert discret et le chiffre en couleur primaire.

### `SimLog` — message contextuel

```jsx
<SimLog message={message} />
```

Affiche un bandeau avec bordure gauche colorée. Ne rend rien si `message` est vide/null.

### `SimSection` — séparateur de groupe dans la sidebar

```jsx
<SimSection label="Config initiale" />
```

Petit label uppercase pour organiser les actions ou stats en groupes.

---

## Pattern de pause recommandé

Le `setInterval` capture la valeur de `isRunning` à sa création — utiliser un `ref` pour éviter les closures obsolètes :

```js
const isRunningRef = useRef(true);

const toggleRunning = () => {
  isRunningRef.current = !isRunningRef.current;
  setIsRunning(r => !r);
};

useEffect(() => {
  const id = setInterval(() => {
    if (isRunningRef.current) tick();
  }, INTERVAL);
  return () => clearInterval(id);
});
```

---

## Template minimal

```jsx
import { SimulationShell, SimAction, SimStat, SimLog, SimSection } from '../SimulationShell';
import { Refresh } from '@mui/icons-material';

export const MonJeu = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [cycle, setCycle]         = useState(0);
  const [message, setMessage]     = useState('');
  const isRunningRef = useRef(true);

  const toggleRunning = () => {
    isRunningRef.current = !isRunningRef.current;
    setIsRunning(r => !r);
  };

  return (
    <SimulationShell
      title="Mon Jeu"
      day={cycle}
      isRunning={isRunning}
      onToggle={toggleRunning}
      onReset={() => { /* reset */ setMessage('Reset !'); }}
      actions={<>
        <SimSection label="Actions" />
        <SimAction label="Faire quelque chose" icon={Refresh} onClick={handler} />
      </>}
      stats={<>
        <SimStat label="Entites" value={count} />
        <SimStat label="Valeur cle" value={score} highlight />
        <SimLog message={message} />
      </>}
    >
      {/* Ton canvas / zone de simulation ici.
          La zone est position: relative, overflow: hidden.
          Utilise position: absolute si tu veux remplir tout l'espace. */}
      <MonCanvas />
    </SimulationShell>
  );
};
```

---

## Exemples existants

| Jeu | Fichier | Notes |
|-----|---------|-------|
| PotDeFleur | `src/genetic/PotDeFleur.js` | pause via ref, pot en `position: absolute, inset: 16px` |
| Etuve Bacteries | `src/bactery/Aquarium.jsx` | Menu scénarios dans le slot actions, TextFields config dans SimSection |
| Sprouts | `src/Sprouts/SproutPanel.jsx` | `SproutActions` + `SproutStats` dans le Provider, dims du centre via ResizeObserver |
