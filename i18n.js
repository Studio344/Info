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
              "某グローバルIT企業に勤務。趣味でWebアプリやツールを作っています。",
          },
          projects: {
            title: "Projects",
          },
          contact: {
            title: "Contact",
          },
          // 日本語ディスクレーマー（標準的）
          disclaimer:
            "[免責事項] 本サイトは個人の趣味ポートフォリオであり、<br>所属する組織の公式見解を代表するものではありません。",
          home: {
            about_content:
              "某グローバルIT企業でエンジニアをしています。<br>仕事とは別に、趣味として個人開発を楽しんでいます。<br><br>このサイトでは、趣味で作ったものや技術的な学び（Engineering Logs）を発信していきます。",
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
            mission_title: "Studio344 とは",
            mission_desc:
              "Studio344は、テクノロジーとものづくりが好きな個人の趣味アカウントです。<br>仕事とは別に、興味のある技術を自由に試したり、個人開発を楽しむための場として運営しています。<br><br>「面白そう」と思ったらまず手を動かす。<br>そんなスタンスで、Webアプリやツールなどを気ままに作っています。",
            profile_title: "Profile",
            profile_desc:
              "某グローバルIT企業でエンジニアとして勤務。<br><br>業務外の時間で、気になった技術（React, Next.js, WebGLなど）を触ったり、<br>日常のちょっとした不便を解消するツールを作ったりしています。",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc:
              "「Just Build It.」がモットーです。<br>完璧を目指すより、まず動くものを作ってみる。<br>趣味だからこそ、失敗を気にせず新しいことに挑戦できると思っています。",
          },
          contact_page: {
            title: "Contact",
            desc: "当サイトは個人のポートフォリオサイトです。<br>技術的な交流やご感想などがございましたら、以下のリンクよりお気軽にご連絡ください。",
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
            desc: "Studio344 で趣味として開発したプロジェクト一覧です。",
            view_project: "詳細を見る →",
          },
          portfolio_page: {
            title: "Studio344 Portfolio",
            subtitle:
              "Bento Gridデザインを採用した、没入感のあるポートフォリオサイト",
            view_source: "View Source Code →",
            features_title: "主な特徴",
            feature1_title: "Vanilla Implementation",
            feature1_desc:
              "ReactやVueを使用せず、素のJavaScriptとCSSのみで構築。Lighthouseスコアはほぼ満点を達成し、最軽量のロード時間を実現。",
            feature2_title: "Dynamic Aesthetics",
            feature2_desc:
              "CSS変数とJSを連携させ、マウス位置に追従するスポットライト効果や、SVGフィルターによるノイズテクスチャを実装。",
            feature3_title: "i18n Support",
            feature3_desc:
              "i18nextライブラリを活用した、スムーズな日英言語切り替え機能。コンテンツのグローバル対応を意識した設計。",
            design_title: "デザインコンセプト",
            design_desc:
              "「モダンで未来的、かつ情報の視認性を損なわない」をコンセプトに設計されました。近年トレンドのBento Gridを採用し、アクセスしやすさとビジュアルの美しさを両立しています。",
          },
          ucfitness_page: {
            title: "UCFitness Dashboard",
            subtitle:
              "Fitbit APIを活用した、グループ対抗フィットネス・トラッキング・プラットフォーム",
            visit_site: "Visit Live Site →",
            features_title: "主な機能",
            features_intro:
              "UCFitness は「究極のソーシャルフィットネスダッシュボード」として、以下の3つのコア機能を提供します。",
            feature1_title: "リアルタイムランキング",
            feature1_desc:
              "順位をリアルタイムで追跡。日次、週次、月次で同僚や友人と歩数・活動量を比較できます。",
            feature2_title: "グループバトル",
            feature2_desc:
              "グループに参加してチーム対抗戦。個人のスコアだけでなく、チーム全体の合計値で競い合いましょう。",
            feature3_title: "バッジ獲得",
            feature3_desc:
              "マイルストーン到達や連続記録（ストリーク）でユニークなバッジをアンロック。成果を可視化します。",
            tech_title: "技術スタック",
            tech_intro:
              "最新のモダンWeb技術スタックを採用し、高速かつスケーラブルなアプリケーションを構築しました。",
            tech_frontend:
              "<strong>Frontend Framework:</strong> Next.js (App Router) - サーバーコンポーネントによる高速な初期表示を実現。",
            tech_ui:
              "<strong>UI Library:</strong> TailwindCSS & Shadcn/UI - 美しく一貫性のあるデザインシステムを構築。",
            tech_auth:
              "<strong>Authentication:</strong> OAuth 2.0 (Fitbit Web API) - セキュアなトークン管理と自動リフレッシュ機能。",
            tech_db:
              "<strong>Database & Realtime:</strong> Supabase (PostgreSQL) - ランキングのリアルタイム更新（Live Subscription）に使用。",
            tech_deploy:
              "<strong>Deployment:</strong> Vercel + Cloudflare - エッジネットワークを活用したグローバル配信。",
            arch_title: "アーキテクチャのポイント",
            arch_subtitle: "Fitbit API Rate Limit 対策:",
            arch_desc:
              "ユーザー数が増加してもAPI制限に抵触しないよう、独自のキャッシングレイヤーを実装しています。個別のユーザーリクエストごとにAPIを叩くのではなく、サーバーサイドワーカーが定期的にデータを収集・集計し、データベースを更新する「非同期集計アーキテクチャ」を採用しました。",
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
              "Engineer at a global IT company. I build web apps and tools as a hobby.",
          },
          projects: {
            title: "Projects",
          },
          contact: {
            title: "Contact",
          },
          // 英語ディスクレーマー（標準的）
          disclaimer:
            "[Disclaimer] This is a personal hobby portfolio. Opinions are my own and do not represent my employer.",
          home: {
            about_content:
              'Working as an engineer at a global IT company.<br>Outside of work, I enjoy building things as a personal hobby.<br><br>This site serves as a log of my hobby projects and engineering insights.',
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
            mission_title: "What is Studio344?",
            mission_desc:
              'Studio344 is a personal hobby account for someone who loves technology and building things.<br>It\'s a space where I freely experiment with interesting tech and enjoy personal development, separate from work.<br><br>If something looks fun, I just start building it.<br>With that mindset, I casually create web apps, tools, and whatever else catches my interest.',
            profile_title: "Profile",
            profile_desc:
              "Working as an engineer at a global IT company.<br><br>In my free time, I tinker with technologies that catch my eye (React, Next.js, WebGL, etc.)<br>and build small tools to solve everyday inconveniences.",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc:
              'My motto is "Just Build It."<br>Rather than aiming for perfection, I prefer to just make something that works first.<br>Because it\'s a hobby, I can challenge new things without worrying about failure.',
          },
          contact_page: {
            title: "Contact",
            desc: "This is a personal portfolio site.<br>For technical exchanges or feedback, please feel free to contact me via the links below.",
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
            desc: "A list of hobby projects built under Studio344.",
            view_project: "View Project →",
          },
          portfolio_page: {
            title: "Studio344 Portfolio",
            subtitle:
              "An immersive portfolio site featuring Bento Grid design",
            view_source: "View Source Code →",
            features_title: "Core Features",
            feature1_title: "Vanilla Implementation",
            feature1_desc:
              "Built with pure JavaScript and CSS only, without React or Vue. Achieved near-perfect Lighthouse scores with ultra-fast load times.",
            feature2_title: "Dynamic Aesthetics",
            feature2_desc:
              "Linking CSS variables with JS to create a spotlight effect that follows mouse movement and noise textures via SVG filters.",
            feature3_title: "i18n Support",
            feature3_desc:
              "Smooth Japanese/English language switching powered by the i18next library. Designed with global content delivery in mind.",
            design_title: "Design Concept",
            design_desc:
              "Designed with the concept of being modern and futuristic while maintaining information readability. Adopting the trending Bento Grid layout to balance accessibility and visual beauty.",
          },
          ucfitness_page: {
            title: "UCFitness Dashboard",
            subtitle:
              "A group fitness tracking platform powered by the Fitbit API",
            visit_site: "Visit Live Site →",
            features_title: "Core Features",
            features_intro:
              "UCFitness serves as the ultimate social fitness dashboard, offering three core features.",
            feature1_title: "Real-time Leaderboard",
            feature1_desc:
              "Track rankings in real time. Compare steps and activity levels with colleagues and friends on a daily, weekly, and monthly basis.",
            feature2_title: "Group Battles",
            feature2_desc:
              "Join a group and compete in team battles. Compete not just on individual scores, but on the combined totals of your entire team.",
            feature3_title: "Badge Collection",
            feature3_desc:
              "Unlock unique badges by reaching milestones or maintaining streaks. Visualize your achievements.",
            tech_title: "Tech Stack Detail",
            tech_intro:
              "Built with a modern web technology stack for a fast and scalable application.",
            tech_frontend:
              "<strong>Frontend Framework:</strong> Next.js (App Router) - Fast initial rendering with server components.",
            tech_ui:
              "<strong>UI Library:</strong> TailwindCSS & Shadcn/UI - A beautiful and consistent design system.",
            tech_auth:
              "<strong>Authentication:</strong> OAuth 2.0 (Fitbit Web API) - Secure token management with automatic refresh.",
            tech_db:
              "<strong>Database & Realtime:</strong> Supabase (PostgreSQL) - Used for real-time leaderboard updates (Live Subscription).",
            tech_deploy:
              "<strong>Deployment:</strong> Vercel + Cloudflare - Global delivery via edge networks.",
            arch_title: "Architecture Highlights",
            arch_subtitle: "Fitbit API Rate Limit Strategy:",
            arch_desc:
              "A custom caching layer is implemented to avoid hitting API limits as user count grows. Instead of making API calls per individual user request, a server-side worker periodically collects and aggregates data, updating the database via an asynchronous aggregation architecture.",
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
