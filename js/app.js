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

function drawChart() {
  const ctx = document.getElementById('mainChart');
  if (!ctx || typeof Chart === 'undefined') return;
  const prices = [1936,1938,1939,1941,1940,1944,1947,1945,1949,1951,1948,1952,1954,1953,1956,1958,1957,1959,1961,1963];
  const tp = prices.map(() => 1960);
  const sl = prices.map(() => 1930);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices.map((_, i) => i + 1),
      datasets: [
        { data: prices, borderColor: '#f0a500', borderWidth: 2, pointRadius: 0, tension: 0.35 },
        { data: tp, borderColor: '#00c853', borderWidth: 1.2, pointRadius: 0, borderDash: [7, 5] },
        { data: sl, borderColor: '#ff3d3d', borderWidth: 1.2, pointRadius: 0, borderDash: [7, 5] }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: {
          position: 'right',
          ticks: { color: '#8892a4' },
          grid: { color: 'rgba(255,255,255,0.08)' }
        }
      }
    }
  });
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

drawChart();
loadDashboard();

// ===== AI SIGNAL POPUP =====
const SIGNAL_POPUP_DELAY_MS = 3000;
setTimeout(function() {
  const popup = document.getElementById('signalPopup');
  if (popup) popup.classList.add('active');
}, SIGNAL_POPUP_DELAY_MS);

const popupCloseBtn = document.getElementById('signalPopupCloseBtn');
if (popupCloseBtn) {
  popupCloseBtn.addEventListener('click', function() {
    const popup = document.getElementById('signalPopup');
    if (popup) popup.classList.remove('active');
  });
}
