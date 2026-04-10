import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  Stack,
  Divider,
  CardHeader,
  Avatar,
} from "@mui/material";
import { useLab } from "../LabContext";
import imgReactor from "../images/reactor.png";
import { BACTERIA_DATA, MACHINE_DATA } from "../bactData";
import TodoPanel from "../components/TodoPanel";
import { GeneIconsDisplay } from "../components/SoucheDetail";
import { GaugeMeter } from "../components/ProductionWidget";
import { categoryColors } from "./MarketView";
import { OnBoardingStep } from "../../OnBoardingContext";

export default function LabView({ onSelect }) {
  const { labState } = useLab();
  const {
    reactors,
    bacteria,
    machines,
    resources
  } = labState;

  return (
    <Box sx={{
      height: '100%', backgroundSize: 'cover',
      backgroundImage: 'url(https://www.ote-ingenierie.com/wp-content/uploads/2019/07/laboratoire-recherche-unites-de-production-pharmaceutique-des-laboratoires-boiron-e1564389249552.jpg)'
    }}>
      {/* Todo panel */}
        <OnBoardingStep stepId="laboIntro" 
                message="Ici c'est le Laboratoire, c'est le centre nevralgique. Tu trouveras des tas d'infos et de hints importants dans ce TODO panel" >

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          width: '100%',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <TodoPanel />
      </Box>
                </OnBoardingStep>
            
      <Box
        sx={{
          display: "flex",
          flexWrap: 'wrap',
          gap: 3,
          height: "100%",
          p: 2,
        }}
      >


        {/* SECTION : Bio-réacteurs */}
        <Section
          title="🧪 Bio-réacteurs"
          emptyMessage="Aucun réacteur. Achetez-en un sur le marché pour démarrer vos expériences."
        >
          {reactors.map((reactor) => (
            <CardItem
              key={reactor.id}
              avatar={imgReactor}
              title={`Réacteur #${reactor.name}`}
              subtitle={`Efficacité : ${Math.round(reactor.efficiency * 100)}%`}
              progress={reactor.efficiency * 100} min={0} max={200}
              active={reactor.status === 'running'}
              items={reactor.assignedBacteria?.map((id) => {
                const bact = bacteria.find((b) => b.id === id);
                return bact ? `${bact.name} (${reactor.productionBySecond?.toFixed(2) || 0} ₡/sec)` : `Souche #${id}`;
              })}
              onClick={() => onSelect(reactor)}
            />
          ))}
        </Section>

        {/* SECTION : Souches bactériennes */}
        <Section
          title="🧬 Souches bactériennes"
          emptyMessage="Aucune souche active. Vous pouvez en acheter ou en créer une nouvelle."
        >
          {bacteria.map((b) => (
            <CardItem
              key={b.id}
              title={b.name || `Souche #${b.id}`}
              subtitle={`Santé : ${b.health.toFixed(2)}%`}
              progress={b.health} min={0} max={100}
              active={b.status !== 'dead'}
            avatar={b.image}
              onClick={() => onSelect(b)}
              accentColor={b.health < 0.5 ? "warning.main" : "success.main"}
            >
              <GeneIconsDisplay genes={b.genes} size={24} />
              {resources.adn_brut.includes(b.id) && <Chip label={<Box><Typography>ADN Brut disponible</Typography><Typography variant="caption">Bientot transformé en point de recherche</Typography></Box>} color="primary" />}
            </CardItem>
          ))}
        </Section>

        {/* SECTION : Machines */}
        <Section
          title="⚙️ Machines"
          emptyMessage="Aucune machine disponible. Achetez-en une pour améliorer vos performances."
        >
          {machines?.map((m) => {
            const machine = mergeMachineDefinition(m);// pour redonner les fonctions
            return <CardItem
              key={m.id}
              avatar={machine.image}  min={0} max={120}
              title={machine.name}
              category={machine.category}
              active={m.active}
              onClick={() => onSelect(machine)}
            />
          }
          )}
        </Section>
      </Box>
    </Box>
  );
}

/* ----- Sous-composants ----- */

function Section({ title, children, emptyMessage }) {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <Box sx={{ flex: 1, p: 1, borderRadius: 4, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(5px)' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {!hasChildren ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          {emptyMessage}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

function CardItem({
  title,
  subtitle, avatar, category,
  progress, active,
  items, min, max,
  onClick,
  accentColor,
  children
}) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        onClick={onClick}
        sx={{
          cursor: "pointer", minWidth: 200,
          transition: "0.3s",
          "&:hover": { boxShadow: 4, transform: "scale(1.02)" },
          bgcolor: category?categoryColors[category]:"background.paper",
          borderRadius: 3,
        }}
      >
        <CardHeader title={<Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>

          {title}
        {category&& <Box sx={{
            height: 20, width: 20, borderRadius: 5, border: '1px solid black;'
            , backgroundColor: active ? 'green' : 'red'
          }}></Box>}

        </Box>} avatar={<Avatar src={avatar} />} />
        {!category&&<CardContent sx={{ padding: '2px' }}>
          <Box sx={{ display: 'flex', justifyContent:'space-evenly' }}>
              <Box sx={{
            height: 20, width: 20, borderRadius: 5, border: '1px solid black;'
            , backgroundColor: active ? 'green' : 'red'
          }}></Box>
            {progress != null && (
              <Box sx={{height:50,width:100}}>
              <GaugeMeter
              label={subtitle} size={100}
              min={min} max={max}
                value={progress}
              />
              </Box>)}
          </Box>
          {Array.isArray(items) && (
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {items.map((it, i) => (
                <Typography
                  key={i}
                  variant="body2"
                  color="text.secondary"
                  noWrap
                >
                  • {it}
                </Typography>
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 1 }} />
          {children}
        </CardContent>}
      </Card>
    </Grid>
  );
}


export function mergeMachineDefinition(m) {
  const base = MACHINE_DATA.find(mc => mc.id === m.id);
  if (!base) {
    console.warn("Machine inconnue :", m.id);
    return m;
  }

  // Fusion de haut niveau
  const merged = {
    ...base,     // garde les fonctions et valeurs par défaut
    ...m,        // écrase avec les valeurs du labState
  };

  // Cas spécial : les actions (car il faut réinjecter les fonctions)
  if (base.actions && base.actions.length > 0) {
    merged.actions = base.actions.map(baseAction => {
      const persistedAction = m.actions?.find(a => a.id === baseAction.id) || {};
      // fusion action avec la fonction du modèle et l'état du runtime
      return {
        ...baseAction,
        ...persistedAction,
        effect: baseAction.effect, // on s'assure de garder la fonction
      };
    });
  }

  return merged;
}
