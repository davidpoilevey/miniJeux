export function dessiner(ctx, jardin, width, height, { layer = 'vivant', selected = null } = {}) {
  const sx = width / jardin.W, sy = height / jardin.H;
  ctx.fillStyle = '#101d20'; ctx.fillRect(0, 0, width, height);
  for (let y = 0; y < jardin.H; y++) for (let x = 0; x < jardin.W; x++) {
    const i = jardin.index(x, y), wet = jardin.water[i];
    if (layer === 'lumiere') ctx.fillStyle = `rgba(250,223,134,${jardin.light[i] * 0.45})`;
    else if (layer === 'nutriments') ctx.fillStyle = `rgba(225,147,68,${Math.min(0.85, jardin.nutrients[i] * 0.7)})`;
    else if (layer === 'eau') ctx.fillStyle = `rgba(58,180,224,${Math.min(0.85, wet)})`;
    else ctx.fillStyle = `rgba(87,155,169,${0.025 + Math.min(0.4, wet * 0.3) + ((x * 17 + y * 31) % 11) * 0.002})`;
    ctx.fillRect(x * sx, y * sy, sx + 0.2, sy + 0.2);
    if (layer === 'vivant' && jardin.soil[i] > 0) {
      ctx.fillStyle = `rgba(157,102,54,${0.08 + jardin.nutrients[i] * 0.28})`;
      ctx.fillRect(x * sx, y * sy, sx + 0.2, sy + 0.2);
    }
  }
  if (jardin.shower) {
    ctx.strokeStyle = '#82d4e5'; ctx.lineWidth = Math.max(1, sx * 0.12);
    for (let n = 0; n < 65; n++) {
      const x = (n * 37.13) % jardin.W, y = (n * 19.7 + jardin.tick * 0.8) % jardin.H;
      ctx.globalAlpha = jardin.rainAt(x, y) * 0.35;
      ctx.beginPath(); ctx.moveTo(x * sx, y * sy); ctx.lineTo((x - 0.25) * sx, (y + 1.4) * sy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  for (const spore of jardin.spores.values()) {
    if (jardin.occupied[jardin.index(spore.x, spore.y)]) continue;
    const x = (spore.x + 0.5) * sx, y = (spore.y + 0.5) * sy, r = Math.max(2.5, sx * 0.48);
    ctx.globalAlpha = !selected || selected === -spore.id ? 1 : 0.4;
    ctx.strokeStyle = `hsl(${spore.hue},60%,70%)`; ctx.fillStyle = '#101d20'; ctx.lineWidth = Math.max(1, sx * 0.15);
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (spore.favorable) {
      ctx.strokeStyle = '#d4efd1'; ctx.beginPath(); ctx.arc(x, y, r * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * spore.favorable / 15); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  for (const plant of jardin.plants.values()) {
    const highlighted = !selected || selected === plant.id;
    const hue = plant.hue, healthy = plant.stress < 5;
    ctx.globalAlpha = highlighted ? 1 : 0.32;
    ctx.strokeStyle = `hsl(${hue},40%,${healthy ? 42 : 26}%)`;
    ctx.lineWidth = Math.max(1, sx * 0.3);
    ctx.beginPath();
    for (const cell of plant.cells) if (cell.parent !== null) {
      const parent = plant.cells[cell.parent];
      ctx.moveTo((parent.x + 0.5) * sx, (parent.y + 0.5) * sy);
      ctx.lineTo((cell.x + 0.5) * sx, (cell.y + 0.5) * sy);
    }
    ctx.stroke();
    for (const cell of plant.cells) {
      const light = jardin.light[jardin.index(cell.x, cell.y)];
      ctx.fillStyle = `hsl(${hue},${healthy ? 57 : 20}%,${healthy ? 35 + light * 25 : 29}%)`;
      ctx.beginPath(); ctx.ellipse((cell.x + 0.5) * sx, (cell.y + 0.5) * sy, sx * 0.39, sy * 0.39, 0, 0, Math.PI * 2); ctx.fill();
    }
    const root = plant.cells[0];
    ctx.fillStyle = '#f0e8c8'; ctx.font = `600 ${Math.max(9, sx * 1.3)}px system-ui`;
    ctx.textAlign = 'center'; ctx.fillText(`${plant.id}${plant.falling ? ' ↓' : ''}`, (root.x + 0.5) * sx, (root.y > jardin.H - 4 ? root.y - 0.7 : root.y + 2.2) * sy);
  }
  ctx.globalAlpha = 1;
  for (const graft of jardin.grafts.values()) {
    const x1 = (graft.from.x + 0.5) * sx, y1 = (graft.from.y + 0.5) * sy;
    const x2 = (graft.to.x + 0.5) * sx, y2 = (graft.to.y + 0.5) * sy;
    ctx.strokeStyle = '#f6e3a3'; ctx.lineWidth = Math.max(2, sx * 0.3);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // Separate dots show the signed flow of each resource, not invented activity.
    for (const [resource, color, shift] of [['water', '#73dcff', -0.18], ['energy', '#ffe88b', 0.18], ['nutrients', '#ffa55d', 0]]) {
      if (Math.abs(graft[resource] || 0) < 0.001) continue;
      let progress = (jardin.tick % 20) / 20;
      if (graft[resource] < 0) progress = 1 - progress;
      ctx.fillStyle = color; ctx.beginPath();
      ctx.arc(x1 + (x2 - x1) * progress + shift * sy, y1 + (y2 - y1) * progress + shift * sy, Math.max(2, sx * 0.22), 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#fff1bc'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, sx * 0.75, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#b58b62'; ctx.fillRect(0, height - Math.max(2, sy * 0.4), width, Math.max(2, sy * 0.4));
  ctx.fillStyle = '#f0d991'; ctx.fillRect(0, 0, width, Math.max(2, sy * 0.3));
}
