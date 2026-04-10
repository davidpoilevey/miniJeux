import { useState } from "react";
import {
  Box, Typography, Divider, Grid, Avatar,
  Tabs,  CardContent, Tooltip, Card, CardHeader,
  Tab,
  Button
} from "@mui/material";
import { useLab } from "../LabContext";
import {
  BACTERIA_DATA, BIO_REACTOR_DATA, MACHINE_DATA
} from "../bactData";

import marketImg from '../images/labMarket.png';
import { ProductCard } from "../components/ProductionWidget";

// icons et helpers non modifiés
import {
  ShoppingCartIcon, ScienceIcon, PrecisionManufacturingIcon, BiotechIcon,
  CreditCardOff,
  CreditCard,
  PrecisionManufacturing,
  Science,
  Biotech,
  ShoppingCart,
  AttachMoney
} from "@mui/icons-material";
import { OnBoardingStep } from "../../OnBoardingContext";

function isAlreadyInLab(labState, item, type) {
  switch (type) {
    case "machine":
      return labState.machines?.some(m => m.id === item.id);
    case "reactor":
      return labState.reactors?.some(r => r.name === item.name);
    case "bacteria":
      return labState.bacteria?.some(b => b.name === item.name);
    default:
      return false;
  }
}

const MarketView = ({ onSelect }) => {
  const {
    labState, research, addMachine, addBacteria, addReactor,
    addResource, addLog, market, removeContract
  } = useLab();

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  const handleBuyResource = (ressid, amount) => {
    const pdct = market.prices.find(p => p.id == ressid);
    if (!pdct) return addLog("Produit inconnu " + ressid);
    const cost = pdct.value * amount;
    if (labState.resources.credits < cost) {
      addLog("Crédits insuffisants !");
      return;
    }
    addResource(ressid, amount);
    addResource("credits", -cost);
    addLog(`Achat de ${amount} unités de ${ressid} pour ${cost.toFixed(1)} ₡.`);
  };

  const handleSellResource = (ressid, amount = -1) => {
    const pdct = market.prices.find(p => p.id == ressid);
    if (!pdct) return addLog("Produit inconnu " + ressid);
    if (amount < 0) amount = labState.resources[ressid];
    if ((labState.resources[ressid] || 0) < amount) {
      addLog("Pas assez de stock !");
      return;
    }
    const gain = pdct.value * amount;
    addResource(ressid, -amount);
    addResource("credits", gain);
    addLog(`Vente de ${amount} unités de ${ressid} pour ${gain.toFixed(1)} ₡.`);
  };

  return (
    <Box sx={{ pb: 2, background:'rgba(200,244,190,0.5)' }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src={marketImg} />
        <Typography variant="h4" gutterBottom>
          Marché du Labo
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* --- Onglets principaux --- */}
         <OnBoardingStep stepId="achatVente" 
                          message="Dans la zone Achat/Vente, vous pourrez vendre votre production de biomasse et autre derivés de vos bacteries" >
       <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2 }}
      >
        <Tab label="Outils de Production" />
        <Tab label="Machines" />
        
                             
        <Tab label="Achat-Vente" />
        <Tab label="Missions" />
      </Tabs>
                          </OnBoardingStep>

      {/* --- Contenu des onglets --- */}
      {tabIndex === 0 && (
        <Box>
          {/* Réacteurs */}
          <Typography variant="h6">Réacteurs</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {BIO_REACTOR_DATA.map((r) => {
              if (isAlreadyInLab(labState, r, "reactor")) return null;
              return (
                <Grid item xs={12} md={4} key={r.id}>
                  <ItemCard
                    title={r.name}
                    subtitle={r.description}
                    cost={r.cost}
                    category="reactor"
                    onSelect={() => onSelect(r)}
                    onBuy={(e) => {
                      addReactor(r);
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    disabledReason={
                      isAlreadyInLab(labState, r, "reactor")
                        ? "Déjà dans le labo"
                        : r.cost > labState.resources.credits
                        ? "Pas assez de crédits"
                        : null
                    }
                    disabled={
                      isAlreadyInLab(labState, r, "reactor") ||
                      r.cost > labState.resources.credits
                    }
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Souches */}
          <Typography variant="h6">Souches bactériennes</Typography>
          <Grid container spacing={2}>
            {BACTERIA_DATA.map((bact) => (
              <Grid item xs={12} md={4} key={bact.id}>
                <ItemCard
                  title={bact.name}
                  subtitle={bact.description}
                  cost={bact.cost}
                  category="bacteria"
                  onSelect={() => onSelect(bact)}
                  onBuy={(e) => {
                    addBacteria(bact);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  disabledReason={
                    isAlreadyInLab(labState, bact, "bacteria")
                      ? "Déjà dans le labo"
                      : bact.cost > labState.resources.credits
                      ? "Pas assez de crédits"
                      : null
                  }
                  disabled={
                    isAlreadyInLab(labState, bact, "bacteria") ||
                    bact.cost > labState.resources.credits
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Typography variant="h6">Machines</Typography>
          <Grid container spacing={2}>
            {MACHINE_DATA.map((m) => {
              if (isAlreadyInLab(labState, m, "machine")) return null;
              return (
                <Grid item xs={12} md={4} key={m.id}>
                  <ItemCard
                    title={m.name}
                    subtitle={m.description}
                    cost={m.cost}
                    category={m.category}
                    image={m.image}
                    onSelect={() => onSelect(m)}
                    onBuy={(e) => {
                      addMachine(m.id);
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    disabledReason={
                      isAlreadyInLab(labState, m, "machine")
                        ? "Déjà dans le labo"
                        : !labState.unlockedMachines.includes(m.id)
                        ? "Bloqué"
                        : m.cost > labState.resources.credits
                        ? "Pas assez de crédits"
                        : null
                    }
                    disabled={
                      isAlreadyInLab(labState, m, "machine") ||
                      !labState.unlockedMachines.includes(m.id) ||
                      m.cost > labState.resources.credits
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Typography variant="h6">Marché des ressources</Typography>
          <Grid container spacing={2}>
            {market.prices.map((product, idx) => {
              const quantity = labState.resources[product.id] || 0;
              if (quantity == 0) return null;
              return (
                <Grid item xs={12} md={6} key={"price-" + idx}>
                  <ProductCard
                    product={product}
                    handleBuy={handleBuyResource}
                    handleSell={handleSellResource}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {tabIndex === 3 && (
        <Box>
          <Typography variant="h6">Contrats disponibles</Typography>
          <Grid container spacing={2}>
            {market.contracts.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <ItemCard
                  title={c.name}
                  subtitle={c.description}
                  contract={c}
                  onSelect={() => onSelect(c)}
                  onBuy={() => {
                    if (c.condition(labState, research)) {
                      removeContract(c.id);
                    } else {
                      addLog(
                        `Condition non remplie pour le contrat "${c.name}".`,
                        "warning"
                      );
                    }
                  }}
                  disabled={!c.condition(labState, research)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MarketView;


const categoryIcons = {
  reactor: <PrecisionManufacturing />,
  machine: <Science />,
  bacteria: <Biotech />,
  resource: <ShoppingCart />,
};

export const categoryColors = {
  reactor: "#b39ddb",
  support: "#81c784",
  bacteria: "#64b5f6",
  production: "#f266663a",
  security: "#ffd64f55",
};

function ItemCard({
  title,
  subtitle,
  image,
  icon,
  onSelect, onBuy, 
  disabled = false,disabledReason,
  cost,
  contract, //seulement si contract
  category = "generic",
  color,
}) {
  const displayColor = color || categoryColors[category] || "#e0e0e0";
  const displayIcon = icon || categoryIcons[category];

  return (
    <Card onClick={onSelect}
      sx={{ 
        opacity: disabled ? 0.6 : 1, maxWidth: 300,
        background: disabled
          ? "linear-gradient(135deg, #e0e0e0 30%, #bdbdbd 90%)"
          : `linear-gradient(135deg, ${displayColor}40 0%, white 100%)`,
        border: `1px solid ${displayColor}`,
        borderRadius: 2,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": !disabled && {
          transform: "translateY(-3px)",
          boxShadow: 4,
        },
      }}
    >
      <CardHeader title={title} subheader={<Typography variant="body2" sx={{ mt: 0.5 }}>
        💰 {cost} ₡ 
      </Typography>}
        avatar={image ? (
          <Avatar src={image} variant="rounded" sx={{ width: 56, height: 56 }} />
        ) : (
          <Avatar sx={{ bgcolor: displayColor, width: 56, height: 56 }}>
            {displayIcon}
          </Avatar>
        )} />
      <CardContent>
       {disabledReason&&<Typography color="error">{disabledReason}</Typography>}
          {/* <Typography variant="body1" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography> */}
          <Box>

            {contract && <Typography variant="caption">
              Récompense : +{contract.reward.credits}₡ / +{contract.reward.reputation} réputation
            </Typography>}
          </Box>
       
        <Tooltip title={disabled ?(contract?"Conditions non remplies":"Déjà dans le labo")
           : (contract?"Valider le contrat":"Acheter")}>
          <Button disabled={disabled} fullWidth
            onClick={disabled ? null : onBuy}>
              {contract?'Recuperer la recompense':'Acheter'}
            {cost ? (disabled ? <CreditCardOff /> : <CreditCard color={disabled ? "disabled" : "success.main"} />) : <AttachMoney />}
          </Button>

        </Tooltip>
      </CardContent>
    </Card>
  );
}

