// Luminary Home — shared auth helper
// Client-side session via localStorage. No backend — for test/QA purposes only.
var LH = window.LH || {};
LH.auth = (function () {
  var KEY = 'lh_user';

  // Fast non-cryptographic hash (djb2). Good enough for test-site hashed IDs.
  function djb2(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
      h = h >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function hashEmail(email) {
    return djb2(email.toLowerCase().trim());
  }

  return {
    getUser: function () {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    },

    isLoggedIn: function () { return !!this.getUser(); },

    _store: function (email, name) {
      var h = hashEmail(email);
      var u = { email: email, name: name, email_hashed: h, id_hashed: 'uid_' + h };
      localStorage.setItem(KEY, JSON.stringify(u));
      return u;
    },

    login: function (email, name) { return this._store(email, name); },
    signup: function (email, name) { return this._store(email, name); },
    logout: function () { localStorage.removeItem(KEY); },

    // Returns the user sub-object used in every page's page_meta push
    getPageUserObject: function () {
      var u = this.getUser();
      return u
        ? { logged_in: true, id_hashed: u.id_hashed, email_hashed: u.email_hashed, customer_type: 'returning' }
        : { logged_in: false, id_hashed: null, email_hashed: null, customer_type: 'new' };
    },

    // Populates #auth-nav-items with Sign In / Sign Up or My Account / Logout
    updateNav: function () {
      var el = document.getElementById('auth-nav-items');
      if (!el) return;
      var u = this.getUser();
      if (u) {
        el.innerHTML =
          '<a href="dashboard.html" class="btn btn-sm btn-outline-secondary">My Account</a> ' +
          '<a href="#" id="lh-logout-btn" class="btn btn-sm btn-link text-muted p-0">Logout</a>';
        var btn = document.getElementById('lh-logout-btn');
        if (btn) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            LH.auth.logout();
            window.dataLayer = window.dataLayer || [];
            dataLayer.push({ event: 'logout' });
            window.location.href = 'index.html';
          });
        }
      } else {
        el.innerHTML =
          '<a href="login.html" class="btn btn-sm btn-outline-secondary">Sign In</a> ' +
          '<a href="signup.html" class="btn btn-sm btn-brand">Sign Up</a>';
      }
    }
  };
})();
