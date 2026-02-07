import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-page">
      {/* Control bar — light tan */}
      <nav className="bg-cream border-b border-edge sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex items-center justify-center h-8 w-8 border border-teak text-[14px] font-bold italic text-teak group-hover:text-espresso transition-colors select-none">
              Eq
            </span>
            <span className="italic text-[15px] text-tobacco group-hover:text-espresso transition-colors">
              ASR Equity Bench
            </span>
          </Link>
          <p className="hidden sm:block text-[13px] font-bold italic text-tobacco">
            Your accent should not determine the quality of service you receive
          </p>
          <Link
            href="/benchmark"
            className="text-[12px] italic text-cognac hover:text-espresso transition-colors"
          >
            Enter
          </Link>
        </div>
      </nav>

      {/* Hero — dark cinematic split */}
      <section className="bg-espresso relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-walnut/30 to-transparent" />

        <div className="mx-auto max-w-5xl px-8 py-20 sm:py-28 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left — text */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-6">
              Accent Bias in Speech Recognition
            </p>
            <h1 className="text-[42px] sm:text-[56px] font-bold leading-[1.08] text-cream mb-4 tracking-[-0.015em]">
              Millions Misheard.
              <br />
              <span className="text-camel">Service Denied.</span>
            </h1>
            <p className="text-[20px] italic text-bisque mb-10 leading-snug">
              &ldquo;Sorry, I didn&rsquo;t catch that.&rdquo;
            </p>
            <p className="text-[15px] text-dune leading-[1.85] max-w-md mb-12">
              Automated phone systems consistently fail non-American accents &mdash;
              misrouting calls, misunderstanding intents, and silently denying
              service to the people who need it most.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/benchmark"
                className="inline-block bg-cream text-espresso px-10 py-3.5 text-[14px] font-bold tracking-[0.06em] hover:bg-bisque transition-colors"
              >
                Start Benchmark
              </Link>
              <Link
                href="#about"
                className="text-[13px] italic text-camel hover:text-bisque transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>

          {/* Right — large phone + stats */}
          <div className="hidden md:flex items-center justify-center -ml-8">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 m-auto w-[500px] h-[500px] rounded-full bg-walnut/25 blur-[110px]" />
              {/* Phone SVG — large */}
              <svg
                viewBox="0 0 200 200"
                className="w-[480px] h-[480px] relative z-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Phone body */}
                <rect x="55" y="20" width="90" height="160" rx="12" stroke="#b8a08a" strokeWidth="1.5" fill="#3a2519" />
                <rect x="62" y="38" width="76" height="110" rx="4" fill="#4d3322" />
                {/* Speaker */}
                <rect x="82" y="28" width="36" height="3.5" rx="1.75" fill="#8b6f56" />
                {/* Camera dot */}
                <circle cx="76" cy="30" r="2" fill="#6b4c36" />
                {/* Home button */}
                <circle cx="100" cy="164" r="7" stroke="#8b6f56" strokeWidth="1.2" fill="none" />
                {/* Sound waves */}
                <path d="M148 72 C156 72, 160 84, 160 98 C160 112, 156 124, 148 124" stroke="#b8a08a" strokeWidth="1.5" fill="none" opacity="0.5" />
                <path d="M154 60 C168 60, 173 78, 173 98 C173 118, 168 136, 154 136" stroke="#b8a08a" strokeWidth="1.5" fill="none" opacity="0.35" />
                <path d="M160 48 C178 48, 185 72, 185 98 C185 124, 178 148, 160 148" stroke="#b8a08a" strokeWidth="1.2" fill="none" opacity="0.2" />
                {/* Screen — garbled transcript */}
                <rect x="70" y="48" width="42" height="2.5" rx="1" fill="#8b6f56" opacity="0.6" />
                <rect x="70" y="54" width="58" height="2.5" rx="1" fill="#8b6f56" opacity="0.4" />
                <rect x="70" y="60" width="32" height="2.5" rx="1" fill="#8b6f56" opacity="0.5" />
                {/* Divider line */}
                <line x1="70" y1="68" x2="130" y2="68" stroke="#6b4c36" strokeWidth="0.5" />
                {/* Error text */}
                <rect x="70" y="74" width="56" height="2.5" rx="1" fill="#7d3f33" opacity="0.7" />
                <rect x="70" y="80" width="40" height="2.5" rx="1" fill="#7d3f33" opacity="0.5" />
                <rect x="70" y="86" width="50" height="2.5" rx="1" fill="#7d3f33" opacity="0.4" />
                {/* X mark — misrouted */}
                <line x1="90" y1="98" x2="110" y2="118" stroke="#7d3f33" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                <line x1="110" y1="98" x2="90" y2="118" stroke="#7d3f33" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                {/* Bottom label */}
                <rect x="84" y="126" width="32" height="2.5" rx="1" fill="#7d3f33" opacity="0.4" />
                <rect x="78" y="132" width="44" height="2.5" rx="1" fill="#7d3f33" opacity="0.3" />
              </svg>

              {/* Stats floating to the right */}
              <div className="absolute -right-16 top-6 space-y-10">
                <div className="text-right">
                  <p className="text-[38px] font-bold text-cream leading-none">34%</p>
                  <p className="text-[11px] text-dune mt-1">higher error rate<br/>for non-US accents</p>
                </div>
                <div className="text-right">
                  <p className="text-[38px] font-bold text-claret leading-none">1 in 4</p>
                  <p className="text-[11px] text-dune mt-1">calls misrouted<br/>due to accent bias</p>
                </div>
                <div className="text-right">
                  <p className="text-[38px] font-bold text-camel leading-none">260<span className="text-[22px]">M</span></p>
                  <p className="text-[11px] text-dune mt-1">non-native English<br/>speakers affected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section id="about" className="bg-page py-0 px-0">
        <div className="w-full relative">

          {/* ── Ornate frame ── */}
          {/* Outer border — dark carved edge */}
          <div className="absolute inset-0 border-[6px] border-espresso/90 pointer-events-none z-20" />
          {/* Inner carved channel — inset shadow band */}
          <div className="absolute inset-[6px] border-[4px] border-walnut/70 pointer-events-none z-20" />
          {/* Gold inner lip */}
          <div className="absolute inset-[10px] border-[2px] border-camel/50 pointer-events-none z-20" />
          {/* Innermost fine rule */}
          <div className="absolute inset-[14px] border border-teak/30 pointer-events-none z-20" />

          {/* Corner flourishes — SVG ornaments at each corner */}
          {/* Top-left */}
          <div className="absolute -top-[2px] -left-[2px] z-30 pointer-events-none">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M4 44 C4 20, 20 4, 44 4" stroke="#8b6f56" strokeWidth="1.5" fill="none" />
              <path d="M8 44 C8 24, 24 8, 44 8" stroke="#6b4c36" strokeWidth="1" fill="none" />
              <circle cx="6" cy="6" r="3" fill="#3a2519" stroke="#8b6f56" strokeWidth="0.8" />
              <path d="M12 4 C12 4, 4 4, 4 12" stroke="#b8a08a" strokeWidth="0.8" fill="none" />
              <path d="M18 4 Q4 4, 4 18" stroke="#b8a08a" strokeWidth="0.5" fill="none" opacity="0.5" />
            </svg>
          </div>
          {/* Top-right */}
          <div className="absolute -top-[2px] -right-[2px] z-30 pointer-events-none">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="scale-x-[-1]">
              <path d="M4 44 C4 20, 20 4, 44 4" stroke="#8b6f56" strokeWidth="1.5" fill="none" />
              <path d="M8 44 C8 24, 24 8, 44 8" stroke="#6b4c36" strokeWidth="1" fill="none" />
              <circle cx="6" cy="6" r="3" fill="#3a2519" stroke="#8b6f56" strokeWidth="0.8" />
              <path d="M12 4 C12 4, 4 4, 4 12" stroke="#b8a08a" strokeWidth="0.8" fill="none" />
              <path d="M18 4 Q4 4, 4 18" stroke="#b8a08a" strokeWidth="0.5" fill="none" opacity="0.5" />
            </svg>
          </div>
          {/* Bottom-left */}
          <div className="absolute -bottom-[2px] -left-[2px] z-30 pointer-events-none">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="scale-y-[-1]">
              <path d="M4 44 C4 20, 20 4, 44 4" stroke="#8b6f56" strokeWidth="1.5" fill="none" />
              <path d="M8 44 C8 24, 24 8, 44 8" stroke="#6b4c36" strokeWidth="1" fill="none" />
              <circle cx="6" cy="6" r="3" fill="#3a2519" stroke="#8b6f56" strokeWidth="0.8" />
              <path d="M12 4 C12 4, 4 4, 4 12" stroke="#b8a08a" strokeWidth="0.8" fill="none" />
              <path d="M18 4 Q4 4, 4 18" stroke="#b8a08a" strokeWidth="0.5" fill="none" opacity="0.5" />
            </svg>
          </div>
          {/* Bottom-right */}
          <div className="absolute -bottom-[2px] -right-[2px] z-30 pointer-events-none">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="scale-[-1]">
              <path d="M4 44 C4 20, 20 4, 44 4" stroke="#8b6f56" strokeWidth="1.5" fill="none" />
              <path d="M8 44 C8 24, 24 8, 44 8" stroke="#6b4c36" strokeWidth="1" fill="none" />
              <circle cx="6" cy="6" r="3" fill="#3a2519" stroke="#8b6f56" strokeWidth="0.8" />
              <path d="M12 4 C12 4, 4 4, 4 12" stroke="#b8a08a" strokeWidth="0.8" fill="none" />
              <path d="M18 4 Q4 4, 4 18" stroke="#b8a08a" strokeWidth="0.5" fill="none" opacity="0.5" />
            </svg>
          </div>

          {/* Top-center ornament */}
          <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
              <path d="M0 10 Q10 2, 20 10 Q30 18, 40 10 Q50 2, 60 10 Q70 18, 80 10" stroke="#8b6f56" strokeWidth="1.2" fill="none" />
              <circle cx="40" cy="10" r="3.5" fill="#3a2519" stroke="#b8a08a" strokeWidth="0.8" />
              <circle cx="40" cy="10" r="1.5" fill="#8b6f56" />
            </svg>
          </div>
          {/* Bottom-center ornament */}
          <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
              <path d="M0 10 Q10 2, 20 10 Q30 18, 40 10 Q50 2, 60 10 Q70 18, 80 10" stroke="#8b6f56" strokeWidth="1.2" fill="none" />
              <circle cx="40" cy="10" r="3.5" fill="#3a2519" stroke="#b8a08a" strokeWidth="0.8" />
              <circle cx="40" cy="10" r="1.5" fill="#8b6f56" />
            </svg>
          </div>

          {/* ── Inner content on cream background ── */}
          <div className="relative bg-cream m-[18px] px-8 py-24 z-10">
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="frameGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#3a2519" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#frameGrid)" />
              </svg>
            </div>

            {/* Section heading */}
            <div className="text-center mb-20 relative">
              <p className="text-[11px] font-bold tracking-[0.35em] uppercase text-camel mb-3">How It Works</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-[1px] bg-camel/40" />
                <div className="w-2 h-2 rotate-45 border border-teak/60" />
                <div className="w-10 h-[1px] bg-camel/40" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              {/* Card 01 */}
              <div className="relative px-10 py-8 group">
                {/* Vertical divider line on right */}
                <div className="hidden md:block absolute right-0 top-8 bottom-8 w-[1px] bg-edge" />
                {/* Large watermark number */}
                <span className="absolute top-2 right-8 text-[96px] font-bold italic text-espresso/80 leading-none select-none pointer-events-none">
                  01
                </span>
                {/* Icon */}
                <div className="mb-6">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="16" height="20" rx="2" stroke="#8b6f56" strokeWidth="1.2" />
                    <rect x="24" y="8" width="16" height="20" rx="2" stroke="#8b6f56" strokeWidth="1.2" />
                    <rect x="14" y="16" width="16" height="20" rx="2" stroke="#b8a08a" strokeWidth="1.2" fill="#faf6f0" />
                    <line x1="18" y1="22" x2="26" y2="22" stroke="#8b6f56" strokeWidth="1" />
                    <line x1="18" y1="26" x2="24" y2="26" stroke="#8b6f56" strokeWidth="1" opacity="0.5" />
                    <line x1="18" y1="30" x2="27" y2="30" stroke="#8b6f56" strokeWidth="1" opacity="0.3" />
                  </svg>
                </div>
                {/* Number */}
                <p className="text-[12px] font-bold tracking-[0.25em] text-espresso mb-3">
                  01
                </p>
                {/* Decorative rule */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-[2px] bg-teak" />
                  <div className="w-2 h-[2px] bg-camel" />
                </div>
                <h3 className="text-[19px] font-bold text-chocolate mb-3 leading-snug">
                  Multi-Dataset<br />Evaluation
                </h3>
                <p className="text-[14px] text-cognac leading-[1.85]">
                  Four datasets spanning clean studio speech, phone conversations,
                  noisy environments, and scripted customer support prompts.
                </p>
              </div>

              {/* Card 02 */}
              <div className="relative px-10 py-8 group border-t md:border-t-0 border-edge">
                {/* Vertical divider line on right */}
                <div className="hidden md:block absolute right-0 top-8 bottom-8 w-[1px] bg-edge" />
                {/* Large watermark number */}
                <span className="absolute top-2 right-8 text-[96px] font-bold italic text-espresso/80 leading-none select-none pointer-events-none">
                  02
                </span>
                {/* Icon */}
                <div className="mb-6">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="24" width="5" height="12" rx="1" fill="#b8a08a" />
                    <rect x="16" y="16" width="5" height="20" rx="1" fill="#8b6f56" />
                    <rect x="24" y="20" width="5" height="16" rx="1" fill="#b8a08a" />
                    <rect x="32" y="10" width="5" height="26" rx="1" fill="#8b6f56" />
                    <line x1="6" y1="37" x2="39" y2="37" stroke="#6b4c36" strokeWidth="1" />
                    <path d="M10 28 L18 20 L26 24 L34 14" stroke="#7d3f33" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeDasharray="2 2" />
                  </svg>
                </div>
                {/* Number */}
                <p className="text-[12px] font-bold tracking-[0.25em] text-espresso mb-3">
                  02
                </p>
                {/* Decorative rule */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-[2px] bg-teak" />
                  <div className="w-2 h-[2px] bg-camel" />
                </div>
                <h3 className="text-[19px] font-bold text-chocolate mb-3 leading-snug">
                  Accent-Disaggregated<br />Metrics
                </h3>
                <p className="text-[14px] text-cognac leading-[1.85]">
                  CER, intent accuracy, and misrouting rates broken down by
                  speaker accent to surface hidden performance gaps.
                </p>
              </div>

              {/* Card 03 */}
              <div className="relative px-10 py-8 group border-t md:border-t-0 border-edge">
                {/* Large watermark number */}
                <span className="absolute top-2 right-8 text-[96px] font-bold italic text-espresso/80 leading-none select-none pointer-events-none">
                  03
                </span>
                {/* Icon */}
                <div className="mb-6">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="22" y1="6" x2="22" y2="34" stroke="#8b6f56" strokeWidth="1.2" />
                    <line x1="8" y1="16" x2="36" y2="16" stroke="#8b6f56" strokeWidth="1.2" />
                    <path d="M8 16 L5 28 L16 28 Z" stroke="#7d3f33" strokeWidth="1" fill="#7d3f33" fillOpacity="0.12" strokeLinejoin="round" />
                    <path d="M36 16 L33 22 L39 22 Z" stroke="#b8a08a" strokeWidth="1" fill="#b8a08a" fillOpacity="0.15" strokeLinejoin="round" />
                    <line x1="16" y1="34" x2="28" y2="34" stroke="#8b6f56" strokeWidth="1.2" />
                    <circle cx="35" cy="10" r="4" stroke="#7d3f33" strokeWidth="1" fill="none" />
                    <line x1="35" y1="8" x2="35" y2="10.5" stroke="#7d3f33" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="35" cy="12" r="0.6" fill="#7d3f33" />
                  </svg>
                </div>
                {/* Number */}
                <p className="text-[12px] font-bold tracking-[0.25em] text-espresso mb-3">
                  03
                </p>
                {/* Decorative rule */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-[2px] bg-teak" />
                  <div className="w-2 h-[2px] bg-camel" />
                </div>
                <h3 className="text-[19px] font-bold text-chocolate mb-3 leading-snug">
                  Disparity<br />Index
                </h3>
                <p className="text-[14px] text-cognac leading-[1.85]">
                  A single ratio quantifying how unequal performance is across
                  groups. Values above <strong className="font-semibold text-tobacco">1.5</strong> signal systemic bias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-8 py-10 text-center text-[11px] text-flax tracking-[0.15em]">
          Customer Support ASR Equity Benchmark
        </div>
      </footer>
    </div>
  );
}
