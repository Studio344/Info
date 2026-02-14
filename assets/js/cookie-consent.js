/**
 * Cookie Consent Banner — GDPR / 日本個人情報保護法対応
 * AdSense の読み込みをユーザーの同意に基づいて制御する
 */
(function () {
  const STORAGE_KEY = 'studio344_cookie_consent';
  const ADSENSE_SRC =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3044810068333301';

  /* ---------- ヘルパー ---------- */

  /** localStorage から同意状態を取得する */
  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  /** localStorage に同意状態を保存する */
  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // Private browsing 等で書き込み不可の場合は無視
    }
  }

  /** AdSense スクリプトを動的にロードする */
  function loadAdSense() {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = ADSENSE_SRC;
    document.head.appendChild(s);
  }

  /* ---------- バナー制御 ---------- */

  /** バナーを表示する */
  function showBanner() {
    var banner = document.getElementById('cookie-consent');
    if (!banner) return;
    banner.style.display = '';
    // 次フレームでクラスを付与してアニメーション開始
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('cookie-consent--visible');
      });
    });
  }

  /** バナーを非表示にする */
  function hideBanner() {
    var banner = document.getElementById('cookie-consent');
    if (!banner) return;
    banner.classList.remove('cookie-consent--visible');
    banner.addEventListener(
      'transitionend',
      function () {
        banner.style.display = 'none';
      },
      { once: true }
    );
    // transitionend が発火しない場合のフォールバック
    setTimeout(function () {
      banner.style.display = 'none';
    }, 500);
  }

  /** 「同意する」ボタン押下 */
  function handleAccept() {
    setConsent('accepted');
    hideBanner();
    loadAdSense();
  }

  /** 「拒否する」ボタン押下 */
  function handleDecline() {
    setConsent('declined');
    hideBanner();
  }

  /* ---------- 初期化 ---------- */

  function init() {
    var consent = getConsent();

    // 過去に同意済み → AdSense 読み込み、バナー非表示
    if (consent === 'accepted') {
      loadAdSense();
      return;
    }

    // 過去に拒否済み → 何もしない
    if (consent === 'declined') {
      return;
    }

    // 初回訪問 → バナーを表示
    showBanner();

    // ボタンイベント登録
    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn) acceptBtn.addEventListener('click', handleAccept);
    if (declineBtn) declineBtn.addEventListener('click', handleDecline);
  }

  /** フッターの「Cookie Settings」リンクで再表示 */
  function bindSettingsLink() {
    var settingsBtn = document.getElementById('cookie-settings-btn');
    if (!settingsBtn) return;
    settingsBtn.addEventListener('click', function () {
      // ボタンイベントを再登録（初回以降にも対応）
      var acceptBtn = document.getElementById('cookie-accept');
      var declineBtn = document.getElementById('cookie-decline');
      if (acceptBtn) {
        acceptBtn.removeEventListener('click', handleAccept);
        acceptBtn.addEventListener('click', handleAccept);
      }
      if (declineBtn) {
        declineBtn.removeEventListener('click', handleDecline);
        declineBtn.addEventListener('click', handleDecline);
      }
      showBanner();
    });
  }

  // DOM 準備完了後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      bindSettingsLink();
    });
  } else {
    init();
    bindSettingsLink();
  }
})();
