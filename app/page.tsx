import styles from './page.module.css';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.headerHeroContainer}>
        {/* ——— NAV ——— */}
        <header className={styles.nav}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>StudioFlow</span>
          </div>

          <div className={styles.navRight}>
            <Link href="/dashboard" className={styles.navCta}>
              Dashboard <span className={styles.navCtaArrow}>↗</span>
            </Link>
            <button className={styles.navMenu} aria-label="Menu">
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        {/* ——— HERO ——— */}
        <main className={styles.hero}>
          <div className={styles.heroContent}>
            {/* Line 1 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>Turning posts</h1>
            </div>

            {/* Line 2 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>
                <span className={styles.pushDown}>into</span>{' '}
                <span className={styles.pillPurple}>
                  <span className={styles.sparkle}>✦</span>products
                </span>
              </h1>
            </div>

            {/* Line 3 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>
                and digital{' '}
                <span className={styles.pillYellow}>revenue✦</span>
              </h1>
            </div>

            <p className={styles.heroDescBottom}>
              Turn your social media content into sellable digital products with AI that writes in your voice.
            </p>

            <div className={styles.logoBar}>
              <div className={styles.logoBarItem}>
                <span className={`${styles.logoBarIcon} ${styles.logoBarIconSmall}`} style={{ fontSize: '12.48px' }}>𝕏</span>
                <span>Twitter / X</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}>in</span>
                <span>LinkedIn</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </span>
                <span>Instagram</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={`${styles.logoBarIcon} ${styles.logoBarIconSmall}`}>♪</span>
                <span>TikTok</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}>▶</span>
                <span>YouTube</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ——— HOW IT WORKS ——— */}
      <section className={styles.howItWorks}>
        <div className={styles.hiwHeaderContainer}>
          <h2 className={styles.hiwTitle}>From idea to digital product</h2>
          <p className={styles.hiwSubtitle}>
            Create, format, and package your unique insights into revenue-generating assets in minutes.
          </p>
        </div>

        <div className={styles.hiwGrid}>
          {/* Column 1 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarPurple}></span>
                <span>Brainstorming</span>
              </div>
              <span className={styles.hiwStepNum}>1</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardPurple}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Idea/Brainstorming (Lightbulb)" */}
                <div className={styles.geoBulbGlass}></div>
                <div className={styles.geoBulbBase}></div>
                <div className={styles.geoBulbFilament}></div>
                <div className={styles.geoBulbRay1}></div>
                <div className={styles.geoBulbRay2}></div>
                <div className={styles.geoBulbRay3}></div>
                <div className={styles.geoBulbRay4}></div>
                <div className={styles.geoBulbRay5}></div>
              </div>
              <div className={styles.hiwCardLabel}>Idea Architect</div>
              <p className={styles.hiwCardDesc}>Generate endless niche ideas tailored to your audience.</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarBlue}></span>
                <span>Creation</span>
              </div>
              <span className={styles.hiwStepNum}>2</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardBlue}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Speech/Content" */}
                <div className={styles.geoSpeechBubble}></div>
                <div className={styles.geoSpeechTail}></div>
                <div className={styles.geoSpeechDot1}></div>
                <div className={styles.geoSpeechDot2}></div>
                <div className={styles.geoSpeechDot3}></div>
              </div>
              <div className={styles.hiwCardLabel}>Content Crafter</div>
              <p className={styles.hiwCardDesc}>Turn your ideas into platform-ready posts automatically.</p>
            </div>
          </div>

          {/* Column 3 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarOrange}></span>
                <span>Monetization</span>
              </div>
              <span className={styles.hiwStepNum}>3</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardOrange}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Digital Product" */}
                <div className={styles.geoCardBack}></div>
                <div className={styles.geoCardFront}></div>
                <div className={styles.geoSparkle}></div>
              </div>
              <div className={styles.hiwCardLabel}>Product Generator</div>
              <p className={styles.hiwCardDesc}>Compile your best content into sellable digital products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FEATURES ——— */}
      <section className={styles.features}>
        {/* Split Header */}
        <div className={styles.featuresHeader}>
          <div className={styles.featuresHeaderLeft}>
            <div className={styles.featuresBadge}>Features</div>
            <h2 className={styles.featuresTitle}>
              Everything you need to <span className={styles.featuresTitleAccent}>
                <span className={styles.featuresTitleIcon}>✦</span>monetize
              </span>
            </h2>
          </div>
          <div className={styles.featuresHeaderRight}>
            <p className={styles.featuresDesc}>
              StudioFlow uses AI to turn your niche ideas into platform-ready posts, then compile them into digital products — all in one workspace. You retain full ownership of your content.
            </p>
          </div>
        </div>

        {/* 3 Cards Grid */}
        <div className={styles.featuresGrid}>
          {/* Card 1: AI Tone & Style Profiler */}
          <div className={styles.featuresCard}>
            <div className={styles.mockupContainer}>
              <div className={styles.voiceMockup}>
                <div className={styles.voiceMockupHeader}>
                  <span className={styles.voiceMockupTitle}>+ Tone Profile</span>
                  <div className={styles.mockupToggleHeader}></div>
                </div>
                <div className={styles.voiceMockupBody}>
                  <div className={styles.mockupSectionLabel}>Active profile</div>
                  <div className={styles.mockupRow}>
                    <div className={styles.mockupAvatar}>SC</div>
                    <div className={styles.mockupMeta}>
                      <span className={styles.mockupName}>Star Chukwu</span>
                      <span className={styles.mockupSub}>Tech Creator</span>
                    </div>
                    <div className={styles.mockupToggleActive}>
                      <span></span>
                    </div>
                  </div>

                  <div className={styles.mockupSectionLabel}>Tone preferences</div>
                  <div className={styles.mockupRow}>
                    <div className={styles.avatarGroup}>
                      <span className={styles.avatarGroupItem} style={{ backgroundColor: '#D4F53C' }}>ED</span>
                      <span className={styles.avatarGroupItem} style={{ backgroundColor: '#BDE0FE' }}>PR</span>
                      <span className={styles.avatarGroupItem} style={{ backgroundColor: '#FF9E5E' }}>CA</span>
                    </div>
                    <div className={styles.mockupMeta}>
                      <span className={styles.mockupName}>Edu, Prof, Casual</span>
                      <span className={styles.mockupSub}>Active Tones</span>
                    </div>
                    <div className={styles.mockupToggleActive}>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className={styles.featuresCardLabel}>AI Tone & Style Profiler</h3>
            <p className={styles.featuresCardDesc}>
              Upload your past posts. The AI analyzes and matches your unique style, tone, and context across all generated content.
            </p>
          </div>

          {/* Card 2: Multi-Platform Crafter */}
          <div className={styles.featuresCard}>
            <div className={styles.mockupContainer}>
              <div className={styles.editorMockup}>
                <div className={styles.editorMockupHeader}>
                  <span className={styles.editorMockupTitle}>+ Craft Content</span>
                  <div className={styles.mockupDropdown}></div>
                </div>
                <div className={styles.editorMockupBody}>
                  <div className={styles.editorInputRow}>
                    <div className={styles.editorInputLine}>Enter topic or URL...</div>
                  </div>
                  <div className={styles.editorInputRow}>
                    <div className={styles.editorInputLine}>Select target platform...</div>
                  </div>
                  <button className={styles.editorBtn}>
                    <span>Generate Draft</span>
                    <div className={styles.mockCursor}></div>
                  </button>
                </div>
              </div>
            </div>
            <h3 className={styles.featuresCardLabel}>Multi-Platform Crafter</h3>
            <p className={styles.featuresCardDesc}>
              Generate optimized drafts for Twitter, LinkedIn, Instagram, and TikTok simultaneously. One click to transform ideas.
            </p>
          </div>

          {/* Card 3: One-Click Product Compiler */}
          <div className={styles.featuresCardOuter}>
            {/* Swirl / Wave Graphic behind card 3 */}
            <div className={styles.swirlBackground}>
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 80 C 40 10, 60 10, 100 80 C 130 140, 160 140, 190 80" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="6 6" />
                <path d="M20 100 C 50 30, 70 30, 110 100 C 140 160, 170 160, 200 100" stroke="#BDE0FE" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className={`${styles.featuresCard} ${styles.featuresCardTilted}`}>
              <div className={styles.mockupContainer}>
                <div className={styles.productMockup}>
                  <div className={styles.productMockupHeader}>
                    <span className={styles.productMockupTitle}>+ Product Outline</span>
                    <div className={styles.mockupCheckboxChecked}></div>
                  </div>
                  <div className={styles.productMockupBody}>
                    <div className={styles.checkRow}>
                      <span className={`${styles.circleCheckbox} ${styles.checked}`}>✓</span>
                      <div className={styles.checkText}>Chapter 1: The Core Niche</div>
                    </div>
                    <div className={styles.checkRow}>
                      <span className={`${styles.circleCheckbox} ${styles.checked}`}>✓</span>
                      <div className={styles.checkText}>Chapter 2: Audience Building</div>
                    </div>
                    <div className={styles.checkRow}>
                      <span className={styles.circleCheckbox}></span>
                      <div className={styles.checkText}>Chapter 3: Monetization System</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className={styles.featuresCardLabel}>One-Click Product Compiler</h3>
              <p className={styles.featuresCardDesc}>
                Bundle your top content into templates, checklists, or short ebooks. Price them instantly and start earning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA & FAQ SECTION ——— */}
      <section className={styles.ctaFaqSection}>
        {/* Left: CTA Card */}
        <div className={styles.ctaCard}>
          {/* Bold Blob Abstract Shapes */}
          <div className={styles.ctaBlob1}></div>
          <div className={styles.ctaBlob2}></div>
          <div className={styles.ctaBlob3}></div>
          <div className={styles.ctaBlob4}></div>

          <div className={styles.ctaContent}>
            <h2 className={styles.ctaHeading}>Ready to Monetize Your Audience?</h2>
            <p className={styles.ctaSubheading}>Compile, price, and sell digital products from your dashboard.</p>
            <Link href="/dashboard" className={styles.ctaButton}>
              Get Started Today
            </Link>
          </div>
        </div>

        {/* Right: FAQ Accordion */}
        <div className={styles.faqAccordion}>
          <details className={styles.faqDetails} open>
            <summary className={styles.faqSummary}>
              How does StudioFlow match my writing voice?
            </summary>
            <div className={styles.faqAnswer}>
              By uploading your past posts or essays, our AI Voice Architect creates a custom semantic tone profile, matching your style, phrasing, and complexity.
            </div>
          </details>

          <details className={styles.faqDetails}>
            <summary className={styles.faqSummary}>
              Do I own the generated content and products?
            </summary>
            <div className={styles.faqAnswer}>
              Yes, absolutely. You retain 100% ownership of every post generated and every digital product compiled.
            </div>
          </details>

          <details className={styles.faqDetails}>
            <summary className={styles.faqSummary}>
              What platforms are supported for content generation?
            </summary>
            <div className={styles.faqAnswer}>
              StudioFlow currently exports drafts optimized for Twitter/X, LinkedIn, Instagram, and TikTok.
            </div>
          </details>

          <details className={styles.faqDetails}>
            <summary className={styles.faqSummary}>
              How do I monetize my content into products?
            </summary>
            <div className={styles.faqAnswer}>
              With our Product Compiler, you can select your top-performing content, compile it into an ebook, checklist, or template, and price it instantly.
            </div>
          </details>

          <details className={styles.faqDetails}>
            <summary className={styles.faqSummary}>
              Is my profile and audience data secure?
            </summary>
            <div className={styles.faqAnswer}>
              Yes, we follow strict privacy regulations. Your data is stored securely in-session and is never sold or shared with third parties.
            </div>
          </details>
        </div>
      </section>

      {/* ——— FOOTER ——— */}
      <footer className={styles.footerContainer}>
        {/* Top half with columns */}
        <div className={styles.footerTopRow}>
          {/* Column 1: Bio */}
          <div className={`${styles.footerColumn} ${styles.footerColumnBio}`}>
            <div className={styles.footerLogoContainer}>
              <div className={styles.footerLogoIcon}></div>
              <span className={styles.footerLogoText}>StudioFlow</span>
            </div>
            <p className={styles.footerBioText}>
              StudioFlow is your AI-powered content monetization studio. Built to turn social posts into products.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.footerColumn}>
            <span className={styles.footerColumnHeading}>Explore</span>
            <div className={styles.footerLinkList}>
              <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
              <Link href="/dashboard" className={styles.footerLink}>Features</Link>
              <Link href="/dashboard" className={styles.footerLink}>API Docs</Link>
            </div>
          </div>

          {/* Column 3: Platform Social Tags */}
          <div className={`${styles.footerColumn} ${styles.footerColumnSocial}`}>
            <span className={styles.footerColumnHeading}>Follow us</span>
            <div className={styles.socialPillsGrid}>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                <span className={styles.socialPillPlatform}>𝕏</span>
                <span className={styles.socialPillHandle}>@studioflow</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                <span className={styles.socialPillPlatform}>◎</span>
                <span className={styles.socialPillHandle}>@studioflow</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                <span className={styles.socialPillPlatform}>in</span>
                <span className={styles.socialPillHandle}>@studioflow</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                <span className={styles.socialPillPlatform}>▶</span>
                <span className={styles.socialPillHandle}>@studioflow</span>
              </a>
            </div>
          </div>

          {/* Column 4: CTA Cards */}
          <div className={`${styles.footerColumn} ${styles.footerColumnCtas}`}>
            <Link href="/dashboard" className={styles.footerCtaBlock}>
              <div className={styles.footerCtaTitleRow}>
                <span className={`${styles.footerCtaTitle} ${styles.footerCtaTitlePrimary}`}>Launch Dashboard</span>
                <span className={styles.footerCtaArrow}>↗</span>
              </div>
              <span className={styles.footerCtaSubtitle}>Get started free</span>
            </Link>

            <Link href="/dashboard" className={styles.footerCtaBlock}>
              <div className={styles.footerCtaTitleRow}>
                <span className={styles.footerCtaTitle}>Explore API</span>
                <span className={styles.footerCtaArrow}>↗</span>
              </div>
              <span className={styles.footerCtaSubtitle}>Developer access</span>
            </Link>
          </div>
        </div>

        {/* Giant Cropped typographic logo signature */}
        <div className={styles.giantFooterTextContainer}>
          <div className={styles.giantFooterText}>studioflow</div>
        </div>

        {/* Bottom bar with status and disclaimers */}
        <div className={styles.footerBottomBar}>
          <div className={styles.footerBottomLeft}>
            <div className={styles.footerCopyrightRow}>
              <span>StudioFlow &copy; 2026</span>
              <span className={styles.footerDot}>•</span>
              <Link href="/privacy" className={styles.footerBottomLink}>Privacy Policy</Link>
            </div>
            {/* Required disclaimers by security.md */}
            <div className={styles.footerComplianceText}>
              Generated by StudioFlow AI. You own this content. The AI's output is non-exclusive. GDPR-aligned: You have the right to access, export, or delete your data at any time.
            </div>
          </div>

          <div className={styles.footerBottomRight}>
            <div className={styles.footerStatusWidget}>
              <span className={styles.footerStatusLocation}>London</span>
              <span className={styles.footerStatusTime}>1:41 AM</span>
              <span className={styles.footerStatusTemp}>12°C</span>
              <span className={styles.footerStatusIcon}>☁</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
