// ===== SPARKLE PARTICLES =====
(function() {
  const canvas = document.getElementById('sparkle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function createParticle() {
    return { x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*2.5+0.5, opacity: Math.random(), speed: Math.random()*0.4+0.1, twinkle: Math.random()*0.02+0.005, growing: Math.random()>0.5 };
  }
  for (let i = 0; i < 120; i++) particles.push(createParticle());
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.growing ? (p.opacity += p.twinkle, p.opacity >= 1 && (p.growing = false)) : (p.opacity -= p.twinkle, p.opacity <= 0 && (p.growing = true));
      p.y -= p.speed;
      if (p.y < 0) { p.y = canvas.height; p.x = Math.random()*canvas.width; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(240,185,11,${p.opacity})`; ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== JOURNAL CANDLESTICK CHART =====
function drawJournalCandleChart() {
  const canvas = document.getElementById('journalCandleChart');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  > 0 ? rect.width  : (canvas.parentElement ? canvas.parentElement.offsetWidth - 20 : 280);
  canvas.height = 130;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (H / 4) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Generate candle data
  const NUM = 20;
  const candles = [];
  let price = 1935;
  for (let i = 0; i < NUM; i++) {
    const open  = price;
    const close = open + (Math.random() - 0.45) * 8;
    const high  = Math.max(open, close) + Math.random() * 4;
    const low   = Math.min(open, close) - Math.random() * 4;
    candles.push({ open, close, high, low });
    price = close;
  }

  const allP  = candles.flatMap(c => [c.high, c.low]);
  const minP  = Math.min(...allP) - 2;
  const maxP  = Math.max(...allP) + 2;
  const range = maxP - minP;
  const toY   = p => H - ((p - minP) / range) * (H - 20) - 10;

  const padL = 8, padR = 24;
  const cw   = (W - padL - padR) / NUM;
  const bw   = Math.max(cw * 0.6, 3);

  // BUY dashed green line
  ctx.setLineDash([4,4]); ctx.strokeStyle = '#00c853'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, toY(1930)); ctx.lineTo(W, toY(1930)); ctx.stroke();
  // SELL dashed red line
  ctx.strokeStyle = '#ff1744';
  ctx.beginPath(); ctx.moveTo(0, toY(maxP - 2)); ctx.lineTo(W, toY(maxP - 2)); ctx.stroke();
  ctx.setLineDash([]);

  // Draw candles
  candles.forEach((c, i) => {
    const x     = padL + i * cw + cw / 2;
    const green = c.close >= c.open;
    const color = green ? '#00c853' : '#ff1744';
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, toY(c.high)); ctx.lineTo(x, toY(c.low)); ctx.stroke();
    const bTop = toY(Math.max(c.open, c.close));
    const bBot = toY(Math.min(c.open, c.close));
    ctx.fillStyle = color;
    ctx.fillRect(x - bw/2, bTop, bw, Math.max(bBot - bTop, 2));
  });

  // BUY arrow on last green candle
  const lastGreen = candles.reduce((l, c, i) => c.close > c.open ? i : l, 10);
  const ax = padL + lastGreen * cw + cw / 2;
  const ay = toY(candles[lastGreen].low) + 12;
  ctx.fillStyle = '#00c853'; ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial'; ctx.fillText('▲', ax, ay);
  ctx.font = 'bold 7px Arial';  ctx.fillText('BUY', ax, ay + 9);

  // Time markers + vertical dotted lines
  const now = new Date();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '7px Arial'; ctx.textAlign = 'center';
  for (let i = 0; i < NUM; i += 5) {
    const t = new Date(now.getTime() - (NUM - i) * 60000);
    const ts = t.getHours().toString().padStart(2,'0') + ':' + t.getMinutes().toString().padStart(2,'0');
    const x = padL + i * cw + cw / 2;
    ctx.fillText(ts, x, H - 2);
    ctx.setLineDash([2,4]); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H - 12); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Price labels right side
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '7px Arial'; ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const p = minP + (range / 4) * i;
    ctx.fillText(p.toFixed(0), W - 2, toY(p) + 3);
  }
}

// ===== TRADE DATA =====
let allTrades = [];
const fallbackTrades = [
  { date: '2026-04-21', pair: 'XAU/USD', type: 'Long',  profit: 435,    lot_size: 0.05, entry: 1942.15, exit: 1958.90, take_profit: 1960, stop_loss: 1930, status: 'CLOSED', insight: 'Momentum breakout confirmed.' },
  { date: '2026-04-20', pair: 'EUR/USD', type: 'Short', profit: 65.5,   lot_size: 0.12, entry: 1.0862,  exit: 1.0821,  take_profit: 1.079, stop_loss: 1.0899, status: 'CLOSED', insight: 'MACD bearish divergence.' },
  { date: '2026-04-19', pair: 'GBP/USD', type: 'Long',  profit: -75,    lot_size: 0.08, entry: 1.2678,  exit: 1.2641,  take_profit: 1.273, stop_loss: 1.264, status: 'CLOSED', insight: 'False breakout, managed risk.' },
  { date: '2026-04-18', pair: 'XAU/USD', type: 'Swing', profit: 185.25, lot_size: 0.03, entry: 1935.4,  exit: 1948.2,  take_profit: 1952.3, stop_loss: 1928, status: 'CLOSED', insight: 'Swing continuation setup.' }
];

function barIcon(type) {
  const color = (type === 'Short') ? 'var(--red)' : 'var(--green)';
  return `<span class="bar-icon" style="color:${color}"><span></span><span></span><span></span></span>`;
}

function renderTradeCard(t) {
  const p = Number(t.profit || 0);
  return `
    <article class="trade-item">
      <div class="trade-item-head">
        <span>${formatDate(t.date)} · ${t.pair || t.instrument}</span>
        <span class="trade-item-profit ${p >= 0 ? 'pos' : 'neg'}">${formatMoney(p)}</span>
      </div>
      <div class="trade-item-sub">
        <span>${barIcon(t.type)} ${t.type}</span>
        <span>Lot ${t.lot_size}</span>
        <span>Entry ${t.entry}</span>
        <span>Exit ${t.exit ?? '-'}</span>
      </div>
      <div class="trade-item-insight">AI Insight: ${t.insight || 'Signal quality maintained with protected risk.'}</div>
    </article>`;
}

async function loadTrades() {
  allTrades = [...fallbackTrades];
  try {
    if (db) {
      const { data, error } = await db.from('trade_logs').select('*').order('date', { ascending: false });
      if (!error && data?.length) allTrades = data.map(t => ({ ...t, pair: t.pair || t.instrument }));
    }
  } catch (_) {}
  renderTrades('ALL');
  updateStats(allTrades);
}

function renderTrades(filter) {
  const list = document.getElementById('tradeList');
  const filtered = filter === 'ALL' ? allTrades : allTrades.filter(t => (t.type||'').toLowerCase() === filter.toLowerCase());
  list.innerHTML = filtered.length ? filtered.map(renderTradeCard).join('') : '<div class="menu-item">No trades in this category.</div>';
  updateStats(filtered);
}

function updateStats(trades) {
  const total = trades.reduce((sum, t) => sum + Number(t.profit||0), 0);
  const wins  = trades.filter(t => Number(t.profit||0) > 0).length;
  const losses= trades.filter(t => Number(t.profit||0) <= 0).length;
  const tp = document.getElementById('totalProfit');
  tp.textContent = formatMoney(total);
  tp.className = `stat-value ${total >= 0 ? 'pos' : 'neg'}`;
  document.getElementById('totalWins').textContent = wins;
  document.getElementById('totalLosses').textContent = losses;
}

function filterTrades(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTrades(type);
}

// Draw chart after layout is ready
window.addEventListener('load', function() {
  setTimeout(drawJournalCandleChart, 400);
});
window.addEventListener('resize', function() {
  setTimeout(drawJournalCandleChart, 100);
});

loadTrades();