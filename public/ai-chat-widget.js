// Mr Steeeck — floating AI helper widget.
// Answers common questions instantly using site content, and points visitors
// to the right page or to the live chat bubble when they want a real person.
// Separate from chat-widget.js (the human live chat) on purpose — this one
// never touches the database, it just calls the steeecks-chat Edge Function.

const FUNCTION_URL = 'https://tckzvajdoyxpycbzonsf.supabase.co/functions/v1/steeecks-chat';
const PUBLISHABLE_KEY = 'sb_publishable_ArwWZFwAMOu5mmkwIIQebg_d4xwIUR6';

function getHistory(){
  try {
    return JSON.parse(sessionStorage.getItem('steeeck_ai_history') || '[]');
  } catch (e) {
    return [];
  }
}

function saveHistory(history){
  try {
    sessionStorage.setItem('steeeck_ai_history', JSON.stringify(history.slice(-12)));
  } catch (e) { /* ignore */ }
}

const styleTag = document.createElement('style');
styleTag.textContent = `
  #steeeckAiBubble{
    position:fixed; bottom:20px; left:20px; z-index:200;
    width:58px; height:58px; border-radius:50%;
    background:#4a2e1e; color:#f1e7d3; border:none; font-size:1.5rem; cursor:pointer;
    box-shadow:0 10px 24px rgba(0,0,0,0.35);
    display:flex; align-items:center; justify-content:center;
    transition:transform 0.2s ease;
  }
  #steeeckAiBubble:hover{transform:scale(1.06);}
  #steeeckAiPanel{
    position:fixed; bottom:90px; left:20px; z-index:200;
    width:min(340px, 88vw); max-height:70vh;
    background:#f1e7d3; border:1px solid #d8c6a2; border-radius:10px;
    box-shadow:0 20px 40px rgba(0,0,0,0.4);
    display:none; flex-direction:column; overflow:hidden;
    font-family:'Work Sans', sans-serif;
  }
  #steeeckAiPanel.open{display:flex;}
  #steeeckAiHeader{
    background:#241a13; color:#faf6ef; padding:0.9rem 1rem;
    font-family:'Fraunces', serif; font-weight:600; font-size:0.95rem;
    display:flex; align-items:center; justify-content:space-between;
  }
  #steeeckAiHeader button{background:none; border:none; color:#e0d3bd; font-size:1.1rem; cursor:pointer;}
  #steeeckAiSub{padding:0.55rem 1rem 0; font-size:0.72rem; color:#6b5340; line-height:1.35;}
  #steeeckAiMessages{
    flex:1; overflow-y:auto; padding:0.9rem; display:flex; flex-direction:column; gap:0.6rem;
    min-height:180px; max-height:340px;
  }
  .steeeck-ai-msg{max-width:86%; padding:0.55rem 0.8rem; border-radius:10px; font-size:0.86rem; line-height:1.42;}
  .steeeck-ai-msg.user{align-self:flex-end; background:#e0a854; color:#241a13; border-bottom-right-radius:2px;}
  .steeeck-ai-msg.bot{align-self:flex-start; background:#fff; border:1px solid #d8c6a2; color:#3a2818; border-bottom-left-radius:2px; white-space:pre-wrap;}
  .steeeck-ai-msg.bot.typing{color:#8a7561; font-style:italic;}
  #steeeckAiForm{border-top:1px solid #d8c6a2; padding:0.7rem; display:flex; gap:0.5rem;}
  #steeeckAiInput{
    flex:1; padding:0.55rem 0.7rem; border:1px solid #d8c6a2; border-radius:6px;
    font-size:0.86rem; font-family:inherit;
  }
  #steeeckAiSend{
    background:#e0a854; color:#241a13; border:none; border-radius:6px;
    padding:0.55rem 0.9rem; font-size:0.86rem; font-weight:600; cursor:pointer;
  }
  #steeeckAiSend:disabled{opacity:0.6; cursor:default;}
  @media (max-width:480px){
    #steeeckAiPanel{left:12px; bottom:86px;}
    #steeeckAiBubble{left:12px;}
  }
`;
document.head.appendChild(styleTag);

const bubble = document.createElement('button');
bubble.id = 'steeeckAiBubble';
bubble.setAttribute('aria-label', 'Ask the Mr Steeeck AI helper');
bubble.textContent = '\u{1F916}';
document.body.appendChild(bubble);

const panel = document.createElement('div');
panel.id = 'steeeckAiPanel';
panel.innerHTML = `
  <div id="steeeckAiHeader">
    <span>Ask Steeeck AI</span>
    <button id="steeeckAiClose" aria-label="Close AI helper">&times;</button>
  </div>
  <div id="steeeckAiSub">Instant answers on sizing, pricing, pets, wood & more. For orders or anything personal, use the 💬 live chat instead.</div>
  <div id="steeeckAiMessages"></div>
  <div id="steeeckAiForm">
    <input type="text" id="steeeckAiInput" placeholder="Ask a question…">
    <button id="steeeckAiSend">Send</button>
  </div>
`;
document.body.appendChild(panel);

const messagesEl = document.getElementById('steeeckAiMessages');
const inputEl = document.getElementById('steeeckAiInput');
const sendBtn = document.getElementById('steeeckAiSend');
const formEl = document.getElementById('steeeckAiForm');

function renderMessage(role, text, opts){
  opts = opts || {};
  const div = document.createElement('div');
  div.className = 'steeeck-ai-msg ' + (role === 'user' ? 'user' : 'bot') + (opts.typing ? ' typing' : '');
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function loadInitial(){
  messagesEl.innerHTML = '';
  const history = getHistory();
  if (history.length){
    history.forEach(m => renderMessage(m.role, m.content));
  } else {
    renderMessage('bot', "Hey there! I'm the Mr Steeeck AI helper — ask me about sizing, pricing, pet-friendly pieces, wood types, or how ordering works.");
  }
}

async function sendMessage(){
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  sendBtn.disabled = true;

  renderMessage('user', text);
  const history = getHistory();
  history.push({ role: 'user', content: text });
  saveHistory(history);

  const typingEl = renderMessage('bot', 'Thinking…', { typing: true });

  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json().catch(() => ({}));
    typingEl.remove();

    if (!res.ok || !data.reply) {
      renderMessage('bot', data.error || "Sorry, I'm having trouble right now — try the 💬 live chat or email mainesteeecksupport@gmail.com.");
      sendBtn.disabled = false;
      return;
    }

    renderMessage('bot', data.reply);
    history.push({ role: 'assistant', content: data.reply });
    saveHistory(history);
  } catch (err) {
    typingEl.remove();
    renderMessage('bot', "Sorry, I couldn't reach the chat helper — try the 💬 live chat or email mainesteeecksupport@gmail.com.");
  }

  sendBtn.disabled = false;
}

bubble.addEventListener('click', () => {
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) loadInitial();
});
document.getElementById('steeeckAiClose').addEventListener('click', () => panel.classList.remove('open'));
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
});
