// Mr Steeeck — bold, sitewide banner announcing Steeecks Chat. Self-injecting,
// dismissible for the current visit (sessionStorage), reappears on the next visit.

if (!sessionStorage.getItem('steeeck_chat_announce_dismissed')){
  const style = document.createElement('style');
  style.textContent = `
    #steeeckAnnounce{
      position:relative; z-index:150;
      background:linear-gradient(90deg, #c9863e 0%, #e0a854 50%, #c9863e 100%);
      background-size:200% 100%;
      animation:steeeckAnnounceShimmer 4s linear infinite;
      color:#241a13; font-family:'Work Sans', sans-serif;
      padding:0.75rem 2.8rem 0.75rem 1rem;
      text-align:center; font-size:0.9rem; font-weight:600; line-height:1.5;
      box-shadow:0 4px 16px rgba(0,0,0,0.25);
    }
    @keyframes steeeckAnnounceShimmer{
      0%{background-position:0% 0%;} 100%{background-position:200% 0%;}
    }
    #steeeckAnnounce strong{font-family:'Fraunces', serif; font-size:1.02rem;}
    #steeeckAnnounce a{
      color:#241a13; text-decoration:underline; text-decoration-thickness:2px;
      font-weight:800;
    }
    #steeeckAnnounceClose{
      position:absolute; right:0.6rem; top:50%; transform:translateY(-50%);
      background:rgba(36,26,19,0.15); border:none; color:#241a13; width:26px; height:26px;
      border-radius:50%; font-size:1rem; cursor:pointer; line-height:1;
    }
    @media (max-width:600px){
      #steeeckAnnounce{font-size:0.8rem; padding:0.7rem 2.4rem 0.7rem 0.8rem;}
    }
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'steeeckAnnounce';
  bar.innerHTML = `
    \u{1F4F2} <strong>Steeecks Chat is here!</strong> Message Danny directly and install it like a real app on your phone or PC.
    A members' community chat room is live now \u2014 <strong>no purchase necessary</strong>, just sign up free.
    <a href="chat-admin.html">Open Steeecks Chat &rarr;</a>
    <button id="steeeckAnnounceClose" aria-label="Dismiss">&times;</button>
  `;
  document.body.insertBefore(bar, document.body.firstChild);

  document.getElementById('steeeckAnnounceClose').addEventListener('click', () => {
    bar.remove();
    sessionStorage.setItem('steeeck_chat_announce_dismissed', '1');
  });
}
