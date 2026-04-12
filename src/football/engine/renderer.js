import { CW, CH, FX, FY, FW, FH, GH, GW, GY1, GY2, PR, BR } from './constants';
import { TACTICS } from './tactics';

export function drawScene(ctx, g) {
  // ── Background ──────────────────────────────────────────────
  ctx.fillStyle = '#141a22';
  ctx.fillRect(0, 0, CW, CH);

  // ── Field stripes ───────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2e7d2e' : '#2a742a';
    ctx.fillRect(FX + i * (FW / 8), FY, FW / 8, FH);
  }

  // ── Lines ───────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth = 2;
  ctx.strokeRect(FX, FY, FW, FH);

  // Center line
  ctx.beginPath();
  ctx.moveTo(FX + FW / 2, FY);
  ctx.lineTo(FX + FW / 2, FY + FH);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(FX + FW / 2, FY + FH / 2, 66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FX + FW / 2, FY + FH / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // Penalty areas
  const paH = FH * 0.44, paW = FW * 0.16, paY = FY + (FH - paH) / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(FX,            paY, paW, paH);
  ctx.strokeRect(FX + FW - paW, paY, paW, paH);

  // ── Goals ───────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(FX - GW,  GY1, GW, GH);
  ctx.fillRect(FX + FW,  GY1, GW, GH);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(FX - GW, GY1, GW, GH);
  ctx.strokeRect(FX + FW, GY1, GW, GH);

  // Team labels
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#66aaff';
  ctx.fillText('MON ÉQUIPE ▶', FX + FW * 0.15, FY - 8);
  ctx.fillStyle = '#ff8888';
  ctx.fillText('◀ ADVERSAIRE', FX + FW * 0.85, FY - 8);

  // ── Players ─────────────────────────────────────────────────
  g.players.forEach(p => {
    const isT0 = p.team === 0;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(p.x + 2, p.y + 3, PR, PR * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(p.x, p.y, PR, 0, Math.PI * 2);
    ctx.fillStyle = p.stun > 0
      ? '#888888'
      : p.hasBall
        ? 'gold'
        : p.boost > 0
          ? (isT0 ? '#88ffaa' : '#ffaa88')
          : (isT0 ? '#4488ff' : '#ff4444');
    ctx.fill();
    ctx.strokeStyle = p.stun > 0 ? '#ffdd00' : (isT0 ? '#1144bb' : '#bb1111');
    ctx.lineWidth = p.stun > 0 ? 3 : 2;
    ctx.stroke();

    // Shirt number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.num, p.x, p.y);
  });

  // ── Ball ────────────────────────────────────────────────────
  const lob = g.ball.lob ?? 0;
  const br  = lob > 0 ? BR * (1 + Math.min(lob / 20, 1) * 0.45) : BR; // bigger while airborne

  // Ground shadow (larger offset when lobbed)
  const shadowOff = lob > 0 ? 7 + Math.min(lob / 8, 5) : 2;
  ctx.beginPath();
  ctx.ellipse(g.ball.x + 2, g.ball.y + shadowOff, br * 0.85, br * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${lob > 0 ? 0.25 : 0.18})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(g.ball.x, g.ball.y, br, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = lob > 0 ? '#888' : '#444';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // pentagon details
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 0.7;
  for (let a = 0; a < 5; a++) {
    const ang = (a / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(g.ball.x, g.ball.y);
    ctx.lineTo(g.ball.x + br * 0.55 * Math.cos(ang), g.ball.y + br * 0.55 * Math.sin(ang));
    ctx.stroke();
  }

  // ── Floating events ─────────────────────────────────────────
  g.events.forEach((e, i) => {
    const alpha = Math.min(1, e.frames / 40);
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,230,100,${alpha})`;
    ctx.fillText(e.text, CW / 2, FY + FH / 2 - 60 + i * 30);
  });

  // ── Goal animation ──────────────────────────────────────────
  if (g.goalAnim > 0) {
    const alpha = Math.min(1, g.goalAnim / 40);
    ctx.fillStyle = `rgba(255,215,0,${alpha * 0.22})`;
    ctx.fillRect(0, 0, CW, CH);
    ctx.save();
    ctx.translate(CW / 2, CH / 2);
    ctx.scale(1 + Math.sin(g.goalAnim * 0.25) * 0.12, 1 + Math.sin(g.goalAnim * 0.25) * 0.12);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = `rgba(255,235,0,${alpha})`;
    ctx.fillText(g.lastGoalTeam === 0 ? '⚽ BUT !' : '⚽ ILS MARQUENT !', 0, -22);
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillText(`${g.score[0]}  —  ${g.score[1]}`, 0, 26);
    ctx.restore();
  }

  // ── End screen ──────────────────────────────────────────────
  if (g.phase === 'ended') {
    ctx.fillStyle = 'rgba(0,0,0,0.76)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('MATCH TERMINÉ', CW / 2, CH / 2 - 55);
    const diff = g.score[0] - g.score[1];
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = diff > 0 ? '#44ff88' : diff < 0 ? '#ff6666' : '#ffdd44';
    ctx.fillText(diff > 0 ? '🏆 VICTOIRE !' : diff < 0 ? '😢 DÉFAITE' : '🤝 MATCH NUL', CW / 2, CH / 2);
    ctx.font = 'bold 34px Arial';
    ctx.fillStyle = '#ffdd44';
    ctx.fillText(`${g.score[0]}  —  ${g.score[1]}`, CW / 2, CH / 2 + 52);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('Appuyer ENTRÉE pour rejouer', CW / 2, CH / 2 + 105);
  }
}
