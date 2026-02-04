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
            desc: "制作依頼、技術的なご相談、その他のお問い合わせは、以下のリンク（SNSまたはメール）よりお気軽にご連絡ください。",
            email: "Email"
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
            desc: "For production requests, technical consultations, or other inquiries, please feel free to contact me via the links below (SNS or Email).",
            email: "Email"
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
  