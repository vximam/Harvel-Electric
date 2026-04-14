/* ═══════════════════════════════════════════════════
   HARVEL ELECTRIC — SHARED AUTH SYSTEM
   Include this file on every page AFTER the header HTML
═══════════════════════════════════════════════════ */

/* ── Active nav highlighting ── */
(function(){
  var page = location.pathname.split('/').pop().replace('.html','') || 'index';
  document.querySelectorAll('.nav-link[data-page]').forEach(function(a){
    if(a.dataset.page === page) a.classList.add('on');
  });
})();

/* ── Burger / mobile menu ── */
var _burger = document.getElementById('burger');
var _mob = document.getElementById('mob');
if(_burger) _burger.addEventListener('click', function(){
  var o = _mob.classList.toggle('open');
  _burger.classList.toggle('open', o);
});
if(_mob) _mob.querySelectorAll('.nav-link').forEach(function(a){
  a.addEventListener('click', function(){
    _mob.classList.remove('open');
    _burger.classList.remove('open');
  });
});

/* ── Close mobile menu on resize to desktop ── */
window.addEventListener('resize', function(){
  if(window.innerWidth > 768){
    if(_mob) _mob.classList.remove('open');
    if(_burger) _burger.classList.remove('open');
  }
});

/* ── Header raise on scroll ── */
var _hdrEl = document.getElementById('hdr');
if(_hdrEl) window.addEventListener('scroll', function(){
  _hdrEl.classList.toggle('raised', scrollY > 20);
}, {passive:true});

/* ── Cart count ── */
function updateCartCount(){
  var c = JSON.parse(localStorage.getItem('harvelCart') || '[]');
  var t = c.reduce(function(s,i){ return s + (i.qty||1); }, 0);
  var el = document.getElementById('cartCount');
  if(el){ el.textContent = t; el.style.display = t > 0 ? 'flex' : 'none'; }
}
updateCartCount();
window.addEventListener('storage', updateCartCount);

/* ── Toast ── */
var _hdrToastTimer;
function showHdrToast(msg){
  var t = document.getElementById('hdrToast');
  if(!t) return;
  var m = document.getElementById('hdrToastMsg');
  if(m) m.textContent = msg;
  t.classList.add('show');
  clearTimeout(_hdrToastTimer);
  _hdrToastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2800);
}

/* ── LocalStorage helpers ── */
function _getUsers(){
  try { return JSON.parse(localStorage.getItem('harvel_users') || '[]'); }
  catch(e){ return []; }
}
function _saveUsers(u){ localStorage.setItem('harvel_users', JSON.stringify(u)); }
function _getSession(){
  try { return JSON.parse(localStorage.getItem('harvel_session') || 'null'); }
  catch(e){ return null; }
}
function _saveSession(u){ localStorage.setItem('harvel_session', JSON.stringify(u)); }
function _clearSession(){ localStorage.removeItem('harvel_session'); }

/* ── Auth modal open / close ── */
var _authMode = 'login';

function openAuthModal(mode){
  _authMode = mode || 'login';
  _renderAuthForm();
  var overlay = document.getElementById('authOverlay');
  if(overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function(){
    var f = document.querySelector('#authBody .auth-input');
    if(f) f.focus();
  }, 350);
}

