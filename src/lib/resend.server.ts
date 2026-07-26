export async function sendWelcomeEmail(toEmail: string, displayName: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not defined. Welcome email skipped.");
    return false;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "EnglishTypingTest <onboarding@resend.dev>";
  const subject = "Welcome to EnglishTypingTest.org! 🎉";
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EnglishTypingTest.org</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #050508;
            color: #d1d5db;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            width: 100%;
            background-color: #050508;
            padding: 40px 0;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #0b0b10;
            border: 1px solid #1f1f2e;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          }
          .header-banner {
            background: linear-gradient(135deg, #0b0b10 0%, #1e1b4b 100%);
            padding: 40px 40px 30px;
            text-align: center;
            border-bottom: 1px solid #1f1f2e;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
            margin-bottom: 15px;
            font-family: system-ui, sans-serif;
          }
          .logo span {
            background: linear-gradient(135deg, #ec4899, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 800;
            line-height: 1.25;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
          }
          .greeting {
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .paragraph {
            font-size: 15px;
            line-height: 1.6;
            color: #9ca3af;
            margin-bottom: 24px;
          }
          .features-grid {
            margin: 32px 0;
            background-color: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 14px;
            padding: 24px;
          }
          .feature-card {
            margin-bottom: 20px;
          }
          .feature-card:last-child {
            margin-bottom: 0;
          }
          .feature-title {
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
          }
          .feature-icon {
            margin-right: 8px;
            font-size: 16px;
          }
          .feature-desc {
            font-size: 14px;
            color: #9ca3af;
            line-height: 1.5;
            padding-left: 24px;
          }
          .cta-container {
            text-align: center;
            margin: 35px 0 20px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #db2777, #6366f1);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            font-size: 15px;
            font-weight: 700;
            border-radius: 12px;
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
            transition: all 0.2s ease;
          }
          .footer {
            background-color: #07070a;
            border-top: 1px solid #1f1f2e;
            padding: 30px 40px;
            text-align: center;
          }
          .footer-text {
            font-size: 13px;
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 10px;
          }
          .footer-links a {
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header-banner">
              <div class="logo">English<span>TypingTest</span></div>
              <h1 class="title">Welcome to the family!</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hey ${displayName || "Typist"},</p>
              <p class="paragraph">We're absolutely thrilled to have you here. EnglishTypingTest.org has been completely upgraded to provide you with the fastest, smartest, and most satisfying typing experience on the web.</p>
              
              <div class="features-grid">
                <div class="feature-card">
                  <div class="feature-title">
                    <span class="feature-icon">📈</span> Live Performance Tracking
                  </div>
                  <div class="feature-desc">Monitor your WPM, accuracy percentages, and key metrics in real time with detailed history charts.</div>
                </div>
                
                <div class="feature-card">
                  <div class="feature-title">
                    <span class="feature-icon">⚔️</span> Multiplayer Typing Races
                  </div>
                  <div class="feature-desc">Battle against your friends or random typists worldwide in fast-paced live typing matches.</div>
                </div>
                
                <div class="feature-card">
                  <div class="feature-title">
                    <span class="feature-icon">🏅</span> XP, Coins & Achievements
                  </div>
                  <div class="feature-desc">Earn rewards, unlock badges, purchase items, and level up as you complete typing challenges.</div>
                </div>

                <div class="feature-card">
                  <div class="feature-title">
                    <span class="feature-icon">📜</span> Official Certificates
                  </div>
                  <div class="feature-desc">Complete tests, hit your target speed, and unlock verified typing certificates to display on your resume.</div>
                </div>
              </div>
              
              <p class="paragraph" style="text-align: center;">Ready to show us your fingers' speed? Click the button below to start your test:</p>
              
              <div class="cta-container">
                <a href="https://englishtypingtest.org/test" class="cta-button">🚀 Start Typing Test</a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">Have questions or feedback? We'd love to hear from you. Hit reply to this email or contact us at <a href="mailto:support@englishtypingtest.org" style="color: #6366f1; text-decoration: none;">support@englishtypingtest.org</a>.</p>
              <p class="footer-text">© ${new Date().getFullYear()} EnglishTypingTest.org. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Resend] API Error (HTTP ${res.status}): ${errText}`);
      return false;
    }

    const data = await res.json();
    console.log("[Resend] Welcome email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send welcome email:", error);
    return false;
  }
}
