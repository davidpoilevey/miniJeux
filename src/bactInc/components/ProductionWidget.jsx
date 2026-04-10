import { useEffect, useRef, useState, useMemo } from "react";
import { Box, Typography, Stack, LinearProgress, Card, CardContent, Tooltip, IconButton } from "@mui/material";
import { PRODUCT_GLOBAL } from "../bactData";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { useLab } from "../LabContext";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";

const ProductionWidget = ({ resources, reactor }) => {
  const [productionRate, setProductionRate] = useState({});
  const {labState} = useLab();
  const prevResourcesRef = useRef(null);

  // Déterminer la source de données
  const currentResources = resources || labState?.resources;
  const isGlobal = !reactor;

  // Mémoriser les valeurs précédentes pour estimer la variation
  useEffect(() => {
    if (!prevResourcesRef.current) {
      prevResourcesRef.current = { ...currentResources };
      return;
    }

    const deltas = {};
    PRODUCT_GLOBAL.forEach((p) => {
      const prev = prevResourcesRef.current[p.id] || 0;
      const curr = currentResources[p.id] || 0;
      const diff = curr - prev;
      deltas[p.id] = diff; // diff par tick = diff/s
    });

    setProductionRate(deltas);
    prevResourcesRef.current = { ...currentResources };
  }, [currentResources]);

  // Calcul spécifique au réacteur (si on veut isoler sa production)
  const reactorProduction = useMemo(() => {
    if (!reactor || !labState) return null;
    const result = {};

    reactor.assignedBacteria.forEach((bId) => {
      const b = labState.bacteria.find((x) => x.id === bId);
      if (!b) return;

      b.product.forEach((pdt) => {
        const p = PRODUCT_GLOBAL.find((x) => x.id === pdt.name);
        if (!p) return;
        if (!result[p.id]) result[p.id] = 0;
        // Production théorique instantanée (approximative)
        const produced = b.baseYield * b.dna.efficiency * reactor.efficiency;
        result[p.id] += produced;
      });
    });

    return result;
  }, [reactor, labState]);

  const displayProducts = isGlobal ? PRODUCT_GLOBAL : PRODUCT_GLOBAL.filter((p) => reactorProduction?.[p.id]);

  return (
    <Box sx={{ p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        {isGlobal ? "Production globale" : `Production du réacteur : ${reactor?.productionBySecond?.toFixed(2)} credits/sec`}
      </Typography>

      <Stack spacing={1}>
        {displayProducts.map((p) => {
          const total = currentResources[p.id] ?? 0;
          const rate = productionRate[p.id] ?? 0;
          const localRate = reactor?.[p.id] ?? 0;
          if(total==0)
            return null;
          return (
            <Box
              key={p.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "white",
                p: 0.5,
                borderRadius: 1,
                boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="body2">
                {p.icon} {p.name}
              </Typography>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  {isGlobal ? `+${rate.toFixed(2)}/s` : `~${localRate.toFixed(2)} kg/s`}
                </Typography>
                <Typography variant="body2">{total.toFixed(2)}</Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ProductionWidget;



const TauxChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const chartData = data.map((v, i) => ({ index: i, value: v }));
  return (
    <Box sx={{ width: 100, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line type="monotone" dataKey="value" stroke="#4caf50" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const GaugeMeter = ({
  value = 50, // entre 0 et 100
  min = 0,
  max = 100,
  label = "Valeur",
  unit = "%",
  size = 150,
  strokeWidth = 10,
  colorGradient = ["#d32f2f", "#fbc02d", "#388e3c"],
  needleColor = "#333",
  backgroundColor = "#eee"
}) => {
  const radius = size / 2 - strokeWidth;
  const centerX = size / 2;
  const centerY = strokeWidth;

  // Angle du demi-cercle : 180° (PI radians)
  const startAngle = Math.PI; // gauche
  const endAngle = 0;         // droite

  // Calcul de la position de la valeur actuelle (0 → 1)
  const clampedValue = Math.min(Math.max(value, min), max);
  const ratio = (clampedValue - min) / (max - min);
  const angle = startAngle + (endAngle - startAngle) * ratio;

  // Coordonnées de l’aiguille
  const needleLength = radius * 0.9;
  const needleX = centerX + needleLength * Math.cos(angle);
  const needleY = centerY + needleLength * Math.sin(angle);

  // Arc coloré (gradient)
  const arcPath = describeArc(centerX, centerY, radius, startAngle, endAngle);

  return (
    <svg width={size} height={size/2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
      {/* Dégradé */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorGradient[0]} />
          <stop offset="50%" stopColor={colorGradient[1]} />
          <stop offset="100%" stopColor={colorGradient[2]} />
        </linearGradient>
      </defs>

      {/* Arc de fond */}
      <path
        d={arcPath}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Arc coloré */}
      <path
        d={arcPath}
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${ratio * Math.PI * radius}, ${Math.PI * radius}`}
        strokeLinecap="round"
        transform={`rotate(180 ${centerX} ${centerY})`}
      />

      {/* Aiguille */}
      <line
        x1={centerX}
        y1={centerY}
        x2={needleX}
        y2={needleY}
        stroke={needleColor}
        strokeWidth={3}
        strokeLinecap="round"
        style={{
          transition: "all 0.3s ease-in-out",
        }}
      />

      {/* Centre de l’aiguille */}
      <circle cx={centerX} cy={centerY} r={5} fill={needleColor} />

      {/* Label et valeur */}
      <text
        x={centerX}
        y={centerY - 10}
        textAnchor="middle"
        fontSize="14"
        fill="#555"
      >
        {label}
      </text>
      <text
        x={centerX}
        y={centerY + 15}
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="#111"
      >
        {clampedValue.toFixed(0)}{unit}
      </text>
    </svg>
  );
};

// --- Fonction utilitaire : génère l'arc d'un cercle SVG ---
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInRadians) {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}


export const  ProductCard=({ product, handleBuy, handleSell })=> {
  const { labState, addResource, addLog } = useLab();
  const quantity = labState.resources[product.id] || 0;

  const lastTwo = product.history.slice(-2);
  const delta = lastTwo.length === 2 ? lastTwo[1] - lastTwo[0] : 0;
  const positive = delta >= 0;


  return (
    <Card
      sx={{
        border: positive ? "2px solid #66bb6a" : "2px solid #ef5350",
        borderRadius: 2,minWidth:300,
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack>
            <Typography variant="h6">{product.icon} {product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Prix actuel : {product.value.toFixed(2)}₡
            </Typography>
            <Typography variant="body2">
              En stock : {Math.round(quantity)}
            </Typography>
          </Stack>
          <Stack alignItems="center">
            {positive ? (
              <ArrowUpward sx={{ color: "#66bb6a" }} />
            ) : (
              <ArrowDownward sx={{ color: "#ef5350" }} />
            )}
            <TauxChart data={product.history} />
          </Stack>
        </Stack>

        <Box sx={{ mt: 2 ,display:'flex', justifyContent:'space-around'}}>
          <Tooltip title="Acheter 10 unités">
            <IconButton disabled={labState.resources.credits<(10*product.value)} onClick={()=>{handleBuy(product.id, 10)}} color="success">💰</IconButton>
          </Tooltip>
        
          <Tooltip title="Tout Vendre">
            <IconButton disabled={quantity<=0} 
              onClick={()=>{handleSell(product.id)}} color="error">💶</IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}