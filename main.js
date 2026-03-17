// ── Theme ──
function setTheme(t) {
  document.body.setAttribute('data-theme', t === 'light' ? 'light' : '');
  document.getElementById('btn-dark').classList.toggle('active', t === 'dark');
  document.getElementById('btn-light').classList.toggle('active', t === 'light');
  localStorage.setItem('theme', t);
}
if (localStorage.getItem('theme') === 'light') setTheme('light');

// ── Active nav on scroll ──
function updateNav() {
  const y = window.scrollY + 130;
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let cur = '';
  sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + cur) a.classList.add('active');
  });
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('load', updateNav);

// ── Skill bars ──
function animateBars() {
  document.querySelectorAll('.skill-fill').forEach(f => {
    const rect = f.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50 && !f.dataset.animated) {
      f.dataset.animated = '1';
      f.style.width = f.getAttribute('data-w');
    }
  });
}
window.addEventListener('scroll', animateBars, { passive: true });
window.addEventListener('load', function() { setTimeout(animateBars, 400); });

// ── Glass box mouse follow ──
function initGlass(boxId, followId) {
  const box = document.getElementById(boxId);
  const follow = document.getElementById(followId);
  if (!box || !follow) return;
  box.addEventListener('mousemove', e => {
    const r = box.getBoundingClientRect();
    follow.style.left = (e.clientX - r.left) + 'px';
    follow.style.top = (e.clientY - r.top) + 'px';
    follow.style.opacity = '1';
  });
  box.addEventListener('mouseleave', () => { follow.style.opacity = '0'; });
}
window.addEventListener('load', function() {
  initGlass('glassBox', 'glassFollow');
  initGlass('glassBox2', 'glassFollow2');
});

// ── Meteors & stars ──
window.addEventListener('load', function() {
  const c = document.getElementById('particles-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, stars = [], meteors = [];

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.5 + Math.random() * 1.4,
        o: 0.2 + Math.random() * 0.55,
        t: Math.random() * Math.PI * 2
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function isDark() { return document.body.getAttribute('data-theme') !== 'light'; }

  function spawnMeteor() {
    const v = 10 + Math.random() * 12;
    return {
      x: Math.random() * W * 1.5 - W * 0.2, y: -20 - Math.random() * 80,
      vx: Math.cos(Math.PI / 5) * v, vy: Math.sin(Math.PI / 5) * v,
      len: 100 + Math.random() * 140, w: 1.2 + Math.random() * 1.4,
      op: 0, phase: 'in', life: 0, max: 50 + Math.random() * 35
    };
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    const dark = isDark();
    const sc = dark ? '200,200,255' : '80,70,200';
    const mc = dark ? '170,150,255' : '60,40,190';

    stars.forEach(s => {
      s.t += 0.012;
      const o = s.o * (0.6 + 0.4 * Math.sin(s.t));
      const r = dark ? s.r : s.r * 0.7;
      const fo = dark ? o : Math.min(o * 0.35, 0.25);
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + sc + ',' + fo + ')'; ctx.fill();
    });

    if (frame % 38 === 0 && meteors.length < 8) meteors.push(spawnMeteor());

    meteors = meteors.filter(m => {
      m.x += m.vx; m.y += m.vy; m.life++;
      if (m.phase === 'in') { m.op = Math.min(m.op + 0.07, 0.9); if (m.op >= 0.9) m.phase = 'hold'; }
      if (m.phase === 'hold' && m.life > m.max * 0.6) m.phase = 'out';
      if (m.phase === 'out') m.op -= 0.045;
      if (m.op <= 0 || m.x > W + 200 || m.y > H + 200) return false;
      const tx = m.x - Math.cos(Math.PI / 5) * m.len;
      const ty = m.y - Math.sin(Math.PI / 5) * m.len;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      const fo = dark ? m.op : Math.min(m.op * 1.4, 1);
      g.addColorStop(0, 'rgba(' + mc + ',' + fo + ')');
      g.addColorStop(0.3, 'rgba(' + mc + ',' + (fo * 0.4) + ')');
      g.addColorStop(1, 'rgba(' + mc + ',0)');
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty);
      ctx.strokeStyle = g; ctx.lineWidth = m.w; ctx.lineCap = 'round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(m.x, m.y, m.w * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + mc + ',' + (fo * 0.95) + ')'; ctx.fill();
      return true;
    });
    requestAnimationFrame(draw);
  }
  draw();
});

// ── Contact form ──
window.addEventListener('load', function() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var API_URL = 'https://YOUR-API-URL/api/contact/send';
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = document.getElementById('submitBtn');
    var msg = document.getElementById('formMsg');
    btn.disabled = true; btn.textContent = 'Sending...'; msg.className = 'fmsg';
    var payload = {
      name: document.getElementById('senderName').value,
      phone: document.getElementById('senderPhone').value,
      email: document.getElementById('senderEmail').value,
      message: document.getElementById('senderMessage').value
    };
    fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function(r) {
        if (r.ok) { msg.className = 'fmsg ok'; msg.textContent = 'Message sent! I will get back to you soon.'; form.reset(); }
        else throw new Error();
      })
      .catch(function() { msg.className = 'fmsg err'; msg.textContent = 'Failed to send. Please email me directly.'; })
      .finally(function() {
        btn.disabled = false;
        btn.innerHTML = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
      });
  });
});
