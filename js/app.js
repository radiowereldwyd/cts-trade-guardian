// ===== SPARKLE PARTICLES =====
(function() {
  const canvas = document.getElementById('sparkle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random(),
      speed: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * 0.02 + 0.005,
      growing: Math.random() > 0.5
    };
  }

  for (let i = 0; i < 120; i++) {
    particles.push(createParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      if (p.growing) {
        p.opacity += p.twinkle;
        if (p.opacity >= 1) p.growing = false;
      } else {
        p.opacity -= p.twinkle;
        if (p.opacity <= 0) p.growing = true;
      }
      p.y -= p.speed;
      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 185, 11, ${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

const demoTrades = [
  { id: 1, instrument: 'XAU/USD', type: 'Long', lot_size: 0.05, entry: 1942.15, take_profit: 1960.0, stop_loss: 1930.0, status: 'OPEN', profit: 245.8, confidence: 86, timeframe: '1H' },
  { id: 2, instrument: 'EUR/USD', type: 'Short', lot_size: 0.12, entry: 1.0862, take_profit: 1.079, stop_loss: 1.0899, status: 'CLOSED', profit: 58.2, confidence: 81, timeframe: '15M', result: 'WIN' },
  { id: 3, instrument: 'GBP/USD', type: 'Long', lot_size: 0.08, entry: 1.2678, take_profit: 1.273, stop_loss: 1.264, status: 'CLOSED', profit: -34.1, confidence: 79, timeframe: '5M', result: 'LOSS' }
];

// ===== CANDLESTICK CHART =====
function drawCandlestickChart() {
  const defaultCanvasWidth = 280;
  const sellSignalOffset = 2;
  // 0.5 is neutral drift; lower values bias simulated candles upward.
  const priceChangeBias = 0.45;
  const canvas = document.getElementById('candlestick-chart');
  if (!canvas) return;
  
  // Get actual rendered width
  const rect = canvas.getBoundingClientRect();
  const fallbackWidth = (canvas.parentElement?.offsetWidth || 0) - 20;
  canvas.width = rect.width > 0 ? rect.width : (fallbackWidth > 0 ? fallbackWidth : defaultCanvasWidth);
  canvas.height = 180;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear
  ctx.clearRect(0, 0, width, height);
  
  // Background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Generate realistic candle data for XAU/USD around 1930-1960
  const candles = [];
  let price = 1935;
  const numCandles = 20;
  
  for (let i = 0; i < numCandles; i++) {
    const open = price;
    const change = (Math.random() - priceChangeBias) * 8;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 4;
    const low = Math.min(open, close) - Math.random() * 4;
    candles.push({ open, close, high, low });
    price = close;
  }

  // Price range
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices) - 2;
  const maxPrice = Math.max(...allPrices) + 2;
  const priceRange = maxPrice - minPrice;

  function toY(price) {
    return height - ((price - minPrice) / priceRange) * (height - 20) - 10;
  }

  // Padding
  const padLeft = 8;
  const padRight = 8;
  const chartWidth = width - padLeft - padRight;
  const candleWidth = chartWidth / numCandles;
  const bodyWidth = Math.max(candleWidth * 0.6, 4);

  // Draw BUY signal line (dashed green at bottom)
  const buyPrice = 1930;
  const buyY = toY(buyPrice);
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#00c853';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, buyY);
  ctx.lineTo(width, buyY);
  ctx.stroke();

  // Draw SELL signal line (dashed red at top)
  const sellPrice = maxPrice - sellSignalOffset;
  const sellY = toY(sellPrice);
  ctx.strokeStyle = '#ff1744';
  ctx.beginPath();
  ctx.moveTo(0, sellY);
  ctx.lineTo(width, sellY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw candles
  candles.forEach((candle, i) => {
    const x = padLeft + i * candleWidth + candleWidth / 2;
    const isGreen = candle.close >= candle.open;
    const color = isGreen ? '#00c853' : '#ff1744';

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, toY(candle.high));
    ctx.lineTo(x, toY(candle.low));
    ctx.stroke();

    // Body
    const bodyTop = toY(Math.max(candle.open, candle.close));
    const bodyBottom = toY(Math.min(candle.open, candle.close));
    const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
    
    ctx.fillStyle = color;
    ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
  });

  // Draw BUY arrow signal on last green candle
  const lastGreen = candles.reduce((last, c, i) => c.close > c.open ? i : last, -1);
  const signalCandleIndex = lastGreen >= 0 ? lastGreen : candles.length - 1;
  const arrowX = padLeft + signalCandleIndex * candleWidth + candleWidth / 2;
  const arrowY = toY(candles[signalCandleIndex].low) + 12;
  
  ctx.fillStyle = '#00c853';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('▲', arrowX, arrowY);
  ctx.font = 'bold 8px Arial';
  ctx.fillText('BUY', arrowX, arrowY + 10);

  // Draw time markers at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  const now = new Date();
  for (let i = 0; i < numCandles; i += 4) {
    const t = new Date(now.getTime() - (numCandles - i) * 60000);
    const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
    const x = padLeft + i * candleWidth + candleWidth / 2;
    ctx.fillText(timeStr, x, height - 2);
    
    // Vertical dotted time line
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height - 12);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Price labels on right side
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '8px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const p = minPrice + (priceRange / 4) * i;
    const y = toY(p);
    ctx.fillText(p.toFixed(0), width - 2, y + 3);
  }
}

function updateSignalPanel(t) {
  if (!t) return;
  const bullish = (t.type || '').toLowerCase() !== 'short';
  const badge = document.getElementById('signalBadge');
  badge.textContent = bullish ? 'BULLISH' : 'BEARISH';
  badge.className = `signal-badge ${bullish ? 'bullish' : 'bearish'}`;
  document.getElementById('signalTradeType').textContent = t.type || 'Long';
  document.getElementById('signalLotSize').textContent = t.lot_size ?? '0.05';
  document.getElementById('signalStatus').textContent = t.status || 'OPEN';
  document.getElementById('signalTakeProfit').textContent = Number(t.take_profit || 1960).toFixed(2);
  document.getElementById('signalStopLoss').textContent = Number(t.stop_loss || 1930).toFixed(2);
  document.getElementById('currentTradeType').textContent = t.type || 'Long';
  const p = Number(t.profit || 0);
  const cp = document.getElementById('currentTradeProfit');
  cp.textContent = formatMoney(p);
  cp.className = `stat-value ${p >= 0 ? 'pos' : 'neg'}`;
}

async function loadDashboard() {
  let trades = [...demoTrades];
  try {
    if (db) {
      const { data, error } = await db.from('trade_logs').select('*').eq('status', 'OPEN').order('date', { ascending: false });
      if (!error && data?.length) trades = data;
    }
  } catch (_) {}

  updateSignalPanel(trades[0]);

  const wins = demoTrades.filter(t => Number(t.profit) > 0).length;
  const losses = demoTrades.filter(t => Number(t.profit) <= 0).length;
  document.getElementById('winsCount').textContent = wins;
  document.getElementById('lossesCount').textContent = losses;
}

function showSignalModal(trade) {
  const t = trade || demoTrades[0];
  document.getElementById('modalInstrument').textContent = t.instrument || 'XAU/USD';
  document.getElementById('modalType').textContent = t.type || 'Long';
  document.getElementById('modalEntry').textContent = Number(t.entry || 1942.15).toFixed(2);
  document.getElementById('modalTP').textContent = Number(t.take_profit || 1960).toFixed(2);
  document.getElementById('modalProbability').textContent = `${Math.round(Number(t.confidence || 86))}%`;
  document.getElementById('signalModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('signalModal').classList.add('hidden');
}

async function confirmTrade() {
  closeModal();
  const trade = {
    instrument: document.getElementById('modalInstrument').textContent,
    type: document.getElementById('modalType').textContent,
    entry: Number(document.getElementById('modalEntry').textContent),
    take_profit: Number(document.getElementById('modalTP').textContent),
    confidence: Number(document.getElementById('modalProbability').textContent.replace('%', '')),
    status: 'OPEN',
    lot_size: 0.05,
    date: new Date().toISOString()
  };
  try {
    if (db) await db.from('trade_logs').insert([trade]);
    showToast('Trade confirmed and logged successfully.');
  } catch (_) {
    showToast('Trade confirmed in offline mode.');
  }
}

window.addEventListener('click', (e) => {
  if (e.target.id === 'signalModal') closeModal();
});

window.addEventListener('load', function() {
  setTimeout(function() {
    drawCandlestickChart();
  }, 500);
});

setInterval(drawCandlestickChart, 60000);
window.addEventListener('resize', function() {
  setTimeout(drawCandlestickChart, 100);
});
loadDashboard();

// ===== AI SIGNAL POPUP =====
const SIGNAL_POPUP_DELAY_MS = 3000;
setTimeout(function() {
  const popup = document.getElementById('signalPopup');
  if (popup) popup.classList.add('active');
}, SIGNAL_POPUP_DELAY_MS);

document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('popupCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      const popup = document.getElementById('signalPopup');
      if (popup) popup.classList.remove('active');
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const overlay = document.getElementById('signalPopup');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  }
});
