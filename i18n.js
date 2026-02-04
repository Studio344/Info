// i18n.js
i18next.init({
    lng: "ja",
    resources: {
      ja: {
        translation: {
          nav: {
            about: "About",
            blog: "Blog",
            projects: "Projects",
            contact: "Contact"
          },
          about: {
            title: "About",
            content: "某グローバルIT企業に勤務。<br>人の役に立つ知識・技術の探求が大好き。"
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 日本語ディスクレーマー（やや控えめ）
          disclaimer: "[免責事項] このアカウントは個人的利用を目的としています。所属組織の公式見解を代表するものではありません。",
          home: {
            about_content: "某グローバルIT企業に勤務。<br>\"人の役に立ってこそ技術\" という信念のもと、最新のWeb技術からバックエンドアーキテクチャまで幅広く探求しています。<br>このサイトでは、これまでの制作物や技術的な学び（Engineering Logs）を発信していきます。",
            more_about: "More about me &rarr;",
            projects_title: "Projects",
            projects_desc: "View Recent Works &rarr;",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs &rarr;",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email"
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc: "Studio344 は、テクノロジーとデザインの融合を通じて、ユーザーの生活に新しい価値と彩りを提供することを目指す個人の開発スタジオです。「使いやすさ」と「美しさ」の両立をテーマに、Webアプリケーションからモバイルアプリまで幅広い開発を行っています。",
            profile_title: "Developer Profile",
            profile_desc: "某グローバルIT企業に勤務。<br>プライベートでは、自身の興味関心に基づき、最新のWeb技術（React, Next.js, WebGLなど）を用いた実験的なプロジェクトや、実用的なツールの開発を行っています。",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "「Just Build It.」をモットーに、アイデアを形にすることを最優先しています。失敗を恐れず、常に新しい技術に挑戦し続けることで、エンジニアとしての成長と、より良いプロダクトの創出を目指しています。"
          },
          contact_page: {
            title: "Contact",
            desc: "当サイトは個人の趣味によるポートフォリオサイトです。<br>技術的な交流やご感想などは、以下のリンクよりお気軽にご連絡ください。",
            email: "Email",
            email_desc: "直接メールでのお問い合わせはこちらへお願いいたします。",
            email_note: "※返信には数日いただく場合がございます。",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "開発ログや技術的な知見を不定期に更新します。",
            articles: {
                article1: {
                    date: "2026.02.04",
                    title: "ユーザビリティと技術発信のためのサイト刷新",
                    p1: "ユーザー体験の向上と、より詳細な技術情報の発信を目的として、ポートフォリオサイトの構造をシングルページからマルチページ構成へ刷新しました。単なるリンク集ではなく、各プロジェクトの技術的な詳細を「読めるコンテンツ」として提供することを意図しています。",
                    p2: "主な変更点は以下の通りです。",
                    li1: "プロジェクト詳細ページの作成（UCFitness, Portfolio）",
                    li2: "必須ページ（プライバシーポリシー、お問い合わせ）の追加",
                    li3: "サイトマップの整備"
                },
                article2: {
                    date: "2026.01.20",
                    title: "UCFitness: Fitbit APIのレート制限との戦い",
                    p1: "自作のフィットネストラッカー「UCFitness」の開発において最大の壁となったのが、Fitbit APIのAPI Rate Limitです。1ユーザーあたり1時間150リクエストという制限は、リアルタイム性を求めるアプリには少々厳しいものでした。",
                    p2: "この問題を解決するために、Next.jsのAPI RoutesとSupabaseを組み合わせ、 데이터를バックグラウンドでバッチ取得・キャッシュするアーキテクチャを採用しました。これにより、フロントエンドからの過剰なリクエストを防ぎつつ、ユーザーには高速なランキング表示を提供できるようになりました。"
                }
            }
          }
        }
      },
      en: {
        translation: {
          nav: {
            about: "About",
            blog: "Blog",
            projects: "Projects",
            contact: "Contact"
          },
          about: {
            title: "About",
            content: "Engineer working in a global IT company, passionate about solving technical challenges and helping others."
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 英語ディスクレーマー（控えめ）
          disclaimer: "[Disclaimer] This account is for personal usage. Does not represent the official views of the organization.",
          home: {
            about_content: "Working at a global IT company.<br>Driven by the belief that \"technology exists to help people,\" I explore everything from modern Web tech to backend architecture.<br>Here, I share my works and engineering logs.",
            more_about: "More about me &rarr;",
            projects_title: "Projects",
            projects_desc: "View Recent Works &rarr;",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs &rarr;",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email"
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc: "Studio344 is a personal development studio aimed at providing new value and color to users' lives through the fusion of technology and design. With the theme of balancing 'Usability' and 'Beauty', I develop a wide range of applications from Web to mobile apps.",
            profile_title: "Developer Profile",
            profile_desc: "Working at a global IT company.<br>In my private time, based on my interests, I work on experimental projects using the latest Web technologies (React, Next.js, WebGL, etc.) and develop practical tools.",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "My motto is \"Just Build It.\" I prioritize giving shape to ideas. Not afraid of failure, I aim to grow as an engineer and create better products by constantly challenging new technologies."
          },
          contact_page: {
            title: "Contact",
            desc: "This is a personal portfolio site for hobby projects.<br>For technical exchanges or feedback, please feel free to contact me via the links below.",
            email: "Email",
            email_desc: "Please contact me directly via email here.",
            email_note: "*Response may take a few days.",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "I update development logs and technical insights irregularly.",
            articles: {
                article1: {
                    date: "2026.02.04",
                    title: "Site Renewal for Usability and Technical Showcase",
                    p1: "To improve user experience and share more detailed technical information, I revamped the portfolio site structure from a single page to a multi-page layout. The intention is not just a collection of links, but to provide technical details of each project as 'readable content'.",
                    p2: "Key changes are as follows:",
                    li1: "Creation of project detail pages (UCFitness, Portfolio)",
                    li2: "Addition of essential pages (Privacy Policy, Contact)",
                    li3: "Sitemap configuration"
                },
                article2: {
                    date: "2026.01.20",
                    title: "UCFitness: Battling Fitbit API Rate Limits",
                    p1: "The biggest hurdle in developing my custom fitness tracker 'UCFitness' was the Fitbit API Rate Limit. The limit of 150 requests per hour per user was quite strict for an app requiring real-time updates.",
                    p2: "To solve this, I adopted an architecture combining Next.js API Routes and Supabase to batch fetch and cache data in the background. This prevents excessive requests from the frontend while providing high-speed ranking displays to users."
                }
            }
          }
        }
      }
    }
  }, function(err, t) {
    updateContent();
  });
  
  i18next.on('languageChanged', () => updateContent());
  
  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = i18next.t(key);
      // If content has <br> or HTML tags, use innerHTML, otherwise textContent
      if (value.includes('<') && value.includes('>')) {
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
  });
  