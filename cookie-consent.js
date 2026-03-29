(function () {
  var GA_ID = 'G-YB6HL7VGH1';
  var STORAGE_KEY = 'storepilot_cookie_preferences_v1';
  var lang = (document.documentElement.lang || 'en').toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
  var texts = {
    it: {
      title: 'Cookie e analytics',
      description: 'Usiamo cookie e tecnologie strettamente necessarie al funzionamento del sito e, solo con il tuo consenso, Google Analytics 4 per misurare in forma aggregata le visite alla landing page.',
      accept: 'Accetta analytics',
      reject: 'Solo necessari',
      manage: 'Gestisci preferenze',
      settings: 'Cookie',
      policy: 'Cookie Policy',
      helper: 'Puoi modificare la scelta in qualsiasi momento.'
    },
    en: {
      title: 'Cookies and analytics',
      description: 'We use cookies and technologies strictly necessary for site functionality and, only with your consent, Google Analytics 4 to measure landing page visits in aggregated form.',
      accept: 'Accept analytics',
      reject: 'Necessary only',
      manage: 'Manage preferences',
      settings: 'Cookies',
      policy: 'Cookie Policy',
      helper: 'You can change your choice at any time.'
    }
  };
  var t = texts[lang];
  var policyHref = lang === 'it' ? '/cookie-it.html' : '/cookie.html';
  var banner;
  var settingsButton;
  var gaLoaded = false;

  function readPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function savePrefs(analytics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      analytics: !!analytics,
      updatedAt: new Date().toISOString()
    }));
  }

  function expireCookie(name) {
    var host = window.location.hostname;
    var domains = [
      '',
      '; domain=' + host,
      host.indexOf('.') > -1 ? '; domain=.' + host.split('.').slice(-2).join('.') : ''
    ].filter(Boolean);
    domains.unshift('');
    domains.forEach(function (domain) {
      document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + domain + '; SameSite=Lax';
    });
  }

  function clearAnalyticsCookies() {
    var names = ['_ga', '_gid', '_gat'];
    names.forEach(expireCookie);
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name.indexOf('_ga_') === 0) {
        expireCookie(name);
      }
    });
  }

  function ensureGtagStub() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
  }

  function loadAnalytics() {
    if (gaLoaded) {
      return;
    }
    gaLoaded = true;
    ensureGtagStub();
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    script.onload = function () {
      window.gtag('js', new Date());
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
      window.gtag('config', GA_ID, {
        anonymize_ip: true
      });
    };
    document.head.appendChild(script);
  }

  function trackSimulatorClicks() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href*="storepilot.streamlit.app"]');
      if (!link || !gaLoaded || typeof window.gtag !== 'function') {
        return;
      }
      var label = (link.textContent || '').replace(/\s+/g, ' ').trim() || 'simulator_cta';
      window.gtag('event', 'click_simulator', {
        event_category: 'engagement',
        event_label: label,
        link_url: link.href,
        page_path: window.location.pathname,
        page_title: document.title
      });
    });
  }

  function applyChoice(analytics) {
    savePrefs(analytics);
    if (analytics) {
      loadAnalytics();
    } else {
      clearAnalyticsCookies();
    }
    closeBanner();
    showSettingsButton();
  }

  function closeBanner() {
    if (banner) {
      banner.classList.remove('sp-cookie-banner--visible');
    }
  }

  function openBanner() {
    if (banner) {
      banner.classList.add('sp-cookie-banner--visible');
    }
  }

  function showSettingsButton() {
    if (!settingsButton) {
      return;
    }
    settingsButton.hidden = false;
  }

  function injectStyles() {
    if (document.getElementById('sp-cookie-consent-style')) {
      return;
    }
    var style = document.createElement('style');
    style.id = 'sp-cookie-consent-style';
    style.textContent = [
      '.sp-cookie-banner{position:fixed;left:20px;right:20px;bottom:20px;z-index:9999;background:#111315;color:rgba(255,255,255,.94);border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.24);padding:18px 18px 16px;display:none;max-width:780px;margin:0 auto;}',
      '.sp-cookie-banner--visible{display:block;}',
      '.sp-cookie-banner h3{margin:0 0 8px;font:700 1.1rem/1.25 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;}',
      '.sp-cookie-banner p{margin:0 0 12px;font:400 .96rem/1.5 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:rgba(255,255,255,.78);}',
      '.sp-cookie-banner__actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}',
      '.sp-cookie-btn{appearance:none;border:0;border-radius:999px;padding:12px 16px;font:600 .94rem/1 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;cursor:pointer;transition:transform .18s ease,opacity .18s ease;}',
      '.sp-cookie-btn:hover{transform:translateY(-1px);}',
      '.sp-cookie-btn--primary{background:#ffffff;color:#111315;}',
      '.sp-cookie-btn--secondary{background:rgba(255,255,255,.12);color:#ffffff;}',
      '.sp-cookie-banner a{color:#ffffff;opacity:.9;text-underline-offset:3px;}',
      '.sp-cookie-banner__helper{margin-top:10px;font:400 .82rem/1.4 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:rgba(255,255,255,.62);}',
      '.sp-cookie-settings{position:fixed;left:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;background:#ffffff;color:#111315;padding:10px 14px;font:600 .88rem/1 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;box-shadow:0 10px 26px rgba(0,0,0,.16);cursor:pointer;}',
      '@media (max-width: 720px){.sp-cookie-banner{left:12px;right:12px;bottom:12px;padding:16px;}.sp-cookie-banner__actions{flex-direction:column;align-items:stretch;}.sp-cookie-btn{width:100%;}.sp-cookie-settings{left:12px;bottom:12px;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'sp-cookie-banner';
    banner.innerHTML = '' +
      '<h3>' + t.title + '</h3>' +
      '<p>' + t.description + '</p>' +
      '<div class="sp-cookie-banner__actions">' +
        '<button type="button" class="sp-cookie-btn sp-cookie-btn--secondary" data-sp-cookie="reject">' + t.reject + '</button>' +
        '<button type="button" class="sp-cookie-btn sp-cookie-btn--primary" data-sp-cookie="accept">' + t.accept + '</button>' +
        '<a href="' + policyHref + '">' + t.policy + '</a>' +
      '</div>' +
      '<div class="sp-cookie-banner__helper">' + t.helper + '</div>';
    document.body.appendChild(banner);
    banner.querySelector('[data-sp-cookie="accept"]').addEventListener('click', function () { applyChoice(true); });
    banner.querySelector('[data-sp-cookie="reject"]').addEventListener('click', function () { applyChoice(false); });

    settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'sp-cookie-settings';
    settingsButton.textContent = t.settings;
    settingsButton.hidden = true;
    settingsButton.addEventListener('click', openBanner);
    document.body.appendChild(settingsButton);
  }

  function init() {
    injectStyles();
    buildBanner();
    trackSimulatorClicks();
    var prefs = readPrefs();
    if (!prefs) {
      openBanner();
      return;
    }
    showSettingsButton();
    if (prefs.analytics) {
      loadAnalytics();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
