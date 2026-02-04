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
  