function closeAuthModal(){
  var overlay = document.getElementById('authOverlay');
  if(overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e){
  if(e.target === document.getElementById('authOverlay')) closeAuthModal();
}

/* ── Render login / signup form ── */
function _renderAuthForm(){
  var il = _authMode === 'login';
  var titleEl = document.getElementById('authTitle');
  var subEl = document.getElementById('authSub');
  var bodyEl = document.getElementById('authBody');
  if(!titleEl || !subEl || !bodyEl) return;

  titleEl.innerHTML = il ? 'Welcome <em>back</em>' : 'Create <em>account</em>';
  subEl.textContent = il
    ? 'Login to your Harvel Electric account'
    : 'Join 50,000+ happy Harvel homes';

  bodyEl.innerHTML = il
    ? '<div class="auth-field"><label class="auth-label" for="li_email">Email Address</label><input class="auth-input" id="li_email" type="email" placeholder="you@example.com" autocomplete="email"></div>'
    + '<div class="auth-field"><label class="auth-label" for="li_pass">Password</label><input class="auth-input" id="li_pass" type="password" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key===\'Enter\')doLogin()"></div>'
    + '<div class="auth-err" id="li_err" style="margin-bottom:8px;font-size:13px"></div>'
    + '<button class="auth-submit" onclick="doLogin()">Login to Account &#8594;</button>'
    + '<div class="auth-switch">Don\'t have an account? <a onclick="openAuthModal(\'signup\')">Sign Up</a></div>'

    : '<div class="auth-field"><label class="auth-label" for="su_name">Full Name</label><input class="auth-input" id="su_name" type="text" placeholder="Ahmed Khan" autocomplete="name"></div>'
    + '<div class="auth-field"><label class="auth-label" for="su_email">Email Address</label><input class="auth-input" id="su_email" type="email" placeholder="you@example.com" autocomplete="email"></div>'
    + '<div class="auth-field"><label class="auth-label" for="su_phone">Phone Number</label><input class="auth-input" id="su_phone" type="tel" placeholder="03XX-XXXXXXX" autocomplete="tel"></div>'
    + '<div class="auth-field"><label class="auth-label" for="su_pass">Password</label><input class="auth-input" id="su_pass" type="password" placeholder="Min. 6 characters" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')doSignup()"></div>'
    + '<div class="auth-err" id="su_err" style="margin-bottom:8px;font-size:13px"></div>'
    + '<button class="auth-submit" onclick="doSignup()">Create Account &#8594;</button>'
    + '<div class="auth-switch">Already have an account? <a onclick="openAuthModal(\'login\')">Login</a></div>';
}

/* ── Validation helper ── */
function _showErr(id, msg){
  var el = document.getElementById(id);
  if(el){
    el.textContent = msg;
    el.className = 'auth-err' + (msg ? ' show' : '');
  }
}

/* ── Login ── */
function doLogin(){
  var email = (document.getElementById('li_email').value || '').trim().toLowerCase();
  var pass  = (document.getElementById('li_pass').value || '');
  _showErr('li_err','');

  if(!email || !pass){ _showErr('li_err','Please fill in all fields.'); return; }
  if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){ _showErr('li_err','Enter a valid email address.'); return; }

  var users = _getUsers(), user = null;
  for(var i=0; i<users.length; i++){
    if(users[i].email === email){ user = users[i]; break; }
  }
  if(!user){ _showErr('li_err','No account found with this email.'); return; }
  if(user.password !== btoa(pass)){ _showErr('li_err','Incorrect password.'); return; }

  var s = { name:user.name, email:user.email, phone:user.phone, joined:user.joined };
  _saveSession(s);
  _renderLoggedIn(s);
  closeAuthModal();
  showHdrToast('Welcome back, ' + user.name.split(' ')[0] + '! 👋');
}

/* ── Sign Up ── */
function doSignup(){
  var name  = (document.getElementById('su_name').value || '').trim();
  var email = (document.getElementById('su_email').value || '').trim().toLowerCase();
  var phone = (document.getElementById('su_phone').value || '').trim();
  var pass  = (document.getElementById('su_pass').value || '');
  _showErr('su_err','');

  if(!name || !email || !phone || !pass){ _showErr('su_err','Please fill in all fields.'); return; }
  if(!/^[^@]+@[^@]+\.[^@]+$/.test(email)){ _showErr('su_err','Enter a valid email address.'); return; }
  if(pass.length < 6){ _showErr('su_err','Password must be at least 6 characters.'); return; }

  var users = _getUsers();
  for(var i=0; i<users.length; i++){
    if(users[i].email === email){ _showErr('su_err','Account with this email already exists.'); return; }
  }

  var nu = {
    name:name, email:email, phone:phone,
    password:btoa(pass),
    joined: new Date().toLocaleDateString('en-PK',{year:'numeric',month:'long',day:'numeric'})
  };
  users.push(nu);
  _saveUsers(users);

  var s = { name:name, email:email, phone:phone, joined:nu.joined };
  _saveSession(s);
  _renderLoggedIn(s);
  closeAuthModal();
  showHdrToast('Welcome to Harvel, ' + name.split(' ')[0] + '! 🎉');
}

