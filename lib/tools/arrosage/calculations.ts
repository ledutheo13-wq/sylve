import type { Zone, ZoneResult, Mode } from "./types";
import { SIMPLE_METHODS, DETAIL_EQUIPMENT, ZONE_COLORS } from "./constants";

export function calculate(
  zones: Zone[],
  currentETP: number[],
  mode: Mode
): ZoneResult[] {
  return zones.map((z, idx) => {
    let eff: number;
    let pluvio: number | null;
    let equipName: string;
    let excluded = false;

    if (mode === "simple") {
      const method = SIMPLE_METHODS[z.simpleMethod];
      if (method.eff === 0) {
        excluded = true;
        eff = 1;
        equipName = method.name;
        pluvio = null;
      } else {
        eff = method.eff;
        equipName = method.name;
        pluvio = null;
      }
    } else {
      const equip = DETAIL_EQUIPMENT[z.detailEquip];
      eff = z.detailParams.eff !== undefined
        ? z.detailParams.eff
        : equip.params.find((p) => p.id === "eff")!.def;
      pluvio = z.detailParams.pluvio !== undefined
        ? z.detailParams.pluvio
        : (equip.params.find((p) => p.id === "pluvio")?.def ?? null);
      equipName = equip.name;
    }

    const monthly = new Array(12).fill(0) as number[];
    if (!excluded) {
      for (let m = 0; m < 12; m++) {
        monthly[m] = (z.surface * z.kc * currentETP[m]) / eff / 1000; // m3
      }
    }
    const annualVol = monthly.reduce((a, b) => a + b, 0);

    // Peak watering hours/week (detail mode only)
    let peakHours: number | null = null;
    if (mode === "detail" && pluvio && !excluded) {
      const peakMonth = Math.max(...currentETP);
      const weeklyNeedMM = ((z.kc * peakMonth) / (30 / 7)) * 7 / eff; // mm/week
      peakHours = weeklyNeedMM / pluvio;
    }

    return {
      zone: z,
      monthly,
      annualVol,
      eff,
      equipName,
      peakHours,
      color: ZONE_COLORS[idx % ZONE_COLORS.length],
    };
  });
}

export function drawChart(
  canvas: HTMLCanvasElement,
  results: ZoneResult[],
  monthsShort: string[]
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement!.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 300 * dpr;
  canvas.style.width = rect.width + "px";
  canvas.style.height = "300px";
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = 300;
  const padL = 55, padR = 15, padT = 15, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  ctx.clearRect(0, 0, W, H);

  // Compute stacked data per month
  const numZones = results.length;
  const stackedMax = new Array(12).fill(0) as number[];
  results.forEach((r) => {
    for (let m = 0; m < 12; m++) stackedMax[m] += r.monthly[m];
  });
  const maxVal = Math.max(...stackedMax, 1);

  // Grid
  ctx.strokeStyle = "#E2DED9";
  ctx.lineWidth = 0.5;
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padT + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillStyle = "#A09C98";
    ctx.font = '11px "DM Mono", monospace';
    ctx.textAlign = "right";
    ctx.fillText(((gridLines - i) / gridLines * maxVal).toFixed(1), padL - 6, y + 4);
  }

  // Bars
  const barGroupW = chartW / 12;
  const barW = Math.min(barGroupW * 0.7, 40);

  for (let m = 0; m < 12; m++) {
    let cumY = 0;
    const x = padL + barGroupW * m + (barGroupW - barW) / 2;

    for (let z = 0; z < numZones; z++) {
      const val = results[z].monthly[m];
      const barH = (val / maxVal) * chartH;
      const y = padT + chartH - cumY - barH;
      ctx.fillStyle = results[z].color;
      ctx.beginPath();
      // Rounded top for last segment
      if (z === numZones - 1 && barH > 3) {
        const r = Math.min(3, barH / 2);
        ctx.moveTo(x, y + barH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + barH);
        ctx.closePath();
      } else {
        ctx.rect(x, y, barW, barH);
      }
      ctx.fill();
      cumY += barH;
    }

    // Month label
    ctx.fillStyle = "#7A7672";
    ctx.font = '11px "DM Sans", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(monthsShort[m], padL + barGroupW * m + barGroupW / 2, H - 8);
  }

  // Y axis label
  ctx.save();
  ctx.translate(12, padT + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#A09C98";
  ctx.font = '10px "DM Sans", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("m\u00B3", 0, 0);
  ctx.restore();
}
