// Mr Steeeck — checks for unread messages from Danny and shows them as a
// simple popup. Self-contained: injects its own overlay, no HTML needed
// on the page that imports it. Import and call checkUnreadMessages(userId).
import { supabase } from './supabase-client.js';

function buildOverlay(){
  if (document.getElementById('umOverlay')) return;
  const style = document.createElement('style');
  style.textContent = `
    #umOverlay{position:fixed; inset:0; background:rgba(20,14,9,0.75); z-index:9999;
      display:flex; align-items:center; justify-content:center; padding:1.2rem;}
    #umBox{background:#241a13; border:1px solid rgba(250,246,239,0.2); border-radius:14px;
      padding:1.5rem; max-width:400px; width:100%; color:#faf6ef; font-family:'Work Sans', sans-serif;
      box-shadow:0 20px 50px rgba(0,0,0,0.5);}
    #umBox h3{font-family:'Fraunces', serif; font-size:1.1rem; color:#e0a854; margin-bottom:0.7rem;}
    #umBox p{font-size:0.95rem; line-height:1.5; white-space:pre-wrap;}
    #umBox button{margin-top:1.2rem; background:#e0a854; color:#241a13; border:none; border-radius:8px;
      padding:0.6rem 1.2rem; font-weight:600; font-size:0.9rem; cursor:pointer; float:right;}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'umOverlay';
  overlay.innerHTML = `
    <div id="umBox">
      <h3>A message from Danny</h3>
      <p id="umText"></p>
      <button id="umDismiss" type="button">Got it</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

export async function checkUnreadMessages(userId){
  if (!userId) return;
  const { data } = await supabase
    .from('user_messages')
    .select('id, message')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return;

  buildOverlay();
  const overlay = document.getElementById('umOverlay');
  const textEl = document.getElementById('umText');
  const dismissBtn = document.getElementById('umDismiss');

  let i = 0;
  function showNext(){
    if (i >= data.length){
      overlay.style.display = 'none';
      return;
    }
    textEl.textContent = data[i].message;
    overlay.style.display = 'flex';
  }

  dismissBtn.onclick = async () => {
    await supabase.from('user_messages').update({ read_at: new Date().toISOString() }).eq('id', data[i].id);
    i++;
    showNext();
  };

  showNext();
}
