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
            content: "某グローバルIT企業で働いています。<br>技術で誰かの役に立つのが大好きです。"
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 日本語ディスクレーマー（フレンドリー）
          disclaimer: "[免責事項] ここはあくまで個人の趣味サイトです。<br>所属する会社の意見とは一切関係ありません。",
          home: {
            about_content: "普段は某グローバルIT企業でエンジニアをしています。<br>「技術は人のためにあってこそ」をモットーに、<br>最新のWeb技術からバックエンドまで、<br>面白そうなことは何でも試しています。<br><br>このサイトは、そんな私の「作ったもの」や<br>「学んだこと」の置き場所です。",
            more_about: "More about me →",
            projects_title: "Projects",
            projects_desc: "View Recent Works →",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs →",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email"
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc: "Studio344は、テクノロジーとデザインを組み合わせて、<br>日常にちょっとした「便利」や「彩り」をプラスすることを目指す、<br>個人の実験室です。<br><br>「使いやすさ」と「見た目の良さ」の両方を大切にしながら、<br>Webアプリからモバイルアプリまで、自由に作っています。",
            profile_title: "Developer Profile",
            profile_desc: "某グローバルIT企業勤務。<br><br>プライベートでは「これ面白そう！」と思った最新技術<br>（React, Next.js, WebGLなど）を使って実験的なアプリを作ったり、<br>日々の作業を楽にするツールを作ったりしています。",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "「とりあえず作ってみる (Just Build It.)」がモットーです。<br>アイデアがあったら、失敗を恐れずにまず形にしてみる。<br>そうやって新しい技術に触れ続けることで、<br>エンジニアとしてレベルアップしていきたいと思っています。"
          },
          contact_page: {
            title: "Contact",
            desc: "ここは個人の趣味サイトです。<br>技術的な話や、「ここ良かったよ！」等のご感想があれば、<br>以下のリンクからお気軽にどうぞ。",
            email: "Email",
            email_desc: "メールでのお問い合わせはこちらから。",
            email_note: "※すぐには返信できないこともありますが、<br>気長にお待ちください。",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "開発ログや技術的な知見を不定期に更新します。"
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
            content: "I work at a global IT company and love using tech to help people!"
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 英語ディスクレーマー（フレンドリー）
          disclaimer: "[Disclaimer] This is just a personal hobby site. Opinions are my own, not my employer's.",
          home: {
            about_content: "Currently working as an engineer at a global IT company.<br>I believe technology is best when it helps people. I love exploring everything from the latest Web tech to backend architecture.<br>This site is where I share what I've built and what I've learned along the way.",
            more_about: "More about me →",
            projects_title: "Projects",
            projects_desc: "View Recent Works →",
            blog_title: "Blog",
            blog_desc: "Read Engineering Logs →",
            connect_title: "Let's Connect",
            gh_label: "GitHub",
            email_label: "Email"
          },
          about_page: {
            title: "About Studio344",
            mission_title: "Mission",
            mission_desc: "Studio344 is my personal playground where I aim to add a bit of fun and color to daily life by mixing technology and design. I focus on both 'Usability' and 'Good Looks' while building everything from Web apps to mobile tools.",
            profile_title: "Developer Profile",
            profile_desc: "Working at a global IT company.<br>In my free time, I build experimental projects using whatever tech catches my interest (React, Next.js, WebGL, etc.) or create tools to make my own life easier.",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "My motto is \"Just Build It.\" If I have an idea, I try to build it first without fear of failure. I believe that constantly trying out new tech is the best way to grow as an engineer."
          },
          contact_page: {
            title: "Contact",
            desc: "This is a personal hobby site.<br>If you want to talk tech or just share some feedback, feel free to reach out via the links below!",
            email: "Email",
            email_desc: "Drop me an email here.",
            email_note: "*I might take a few days to reply, so please bear with me.",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "I update development logs and technical insights irregularly."
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
  