/* ── Render logged-in state ── */
function _renderLoggedIn(user){
  var ab = document.getElementById('authBtns');     if(ab) ab.style.display = 'none';
  var pa = document.getElementById('profileArea');   if(pa) pa.style.display = 'flex';

  var ini = (user.name || 'U').split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);

  var av = document.getElementById('profileAvatar');  if(av) av.textContent = ini;
  var nb = document.getElementById('profileNameBtn'); if(nb) nb.textContent = user.name.split(' ')[0];
  var dn = document.getElementById('pdName');         if(dn) dn.textContent = user.name;
  var de = document.getElementById('pdEmail');        if(de) de.textContent = user.email;

  var mab = document.getElementById('mobAuthBtns');    if(mab) mab.style.display = 'none';
  var mpa = document.getElementById('mobProfileArea'); if(mpa) mpa.style.display = 'block';
  var mpn = document.getElementById('mobPdName');      if(mpn) mpn.textContent = user.name;
  var mpe = document.getElementById('mobPdEmail');     if(mpe) mpe.textContent = user.email;
}

/* ── Logout ── */
function logoutUser(){
  _clearSession();
  var ab = document.getElementById('authBtns');     if(ab) ab.style.display = 'flex';
  var pa = document.getElementById('profileArea');   if(pa) pa.style.display = 'none';
  var mab = document.getElementById('mobAuthBtns');  if(mab) mab.style.display = 'flex';
  var mpa = document.getElementById('mobProfileArea'); if(mpa) mpa.style.display = 'none';
  var pd = document.getElementById('profileDropdown'); if(pd) pd.classList.remove('open');
  showHdrToast('Signed out successfully. See you soon!');
}

/* ── Profile dropdown toggle ── */
function toggleProfileDropdown(){
  var pd = document.getElementById('profileDropdown');
  if(pd) pd.classList.toggle('open');
}
document.addEventListener('click', function(e){
  var pw = document.querySelector('.profile-wrap');
  if(pw && !pw.contains(e.target)){
    var pd = document.getElementById('profileDropdown');
    if(pd) pd.classList.remove('open');
  }
});

/* ── Profile info modal ── */
function showProfileInfo(){
  var s = _getSession(); if(!s) return;
  var pd = document.getElementById('profileDropdown'); if(pd) pd.classList.remove('open');

  var ini = (s.name || 'U').split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);

  var ma = document.getElementById('profileModalAvatar'); if(ma) ma.textContent = ini;
  var me = document.getElementById('profileModalEmail');  if(me) me.textContent = s.email;
  var pn = document.getElementById('piName');   if(pn) pn.textContent = s.name;
  var pe = document.getElementById('piEmail');  if(pe) pe.textContent = s.email;
  var pp = document.getElementById('piPhone');  if(pp) pp.textContent = s.phone || '—';
  var pj = document.getElementById('piDate');   if(pj) pj.textContent = s.joined || '—';

  var po = document.getElementById('profileOverlay'); if(po) po.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal(){
  var po = document.getElementById('profileOverlay'); if(po) po.classList.remove('open');
  document.body.style.overflow = '';
}

function handleProfileOverlayClick(e){
  if(e.target === document.getElementById('profileOverlay')) closeProfileModal();
}

/* ── Restore session on page load ── */
(function(){
  var s = _getSession();
  if(s) _renderLoggedIn(s);
})();
