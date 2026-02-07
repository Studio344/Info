// i18n.js
i18next.init(
  {
    lng: "ja",
    resources: {
      ja: {
        translation: {
          nav: {
            about: "About",
            blog: "Blog",
            projects: "Projects",
            contact: "Contact",
          },
          about: {
            title: "About",
            content:
              "某グローバルIT企業に勤務しています。技術で誰かの役に立つことが好きです。",
          },
          projects: {
            title: "Projects",
          },
          contact: {
            title: "Contact",
          },
          // 日本語ディスクレーマー（標準的）
          disclaimer:
            "[免責事項] 本サイトは個人のポートフォリオであり、所属する組織の公式見解を代表するものではありません。",
          home: {
            about_content:
              "某グローバルIT企業でエンジニアをしています。「技術は人のためにあってこそ」をモットーに、最新のWeb技術からバックエンドまで幅広く技術を探求しています。<br><br>このサイトでは、これまでの制作物や技術的な学び（Engineering Logs）を発信していきます。",
            more_about: "More about me →",
            projects_title: "Projects",
            projects_desc: "View Recent Works →",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs →",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email",
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc:
              "Studio344は、テクノロジーとデザインを融合させ、日常に「便利」や「彩り」をプラスすることを目指す個人の開発スタジオです。<br><br>「使いやすさ」と「美しさ」の両立をテーマに、Webアプリからモバイルアプリまで幅広く開発しています。",
            profile_title: "Developer Profile",
            profile_desc:
              "某グローバルIT企業勤務。<br><br>プライベートでは、関心を持った最新技術（React, Next.js, WebGLなど）を用いた実験的なプロジェクトや、日々の課題を解決するツールの開発を行っています。",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc:
              "「Just Build It.」がモットーです。アイデアがあれば、失敗を恐れずにまず形にしてみる。新しい技術に挑戦し続けることで、エンジニアとしての成長を目指しています。",
          },
          contact_page: {
            title: "Contact",
            desc: "当サイトは個人のポートフォリオサイトです。技術的な交流やご感想などがございましたら、以下のリンクよりお気軽にご連絡ください。",
            email: "Email",
            email_desc: "メールでのお問い合わせはこちらからお願いいたします。",
            email_note:
              "※返信には数日いただく場合がございます。あらかじめご了承ください。",
            social_title: "Social Media",
            github_text: "GitHub",
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "開発ログや技術的な知見を不定期に更新します。",
          },
          projects_page: {
            title: "All Projects",
            desc: "Studio344 で開発・運用しているプロジェクト一覧です。",
          },
          privacy: {
            title: "プライバシーポリシー",
            info_title: "1. 情報の取得",
            info_desc:
              "Studio344（以下「当サイト」）では、主に次の方法でユーザー情報を取得することがあります。",
            info_cookies:
              "<strong>クッキー（Cookies）</strong>: 当サイトでは、トラフィックデータの収集のためにGoogle AnalyticsやGoogle AdSenseを使用しています。これらのデータは匿名で収集されており、個人を特定するものではありません。",
            usage_title: "2. 情報の利用",
            usage_desc:
              "当サイトで収集された情報は、以下の目的で利用されます。",
            usage_analytics: "サイトの利便性向上や改善のための分析",
            usage_ads: "ユーザーに適した広告の配信（Google AdSense など）",
            ads_title: "3. 広告について",
            ads_desc:
              "当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報「Cookie」(氏名、住所、メール アドレス、電話番号は含まれません) を使用することがあります。",
            ads_link:
              'Google AdSense に関する詳細は、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank">Googleポリシーと規約</a>をご覧ください。',
            disclaimer_title: "4. 免責事項",
            disclaimer_desc:
              "当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。",
            contact_title: "5. お問い合わせ",
            contact_desc:
              '本ポリシーに関するお問い合わせは、<a href="contact.html">お問い合わせページ</a>よりお願いいたします。',
            updated: "最終更新日: 2026年2月4日",
          },
          terms: {
            title: "利用規約",
            intro:
              "この利用規約（以下「本規約」）は、Studio344（以下「当方」）がこのウェブサイト上で提供するサービス（以下「本サービス」）の利用条件を定めるものです。",
            scope_title: "1. 適用",
            scope_desc:
              "本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されるものとします。",
            prohibited_title: "2. 禁止事項",
            prohibited_desc:
              "ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。",
            prohibited_law: "法令または公序良俗に違反する行為",
            prohibited_crime: "犯罪行為に関連する行為",
            prohibited_disrupt:
              "当方のサービスの運営を妨害するおそれのある行為",
            prohibited_access: "不正アクセスをし、またはこれを試みる行為",
            disclaimer_title: "3. 免責事項",
            disclaimer_desc:
              "当方の債務不履行責任は、当方の故意または重過失によらない場合には免責されるものとします。当方は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。",
            copyright_title: "4. 著作権",
            copyright_desc:
              "本サイトに掲載されている全てのコンテンツは、当方が所有しています。書面による許可なく、個人的な目的以外で使用することは禁止されています。",
            updated: "最終更新日: 2026年2月4日",
          },
        },
      },
      en: {
        translation: {
          nav: {
            about: "About",
            blog: "Blog",
            projects: "Projects",
            contact: "Contact",
          },
          about: {
            title: "About",
            content:
              "Engineer working in a global IT company, passionate about using technology to help others.",
          },
          projects: {
            title: "Projects",
          },
          contact: {
            title: "Contact",
          },
          // 英語ディスクレーマー（標準的）
          disclaimer:
            "[Disclaimer] This is a personal portfolio. Opinions are my own and do not represent my employer.",
          home: {
            about_content:
              'Working as an engineer at a global IT company. With the belief that "technology exists to help people," I explore a wide range of fields from modern Web tech to backend architecture.<br><br>This site serves as a log of my works and engineering insights.',
            more_about: "More about me →",
            projects_title: "Projects",
            projects_desc: "View Recent Works →",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs →",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email",
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc:
              'Studio344 is a personal development studio aiming to add value and color to daily life through the fusion of technology and design.<br><br>Focusing on balancing "Usability" and "Aesthetics," I develop various applications from Web to mobile apps.',
            profile_title: "Developer Profile",
            profile_desc:
              "Working at a global IT company.<br><br>In my private time, I work on experimental projects using the latest Web technologies (React, Next.js, WebGL, etc.) and develop practical tools to solve daily problems.",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc:
              'My motto is "Just Build It." When I have an idea, I try to give it shape without fear of failure. By constantly challenging new technologies, I aim to grow as an engineer.',
          },
          contact_page: {
            title: "Contact",
            desc: "This is a personal portfolio site. For technical exchanges or feedback, please feel free to contact me via the links below.",
            email: "Email",
            email_desc: "Please contact me via email here.",
            email_note:
              "*Response may take a few days. Thank you for your understanding.",
            social_title: "Social Media",
            github_text: "GitHub",
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "I update development logs and technical insights irregularly.",
          },
          projects_page: {
            title: "All Projects",
            desc: "A list of projects developed and maintained by Studio344.",
          },
          privacy: {
            title: "Privacy Policy",
            info_title: "1. Information Collection",
            info_desc:
              'Studio344 (hereinafter "this site") may collect user information primarily through the following methods.',
            info_cookies:
              "<strong>Cookies</strong>: This site uses Google Analytics and Google AdSense to collect traffic data. This data is collected anonymously and does not identify individuals.",
            usage_title: "2. Use of Information",
            usage_desc:
              "Information collected on this site is used for the following purposes.",
            usage_analytics:
              "Analysis to improve site usability and functionality",
            usage_ads:
              "Delivery of relevant advertisements (e.g., Google AdSense)",
            ads_title: "3. Advertising",
            ads_desc:
              "This site uses third-party advertising services (Google AdSense). These advertisers may use cookies (which do not include your name, address, email, or phone number) to display ads for products and services relevant to your interests based on your visits to this and other sites.",
            ads_link:
              'For more details about Google AdSense, please see <a href="https://policies.google.com/technologies/ads?hl=en" target="_blank">Google Policies & Terms</a>.',
            disclaimer_title: "4. Disclaimer",
            disclaimer_desc:
              "While we strive to post accurate information on this site, there may be errors or outdated content. We accept no responsibility for any damages arising from the content published on this site.",
            contact_title: "5. Contact",
            contact_desc:
              'For inquiries regarding this policy, please contact us via the <a href="contact.html">Contact page</a>.',
            updated: "Last updated: February 4, 2026",
          },
          terms: {
            title: "Terms of Service",
            intro:
              'These Terms of Service (hereinafter "Terms") set forth the conditions for use of the services (hereinafter "Service") provided by Studio344 (hereinafter "we/us") on this website.',
            scope_title: "1. Application",
            scope_desc:
              "These Terms apply to all aspects of the relationship between the user and us regarding the use of the Service.",
            prohibited_title: "2. Prohibited Actions",
            prohibited_desc:
              "Users shall not engage in the following actions when using the Service.",
            prohibited_law:
              "Actions that violate laws or public order and morals",
            prohibited_crime: "Actions related to criminal activity",
            prohibited_disrupt:
              "Actions that may interfere with the operation of our Service",
            prohibited_access: "Unauthorized access or attempts thereof",
            disclaimer_title: "3. Disclaimer",
            disclaimer_desc:
              "We shall be exempt from liability for non-performance of obligations unless caused by our intentional or gross negligence. We accept no responsibility for any transactions, communications, or disputes between users or between users and third parties in connection with the Service.",
            copyright_title: "4. Copyright",
            copyright_desc:
              "All content published on this site is owned by us. Use beyond personal purposes without written permission is prohibited.",
            updated: "Last updated: February 4, 2026",
          },
        },
      },
    },
  },
  function (err, t) {
    updateContent();
  },
);

