
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Drawer,
  Stack
} from "@mui/material";
import { useMaqCity } from "./GangContext";
import { useCallback, useMemo, useState } from "react";
import { OnBoardingStep } from "../OnBoardingContext";



export const BONUS_TARGET = {
  GIRL: "girl",
  DISTRICT: "district",
  GLOBAL: "global"
};
/** Structure type
Bonus = {
  id,
  name,
  image,
  price,
  description,
  target,         // 'girl' | 'district' | 'global'
  effect          // (entity) => patch
}
 */

export const BONUS_POOL = [
  {
    id: "b_peluche",
    name: "Peluche",
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Zoomteddybear.jpg',
    price: 100,
    duree: 1,
    description: "Réconforte une fille stressée.",
    target: "girl",
    effect: (girl) => {
      girl.stress = Math.max(0, girl.stress - 10)
    }
  }, {
    id: "maqChapeau",
    name: "Chapeau de maquereau",
    image: 'https://www.1001deguisement.fr/3142-large_default/chapeau-borsalino-ray%C3%A9.jpg',
    price: 200,
    duree: 1,
    description: "Donne du style et permet d'aborder des putes de rues.",
    target: "global",
    effect: (girl) => {
      // rien l'avoir suffit a debloquer le filtre
    }
  }, {
    id: "maqCostume",
    name: "Costume de maquereau",
    image: 'https://static.vecteezy.com/system/resources/thumbnails/070/427/221/small/male-model-in-colorful-skull-print-suit-on-runway-photo.jpg',
    price: 1000,
    duree: 1,
    description: "Donne la classe et permet d'aborder des escortes.",
    target: "global",
    effect: (girl) => {
      // rien l'avoir suffit a debloquer le filtre
    }
  }, {
    id: "maqLimousine",
    name: "Limousine de maquereau",
    image: 'https://drivingbooker.fr/wp-content/uploads/2018/09/Location-de-limousine-avec-chauffeur-Bas-Rhin.jpg',
    price: 10000,
    duree: 1,
    description: "Donne du mega-style et permet d'accoster des Escort de Luxe.",
    target: "global",
    effect: (girl) => {
      // rien l'avoir suffit a debloquer le filtre
    }
  },

  {
    id: "b_massage",
    name: "Massage",
    image: 'https://spa-et-cryo.fr/wp-content/uploads/2019/11/massage.jpg',
    price: 300,
    duree: 1,
    description: "Réduit fortement la fatigue et le stress.",

    target: "girl",
    effect: (girl) => {
      const bonus=Math.round(Math.random()*40);
      girl.fatigue = Math.max(0, girl.fatigue - (20+bonus));
       girl.stress = Math.max(0, girl.stress - (30+bonus));
    }
  },
  {
    id: "b_redBull",
    name: "Red Bull",
    image: 'https://alloapero.fr/wp-content/uploads/2022/10/Allo-Apero-Red-Bull.png',
    price: 50,
    duree: 1,
    description: "Réduit fortement la fatigue.",

    target: "girl",
    effect: (girl) => {
      girl.fatigue = Math.max(0, girl.fatigue - 30);
    }
  },

  {
    id: "b_maquillage",
    name: "Maquillage",
    image: 'https://www.institut-diva.ch/images/blog/e97f6effc030ed729dfc3d4a1fdb104514b7ccf0.jpeg',
    price: 200,
    duree: 3,
    description: "Augmente provisoirement le charme.",
    target: "girl",
    effect: (girl) => {
      girl.stats.charme++;
        girl.stress = Math.max(0, girl.stress - (20));
    }
    , onEnd: (state, targetId) => {

      state.girls = state.girls.map((g) => {
        const foundGirl = state.girls.find(g => g.id === targetId);
        if (foundGirl)
          return { ...foundGirl, stats: { ...foundGirl.stats, charme: foundGirl.stats.charme - 1 } }
        else
          return g;
      })
    }
  },

  {
    id: "b_seins",
    name: "Mammoplastie",
    image: 'https://www.chirurgie-montpellier.com/upload-categorie_ref_prod/medium360/adobestock-520223572-1.jpeg',
    price: 8000,
    duree: 2,
    description: "Augmente le charme de 1 point.",
    target: "girl",
    effect: (girl) => {
      girl.stats.charme++;
    }
  },
  {
    id: "b_pub_locale",
    name: "Campagne locale pour la gamme Premium",
    image: "https://www.savoie.gouv.fr/var/ezwebin_site/storage/images/actualites/actualites/presse-les-annonces-judiciaires-et-legales/226742-1-fre-FR/Presse-les-annonces-judiciaires-et-legales_large.jpg",
    price: 2500,
    duree: 1,
    description: "Augmente la demande sur les profils les plus select. S'adresse aux cadres superieurs",
    target: "district",
    effect: (district) => {
      district.clientele = Math.min(1,district.clientele+Math.random())
      district.demand.luxe = (district.demand.luxe || 0) + Math.random()/2;
      district.demand.escort = (district.demand.escort || 0) +Math.random()/2;
    }
  }
  ,
  {
    id: "b_pub_treslocale",
    name: "Graffitis publicitaires",
    image: "https://photos.tf1info.fr/images/1024/576/export_qrv3qqmys9ieq-51d7c7-0@1x.jpeg",
    price: 800,
    duree: 5,
    description: "Vante les merites de nos decharges a foutre",
    target: "district",
    effect: (district, state, doneOnce) => {
      if(!doneOnce){       
        if(!district.currentModifiers)
          district.currentModifiers={};
        district.currentModifiers.pub=true;
        district.clientele = Math.min(1,district.clientele+Math.random())
        district.demand.pute = (district.demand.pute || 0) + 0.2;
        district.demand.salope = (district.demand.salope || 0) + 0.4;
      }
    }
    , onEnd:(state, targetId) => {
      const d = state.districts.find(d => d.id === targetId);
      if (d) {
        d.clientele *= 0.8;
        d.demand.pute -= 0.2;
        d.demand.salope -= 0.4;
        d.currentModifiers.pub=false;
      }
    }
  }, {
    id: "b_corruption",
    name: "Réseau d'influence",
    image: "https://datalegaldrive.com/wp-content/uploads/2022/06/karoline-grabowska-pexels-jpg.jpg",
    price: 7000,
    duree: 6,
    description: "Réduit le risque policier mais augmente les coûts mensuels.",
    target: "district",
    effect: (district, state, doneOnce) => {
      district.risk.police = 0;
       if(!district.currentModifiers)
          district.currentModifiers={};
        district.currentModifiers.secu=true;
      if(!doneOnce)
        district.mensuel += 500;
    },
    onEnd: (state, targetId) => {
      const d = state.districts.find(d => d.id === targetId);
      if (d) {
        d.mensuel -= 500;
        d.risk.police = 0.5;
        d.currentModifiers.secu=false;
      }
    }
  }

  ,
  {
    id: "b_site",
    name: "Site Web",
    image: 'https://www.graphicstyle.fr/wp-content/uploads/940-site.jpg',
    price: 5000,
    duree: 5,
    description: "Augmente la demande pour toutes les filles.",
    target: "global",
    effect: (state) => {
      
      state.districts.forEach(d=>{
        d.clientele = Math.min(1, d.clientele + 0.4);
         if(!d.currentModifiers)
          d.currentModifiers={};
        d.currentModifiers.pub=true;
    })
    } , onEnd:(state, targetId) => {
      const d = state.districts.find(d => d.id === targetId);
      if (d) {
        d.currentModifiers.pub=false;
      }
    }
  },
  {
    id: "b_lumiere",
    name: "Éclairage urbain",
    image: "https://img.archiexpo.fr/images_ae/photo-mg/58041-13096463.jpg",
    price: 3000,
    duree: 10,
    description: "Réduit la violence mais augmente l'attention policière.",
    target: "district",
    effect: (district) => {
       if(!district.currentModifiers)
          district.currentModifiers={};
        district.currentModifiers.secu=true;
      district.risk.violence = Math.max(0, district.risk.violence - 0.5);
      district.risk.police = Math.min(1, district.risk.police + 0.1);
    } 
    , onEnd: (state, targetId) => {
      const d = state.districts.find(d => d.id === targetId);
      if (d) {
        d.mensuel -= 500;
        d.risk.police = 0.5;
        d.currentModifiers.secu=false;
      }
    }
  }
  ,
  {
    id: "b_securite",
    name: "Service de sécurité",
    image: 'https://papillon-paragliders.com/wp-content/uploads/2021/08/bodyguard.png',
    price: 8000,
    duree: 10,
    description: "Réduit les risques de violence.",
    target: "district",
    effect: (district, state, doneOnce) => {
      if (!doneOnce)
        district.risk = {
          ...district.risk,
          violence: Math.max(0, district.risk.violence - 0.6),
          police: Math.max(0, district.risk.police - 0.3)
        }
         if(!district.currentModifiers)
          district.currentModifiers={};
        district.currentModifiers.secu=true;
    }  
    , onEnd: (state, targetId) => {
      const d = state.districts.find(d => d.id === targetId);
      if (d) {
        d.risk.police = 0.3;
        d.risk.violence = 0.3;
        d.currentModifiers.secu=false;
      }
    }
  }, {
    id: "b_coaching",
    name: "Coaching personnel",
    image: "https://www.ownsport.fr/blog/wp-content/uploads/2018/01/Coach-sportif-1024x765.jpg",
    price: 600,
    duree: 4,
    description: "Améliore l'endurance et réduit le stress.",
    target: "girl",
    effect: (girl, st, doneOnce) => {
      if (!doneOnce)
        girl.stats.endurance += 1;
      girl.stress = Math.max(0, girl.stress - 15);
      girl.fatigue = Math.min(100, girl.fatigue + 3);
    },
    onEnd: (state, targetId) => {
      const g = state.girls.find(g => g.id === targetId);
      if (g) g.stats.endurance -= 1;
    }
  }, {
    id: "b_vacances",
    name: "Week-end de repos",
    image: "https://minuteluxe.com/wp-content/uploads/2021/06/6-1-1024x1024.png",
    price: 400,
    duree: 2,
    description: "Réinitialise fortement fatigue et stress, mais bloque la production.",
    target: "girl",
    effect: (girl, state, doneOnce) => {
      girl.fatigue = Math.max(0, girl.fatigue - 50);
      girl.stress = Math.max(0, girl.stress - 25);
      if (!doneOnce) {
        girl.arrestedUntilTurn = state.turn + 2;
      }
    },
  },
  {
    id: "b_drogue_legale",
    name: "Un peu de beuh",
    image: "https://www.cannaconnection.com/modules/psblog/uploads/1581067405.jpg",
    price: 400,
    duree: 3,
    description: "Augmente temporairement l'autonomie, baisse le stress mais reduit l'endurance",
    target: "girl",
    effect: (girl, st, doneOnce) => {
      if (!doneOnce) {
        girl.stats.autonomie = Math.min(5, girl.stats.autonomie + 2);
        girl.stats.endurance = Math.max(0, girl.stats.endurance - 1);
      }
      girl.stress = Math.round(girl.stress / 2)
    },
    onEnd: (state, targetId) => {
      const g = state.girls.find(g => g.id === targetId);
      if (g) {
        g.stats.autonomie -= 2;
        g.stats.endurance += 1;
        g.fatigue += 15;
      }
    }
  },
  {
    id: "b_drogue_paslegale",
    name: "Un peu de coke",
    image: "https://www.addictaide.fr/wp-content/uploads/2018/01/Cocaine-1024x682.jpg",
    price: 800,
    duree: 3,
    description: "Augmente temporairement l'autonomie et l'endurance, detend considerablement. mais génère du stress en descente.",
    target: "girl",
    effect: (girl, st, doneOnce) => {
      if (!doneOnce) {

        girl.stats.autonomie = Math.min(5, girl.stats.autonomie + 2);
        girl.stats.endurance = Math.min(5, girl.stats.endurance + 2);
      }
      girl.stress = Math.max(0, girl.stress - 20);
      girl.fatigue = Math.max(0, girl.fatigue - 10);
    },
    onEnd: (state, targetId) => {
      const g = state.girls.find(g => g.id === targetId);
      if (g) {
        g.stats.autonomie -= 2;
        g.stats.endurance -= 2;
        g.stress += 30;
        g.fatigue += 20;
      }
    }
  }


];




