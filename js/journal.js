let allTrades = [];
const fallbackTrades = [
  { date: '2026-04-21', pair: 'XAU/USD', type: 'Long', profit: 435, lot_size: 0.05, entry: 1942.15, exit: 1958.90, take_profit: 1960, stop_loss: 1930, status: 'CLOSED', insight: 'Momentum breakout confirmed.' },
  { date: '2026-04-20', pair: 'EUR/USD', type: 'Short', profit: 65.5, lot_size: 0.12, entry: 1.0862, exit: 1.0821, take_profit: 1.079, stop_loss: 1.0899, status: 'CLOSED', insight: 'MACD bearish divergence.' },
  { date: '2026-04-19', pair: 'GBP/USD', type: 'Long', profit: -75, lot_size: 0.08, entry: 1.2678, exit: 1.2641, take_profit: 1.273, stop_loss: 1.264, status: 'CLOSED', insight: 'False breakout, managed risk.' },
  { date: '2026-04-18', pair: 'XAU/USD', type: 'Swing', profit: 185.25, lot_size: 0.03, entry: 1935.4, exit: 1948.2, take_profit: 1952.3, stop_loss: 1928, status: 'CLOSED', insight: 'Swing continuation setup.' }
];

function drawJournalChart() {
  const ctx = document.getElementById('journalChart');
  if (!ctx || typeof Chart === 'undefined') return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1','2','3','4','5','6','7','8','9','10'],
      datasets: [
        { label: 'Price', data: [1938,1941,1940,1944,1942,1948,1950,1949,1953,1955], borderColor: '#f0a500', pointRadius: 0, tension: 0.35 },
        { label: 'MACD', data: [0.1,0.08,0.15,0.2,0.1,0.3,0.32,0.27,0.4,0.45], borderColor: '#00c853', pointRadius: 0, tension: 0.35, yAxisID: 'y1' }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: { position: 'right', ticks: { color: '#8892a4' }, grid: { color: 'rgba(255,255,255,0.08)' } },
        y1: { display: false }
      }
    }
  });
}

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
      if (!error && data?.length) {
        allTrades = data.map(t => ({ ...t, pair: t.pair || t.instrument }));
      }
    }
  } catch (_) {}
  renderTrades('ALL');
  updateStats(allTrades);
  updateSignalFromLatest(allTrades);
}

function renderTrades(filter) {
  const list = document.getElementById('tradeList');
  const filtered = filter === 'ALL' ? allTrades : allTrades.filter(t => (t.type || '').toLowerCase() === filter.toLowerCase());
  list.innerHTML = filtered.length ? filtered.map(renderTradeCard).join('') : '<div class="menu-item">No trades in this category.</div>';
  updateStats(filtered);
}

function updateStats(trades) {
  const total = trades.reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const wins = trades.filter(t => Number(t.profit || 0) > 0).length;
  const losses = trades.filter(t => Number(t.profit || 0) <= 0).length;
  const tp = document.getElementById('totalProfit');
  tp.textContent = formatMoney(total);
  tp.className = `stat-value ${total >= 0 ? 'pos' : 'neg'}`;
  document.getElementById('totalWins').textContent = wins;
  document.getElementById('totalLosses').textContent = losses;
}

function updateSignalFromLatest(trades) {
  const t = trades[0];
  if (!t) return;
  const bullish = (t.type || '').toLowerCase() !== 'short';
  const badge = document.getElementById('journalSignalBadge');
  badge.textContent = bullish ? 'BULLISH' : 'BEARISH';
  badge.className = `signal-badge ${bullish ? 'bullish' : 'bearish'}`;
  document.getElementById('journalSignalType').textContent = t.type || 'Long';
  document.getElementById('journalSignalLot').textContent = t.lot_size ?? '0.05';
  document.getElementById('journalSignalStatus').textContent = t.status || 'CLOSED';
  document.getElementById('journalSignalTP').textContent = Number(t.take_profit || 1960).toFixed(2);
  document.getElementById('journalSignalSL').textContent = Number(t.stop_loss || 1930).toFixed(2);
}

function filterTrades(type, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderTrades(type);
}

drawJournalChart();
loadTrades();
