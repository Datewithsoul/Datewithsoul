import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";

export type LegalSection = { title: string; content: string[] };

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

/** Long-form policy layout: sticky table of contents + numbered sections. */
export function LegalPage({
  eyebrow,
  title,
  highlight,
  updated,
  intro,
  sections,
  related,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  related: { href: string; label: string }[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} highlight={highlight} description={`อัปเดตล่าสุด: ${updated}`} />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <nav aria-label="สารบัญ" className="sticky top-28 animate-fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-lux-gold">Contents</p>
              <ol className="flex flex-col border-l border-lux-line">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a
                      href={`#section-${i + 1}`}
                      className="-ml-px block border-l border-transparent py-2 pl-4 text-sm text-lux-muted transition-colors hover:border-lux-gold hover:text-brand-brown"
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0">
            <Reveal>
              <p className="border-l-2 border-lux-gold pl-5 font-heading text-lg leading-relaxed text-brand-brown sm:text-xl">
                {intro}
              </p>
            </Reveal>

            <div className="mt-14 flex flex-col gap-14">
              {sections.map((section, i) => (
                <Reveal key={section.title} as="section">
                  <div id={`section-${i + 1}`} className="scroll-mt-28">
                    <div className="flex items-baseline gap-4 border-b border-lux-line pb-4">
                      <span className="font-display text-3xl italic text-lux-gold">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="text-2xl font-semibold text-brand-brown">{section.title.replace(/^\d+\.\s*/, "")}</h2>
                    </div>
                    <ul className="mt-5 flex flex-col gap-3">
                      {section.content.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 leading-relaxed text-lux-muted">
                          <span className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-lux-gold" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Contact */}
            <Reveal className="mt-16 rounded-3xl border border-lux-line bg-lux-cream p-8 sm:p-10">
              <p className="font-display text-lg italic text-lux-gold">Questions?</p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-brown">มีคำถามเกี่ยวกับนโยบายนี้</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={LINE_OA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="h-4 w-4" /> LINE Official Account
                </a>
                <a
                  href="mailto:hello@datewithsoullove.com"
                  className="inline-flex items-center gap-2 rounded-full border border-lux-line bg-white px-6 py-3 text-sm font-semibold text-brand-brown transition-all hover:-translate-y-0.5 hover:border-brand-brown"
                >
                  <Mail className="h-4 w-4 text-lux-gold" /> hello@datewithsoullove.com
                </a>
              </div>
            </Reveal>

            <Reveal className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
              {related.map((r) => (
                <Link key={r.href} href={r.href} className="text-lux-muted underline-offset-4 transition-colors hover:text-brand-brown hover:underline">
                  {r.label}
                </Link>
              ))}
            </Reveal>
          </article>
        </div>
      </main>
    </>
  );
}
