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

let settingsAllTrades = [];
const settingsFallbackTrades = [
  { date: '2026-04-21', pair: 'XAU/USD', type: 'Long', profit: 435, lot_size: 0.05, entry: 1942.15, exit: 1958.9 },
  { date: '2026-04-20', pair: 'EUR/USD', type: 'Short', profit: 65.5, lot_size: 0.12, entry: 1.0862, exit: 1.0821 },
  { date: '2026-04-19', pair: 'GBP/USD', type: 'Long', profit: -75, lot_size: 0.08, entry: 1.2678, exit: 1.2641 },
  { date: '2026-04-18', pair: 'XAU/USD', type: 'Swing', profit: 185.25, lot_size: 0.03, entry: 1935.4, exit: 1948.2 }
];

function barIconS(type) {
  const color = (type === 'Short') ? 'var(--red)' : 'var(--green)';
  return `<span class="bar-icon" style="color:${color}"><span></span><span></span><span></span></span>`;
}

function renderSettingsTradeCard(t) {
  const p = Number(t.profit || 0);
  return `<div class="menu-item"><span>${formatDate(t.date)} · ${t.pair || t.instrument} · ${barIconS(t.type)} ${t.type}</span><span class="trade-item-profit ${p >= 0 ? 'pos' : 'neg'}">${formatMoney(p)}</span></div>`;
}

async function loadSettingsTrades() {
  settingsAllTrades = [...settingsFallbackTrades];
  try {
    if (db) {
      const { data, error } = await db.from('trade_logs').select('*').order('date', { ascending: false });
      if (!error && data?.length) settingsAllTrades = data.map(t => ({ ...t, pair: t.pair || t.instrument }));
    }
  } catch (_) {}
  renderSettingsTrades('ALL');
  updateSettingsStats(settingsAllTrades);
}

function renderSettingsTrades(filter) {
  const list = document.getElementById('settingsTradeList');
  const trades = filter === 'ALL' ? settingsAllTrades : settingsAllTrades.filter(t => (t.type || '').toLowerCase() === filter.toLowerCase());
  list.innerHTML = trades.length ? trades.map(renderSettingsTradeCard).join('') : '<div class="menu-item">No trades in this category.</div>';
  updateSettingsStats(trades);
}

function updateSettingsStats(trades) {
  const total = trades.reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const wins = trades.filter(t => Number(t.profit || 0) > 0).length;
  const losses = trades.filter(t => Number(t.profit || 0) <= 0).length;
  const tp = document.getElementById('setsProfit');
  tp.textContent = formatMoney(total);
  tp.className = `stat-value ${total >= 0 ? 'pos' : 'neg'}`;
  document.getElementById('setsWins').textContent = wins;
  document.getElementById('setsLosses').textContent = losses;
}

function switchTab(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSettingsTrades(type);
}

async function saveStrategy(name, value) {
  try {
    if (db) {
      await db.from('settings').upsert([{ name, enabled: value, updated_at: new Date().toISOString() }], { onConflict: 'name' });
    }
    showToast(`${name} ${value ? 'enabled' : 'disabled'}.`);
  } catch (_) {
    showToast(`${name} saved in offline mode.`);
  }
}

loadSettingsTrades();
