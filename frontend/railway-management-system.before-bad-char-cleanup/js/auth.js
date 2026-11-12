/**
 * Authentication Engine - Login & Register Form Logic
 */

// Global Password Visibility Toggle
window.togglePasswordVisibility = function() {
  const passInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  if (!passInput) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (eyeIcon) {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>`;
    }
  } else {
    passInput.type = 'password';
    if (eyeIcon) {
      eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
    }
  }
};

// Global Forgot Password Dialog
window.handleForgotPassword = function() {
  const emailInput = document.getElementById('loginEmail');
  const currentEmail = emailInput ? emailInput.value.trim() : '';

  const modalHtml = `
    <div id="forgotPassModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div class="bg-slate-900 border border-sky-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center text-xl">
            🔑
          </div>
          <div>
            <h3 class="text-lg font-bold text-white leading-tight">Password Assistance</h3>
            <p class="text-xs text-slate-400">Bangladesh Railway Security Center</p>
          </div>
        </div>
        
        <p class="text-xs text-slate-300 mb-4 leading-relaxed">
          For demo testing, all accounts are pre-configured. If you need assistance accessing your registered railway portal profile, enter your email below:
        </p>

        <div class="mb-4">
          <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Your Registered Email</label>
          <input type="email" id="forgotEmailInput" value="${currentEmail || 'user@railway.com'}" class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none">
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-5">
          <div class="font-bold text-sky-400">Default Demo Credentials:</div>
          <div>• Passenger: <code class="text-white font-mono">user@railway.com</code> / <code class="text-sky-300 font-mono">user123</code></div>
          <div>• Ticket Mgr: <code class="text-white font-mono">tm@railway.com</code> / <code class="text-sky-300 font-mono">tm123</code></div>
          <div>• Station Master: <code class="text-white font-mono">sm@railway.com</code> / <code class="text-sky-300 font-mono">sm123</code></div>
          <div>• Train Mgr: <code class="text-white font-mono">trainmanager@railway.com</code> / <code class="text-sky-300 font-mono">train123</code></div>
          <div>• Admin: <code class="text-white font-mono">admin@railway.com</code> / <code class="text-sky-300 font-mono">admin123</code></div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button type="button" onclick="document.getElementById('forgotPassModal').remove()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            Close
          </button>
          <button type="button" onclick="confirmResetPassword()" class="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-sky-500/25 cursor-pointer">
            Send Reset Link
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.confirmResetPassword = function() {
  const modal = document.getElementById('forgotPassModal');
  if (modal) modal.remove();
  showToast('Password reset instructions have been sent to your email address.', 'success');
};

document.addEventListener('DOMContentLoaded', () => {
  // Role Selector Tabs setup in Login Page
  const roleTabs = document.querySelectorAll('.role-tab');
  const selectedRoleInput = document.getElementById('loginRole');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  const defaultRoleCreds = {
    user: { email: 'user@railway.com', pass: 'user123' },
    ticket_manager: { email: 'tm@railway.com', pass: 'tm123' },
    station_master: { email: 'sm@railway.com', pass: 'sm123' },
    train_manager: { email: 'trainmanager@railway.com', pass: 'train123' },
    admin: { email: 'admin@railway.com', pass: 'admin123' }
  };

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const role = tab.getAttribute('data-role');
      if (selectedRoleInput) selectedRoleInput.value = role;

      // Update role tab styles
      roleTabs.forEach(t => {
        t.classList.remove('active', 'bg-[#0284c7]', 'bg-sky-500', 'text-white', 'border-transparent', 'border-sky-400', 'shadow-[0_0_15px_rgba(2,132,199,0.4)]', 'shadow-lg', 'shadow-sky-500/30', 'scale-[1.02]');
        t.classList.add('bg-[#070e1c]', 'border-slate-800', 'text-slate-300');
      });

      tab.classList.remove('bg-[#070e1c]', 'border-slate-800', 'text-slate-300');
      tab.classList.add('active', 'bg-[#0284c7]', 'text-white', 'border-transparent', 'shadow-[0_0_15px_rgba(2,132,199,0.4)]');

      // Auto update credentials if field is empty or holding one of the demo emails
      if (emailInput && passInput && defaultRoleCreds[role]) {
        const knownEmails = Object.values(defaultRoleCreds).map(c => c.email.toLowerCase());
        if (!emailInput.value || knownEmails.includes(emailInput.value.toLowerCase())) {
          emailInput.value = defaultRoleCreds[role].email;
          passInput.value = defaultRoleCreds[role].pass;
        }
      }
    });
  });

  // Global Quick Demo Login Helper
  window.fillDemoCredentials = function(email, password, role) {
    const eInput = document.getElementById('loginEmail');
    const pInput = document.getElementById('loginPassword');
    if (eInput) eInput.value = email;
    if (pInput) pInput.value = password;

    const targetTab = document.querySelector(`.role-tab[data-role="${role}"]`);
    if (targetTab) {
      targetTab.click();
    }
  };


  // Login Form Handler — calls Flask /api/login, falls back to localStorage demo
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (!email || !password) {
        showToast('Please enter both email and password.', 'danger');
        return;
      }

      // Disable submit button while waiting
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

      // ── Try real API first ──────────────────────────────────────────────────
      const result = await apiCall('POST', '/api/login', { email, password });

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }

      if (result.ok && result.data && result.data.token) {
        const { token, user: apiUser } = result.data;
        setApiSession(token, apiUser);                 // persist token + user
        const user = getCurrentUser();

        let targetPage = 'user-dashboard.html';
        let roleTitle = 'Passenger';
        if (user.role === 'admin')           { targetPage = 'admin-dashboard.html';           roleTitle = 'System Admin'; }
        else if (user.role === 'ticket_manager') { targetPage = 'manage-tickets.html';        roleTitle = 'Ticket Manager'; }
        else if (user.role === 'station_master') { targetPage = 'manage-stations.html';       roleTitle = 'Station Master'; }
        else if (user.role === 'train_manager')  { targetPage = 'train-manager-dashboard.html'; roleTitle = 'Train Manager'; }

        showToast(`Welcome back, ${user.name} (${roleTitle})!`, 'success');
        setTimeout(() => { window.location.href = targetPage; }, 600);
        return;
      }

      // ── API failed — fall back to localStorage demo accounts ──────────────
      if (result.status === 401) {
        showToast(result.error || 'Invalid email or password credentials.', 'danger');
        return;
      }

      // Network/server error: try localStorage as offline fallback
      console.warn('[AUTH] API unavailable, trying localStorage fallback.');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        setCurrentUser(user);
        let targetPage = 'user-dashboard.html';
        let roleTitle = 'Passenger';
        if (user.role === 'admin')           { targetPage = 'admin-dashboard.html';           roleTitle = 'System Admin'; }
        else if (user.role === 'ticket_manager') { targetPage = 'manage-tickets.html';        roleTitle = 'Ticket Manager'; }
        else if (user.role === 'station_master') { targetPage = 'manage-stations.html';       roleTitle = 'Station Master'; }
        else if (user.role === 'train_manager')  { targetPage = 'train-manager-dashboard.html'; roleTitle = 'Train Manager'; }
        showToast(`Welcome back, ${user.name} (${roleTitle})! [Offline mode]`, 'success');
        setTimeout(() => { window.location.href = targetPage; }, 600);
      } else {
        showToast('Invalid email or password credentials.', 'danger');
      }
    });
  }

  // Registration Form Handler — calls Flask /api/register, falls back to localStorage
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const nid = document.getElementById('regNid').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const dob = document.getElementById('regDob').value;
      const gender = document.getElementById('regGender').value;
      const address = document.getElementById('regAddress').value.trim();

      if (!name || !email || !phone || !nid || !password || !dob || !gender || !address) {
        showToast('Please fill out all required registration fields.', 'danger');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Registering...'; }

      // Split name into first/last
      const nameParts = name.trim().split(' ');
      const first_name = nameParts[0] || name;
      const last_name = nameParts.slice(1).join(' ') || '';

      // Normalise gender to Oracle CHECK values
      const genderMap = { male: 'MALE', female: 'FEMALE', other: 'OTHER', m: 'MALE', f: 'FEMALE' };
      const normGender = genderMap[gender.toLowerCase()] || 'MALE';

      // ── Try real API first ──────────────────────────────────────────────────
      const result = await apiCall('POST', '/api/register', {
        first_name, last_name, email, password, phone, nid,
        date_of_birth: dob, gender: normGender, city: address
      });

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }

      if (result.ok && result.data && result.data.token) {
        const { token, user: apiUser } = result.data;
        setApiSession(token, apiUser);
        showToast('Passenger registration successful! Redirecting to dashboard...', 'success');
        setTimeout(() => { window.location.href = 'user-dashboard.html'; }, 800);
        return;
      }

      if (result.status === 409) {
        showToast(result.error || 'An account with this email already exists.', 'warning');
        return;
      }

      if (result.status >= 400 && result.status < 500) {
        showToast(result.error || 'Registration failed. Please check your inputs.', 'danger');
        return;
      }

      // ── Network error fallback: write to localStorage ──────────────────────
      console.warn('[AUTH] API unavailable, using localStorage fallback for registration.');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('An account with this email already exists.', 'warning');
        return;
      }
      const newUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name, email, password, phone, nid, dob, gender, address,
        role: 'user',
        createdAt: new Date().toISOString().split('T')[0]
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      setCurrentUser(newUser);
      showToast('Passenger registration successful! Redirecting to dashboard... [Offline mode]', 'success');
      setTimeout(() => { window.location.href = 'user-dashboard.html'; }, 800);
    });
  }
});

