const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
const APP_SETTINGS = {
  maxRisk: 0.02,
  confidenceThreshold: 0.80,
  timeframes: ['1H', '15M', '5M'],
  trailingStopTrigger: 0.50,
  parallelStrategies: ['scalping','swing'],
  learningCycle: 'weekly'
};
const { createClient } = supabase;
let db = null;
try {
  if (SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('YOUR_SUPABASE')) {
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  db = null;
}
function formatMoney(amount) { const num=parseFloat(amount)||0; const sign=num>=0?'+':''; return sign+'$'+Math.abs(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
function formatDate(dateStr) { if(!dateStr)return''; const d=new Date(dateStr); const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }
function showToast(message,type='success'){let toast=document.getElementById('toast');if(!toast){toast=document.createElement('div');toast.id='toast';document.body.appendChild(toast);}toast.className='toast'+(type==='error'?' error':'');toast.textContent=message;setTimeout(()=>{toast.className='toast hidden';},3000);}
function aiDecision(signal){const{confidence,timeframe}=signal;if(confidence>=APP_SETTINGS.confidenceThreshold*100&&APP_SETTINGS.timeframes.includes(timeframe)){return'TRADE';}return'NO_TRADE';}