i18next.on("languageChanged", () => updateContent());

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = i18next.t(key);
    // If content has <br> or HTML tags, use innerHTML, otherwise textContent
    if (value.includes("<") && value.includes(">")) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
}

// --- Language Toggle Logic (Moved from script.js) ---
document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  let currentLang = i18next.language || "ja"; // Sync with initialized lang

  if (langToggle) {
    // Initialize button text based on current state
    langToggle.textContent = currentLang === "ja" ? "EN" : "JP";

    langToggle.addEventListener("click", () => {
      const newLang = i18next.language === "ja" ? "en" : "ja";
      i18next.changeLanguage(newLang);
      langToggle.textContent = newLang === "ja" ? "EN" : "JP";
    });
  }

  // --- ハンバーガーメニューのトグルロジック ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const overlay = document.querySelector(".nav-menu-overlay");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
      if (overlay) overlay.classList.toggle("open", isOpen);
      // ハンバーガーアイコンを × に切り替え
      hamburger.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });

    // オーバーレイクリックでメニューを閉じる
    if (overlay) {
      overlay.addEventListener("click", () => {
        navMenu.classList.remove("open");
        overlay.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    }

    // ナビリンクをクリックしたときにメニューを閉じる
    navMenu.querySelectorAll(".nav-btn").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.id === "lang-toggle") return; // 言語切替は閉じない
        navMenu.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }
});
