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
            content: "某グローバルIT企業に勤務しています。<br>技術で誰かの役に立つことが好きです。"
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 日本語ディスクレーマー（標準的）
          disclaimer: "[免責事項] 本サイトは個人のポートフォリオであり、<br>所属する組織の公式見解を代表するものではありません。",
          home: {
            about_content: "某グローバルIT企業でエンジニアをしています。<br>「技術は人のためにあってこそ」をモットーに、<br>最新のWeb技術からバックエンドまで、<br>幅広く技術を探求しています。<br><br>このサイトでは、これまでの制作物や<br>技術的な学び（Engineering Logs）を発信していきます。",
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
            mission_desc: "Studio344は、テクノロジーとデザインを融合させ、<br>日常に「便利」や「彩り」をプラスすることを目指す、<br>個人の開発スタジオです。<br><br>「使いやすさ」と「美しさ」の両立をテーマに、<br>Webアプリからモバイルアプリまで幅広く開発しています。",
            profile_title: "Developer Profile",
            profile_desc: "某グローバルIT企業勤務。<br><br>プライベートでは、関心を持った最新技術<br>（React, Next.js, WebGLなど）を用いた実験的なプロジェクトや、<br>日々の課題を解決するツールの開発を行っています。",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "「Just Build It.」がモットーです。<br>アイデアがあれば、失敗を恐れずにまず形にしてみる。<br>新しい技術に挑戦し続けることで、<br>エンジニアとしての成長を目指しています。"
          },
          contact_page: {
            title: "Contact",
            desc: "当サイトは個人のポートフォリオサイトです。<br>技術的な交流やご感想などがございましたら、<br>以下のリンクよりお気軽にご連絡ください。",
            email: "Email",
            email_desc: "メールでのお問い合わせはこちらからお願いいたします。",
            email_note: "※返信には数日いただく場合がございます。<br>あらかじめご了承ください。",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "開発ログや技術的な知見を不定期に更新します。"
          },
          projects_page: {
            title: "All Projects",
            desc: "Studio344 で開発・運用しているプロジェクト一覧です。"
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
            content: "Engineer working in a global IT company, passionate about using technology to help others."
          },
          projects: {
            title: "Projects"
          },
          contact: {
            title: "Contact"
          },
          // 英語ディスクレーマー（標準的）
          disclaimer: "[Disclaimer] This is a personal portfolio. Opinions are my own and do not represent my employer.",
          home: {
            about_content: "Working as an engineer at a global IT company.<br>With the belief that \"technology exists to help people,\"<br>I explore a wide range of fields from modern Web tech to backend architecture.<br>This site serves as a log of my works and engineering insights.",
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
            mission_desc: "Studio344 is a personal development studio aiming to add value and color<br>to daily life through the fusion of technology and design.<br><br>Focusing on balancing \"Usability\" and \"Aesthetics,\"<br>I develop various applications from Web to mobile apps.",
            profile_title: "Developer Profile",
            profile_desc: "Working at a global IT company.<br><br>In my private time, I work on experimental projects<br>using the latest Web technologies (React, Next.js, WebGL, etc.)<br>and develop practical tools to solve daily problems.",
            skills_title: "Technical Skills",
            philosophy_title: "Philosophy",
            philosophy_desc: "My motto is \"Just Build It.\"<br>When I have an idea, I try to give it shape without fear of failure.<br>By constantly challenging new technologies,<br>I aim to grow as an engineer."
          },
          contact_page: {
            title: "Contact",
            desc: "This is a personal portfolio site.<br>For technical exchanges or feedback,<br>please feel free to contact me via the links below.",
            email: "Email",
            email_desc: "Please contact me via email here.",
            email_note: "*Response may take a few days.<br>Thank you for your understanding.",
            social_title: "Social Media",
            github_text: "GitHub"
          },
          blog_page: {
            title: "Blog & Updates",
            desc: "I update development logs and technical insights irregularly."
          },
          projects_page: {
            title: "All Projects",
            desc: "A list of projects developed and maintained by Studio344."
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
  