const MarketView = ({ showAlert }) => {
  const { state, setState } = useMaqCity();

  const buyBonus = (bonus) => {
    if (state.money < bonus.price) {
      showAlert("Fonds insuffisants", "warning");
      return;
    }
 const uniqueId =bonus.id.startsWith('maq')?bonus.id:Date.now() + Math.random();

    setState(prev => ({
      ...prev,
      money: prev.money - bonus.price,
      bonuses: [
        ...prev.bonuses,
        { id: uniqueId, poolId:bonus.id, remaining: bonus.duree }
      ]
    }));

    showAlert(`${bonus.name} ajouté au stock`, "success");
  };

   
    const maqMatos=useCallback((bid)=>{
      if(bid.startsWith('maq')){
        const bonusIds = new Set(state.bonuses.map(b => b.id));
        return bonusIds.has(bid);
      }
      return false;
    },[state.bonuses]);

  return (
    <Box sx={{ p: 3, display: 'flex', background: '#7a580f' }}>

      <Grid container spacing={2} flex={5}>
        {BONUS_POOL.map(b => (
          <Grid item xs={12} sm={6} md={4} key={b.id}>
            <Card sx={{position:'relative'}}>
              <CardMedia component="img" height="140" image={b.image} />
              <CardContent>
                
                <Typography variant="h6">{b.name}</Typography>
               
                <Typography variant="body2">{b.description}</Typography>
                <Typography variant="caption">
                  {b.target} · {b.duree ? `${b.duree} tours` : "instantané"}
                </Typography>
              </CardContent>
              {!maqMatos(b.id) && <CardActions>
                <Button
                  fullWidth
                  disabled={state.money < b.price}
                  onClick={() => buyBonus(b)}
                >
                  Acheter ({b.price}€)
                </Button>
              </CardActions>}
              {maqMatos(b.id) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      background:'rgba(255,255,255,0.4)',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      pointerEvents: 'none',
                    }}
                  >
                    🔒
                  </Box>
                )}
            </Card>
              <OnBoardingStep
  stepId="marche"
  condition={b.id==='maqChapeau'}
  message="Venez acheter ici tout ce qu'un maq a besoin pour veiller sur ses filles et son gagne-pain. "
></OnBoardingStep>
          </Grid>
        ))}
      </Grid>

      {state.bonuses.length > 0 && <BonusDrawer />}
    </Box>
  );
};

export default MarketView;


const BonusDrawer = ({ }) => {
  const { state, activateGlobalBonus } = useMaqCity();

  return (
    <Box sx={{ minWidth: 320, p: 2, flex: 1 }}>
      <Typography variant="h6">Bonus disponibles</Typography>

      <Stack spacing={2}>
        {state.bonuses.map(b => {
          const def = BONUS_POOL.find(x => x.id === b.poolId);
          const disabled = def.target !== BONUS_TARGET.GLOBAL;

          return (
            <Card key={b.id} sx={{ opacity: disabled ? 0.5 : 1 }}>
              <CardContent>
                <Typography>{def.name}</Typography>
                {b.remaining !== null && (
                  <Typography variant="caption">
                    {b.remaining} tours restants
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  disabled={disabled}
                  onClick={() => activateGlobalBonus(def)}
                >
                  Activer
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};
