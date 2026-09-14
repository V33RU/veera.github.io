import { useState } from "react";
import { projects, cves, publications } from "@/data/projects";
import { ExternalLink, GraduationCap, Ticket, Mail, Coffee } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MENTORSHIP_EMAIL = "iotsrg1@gmail.com";
const SPONSORSHIP_EMAIL = "iotsrg1@gmail.com";

const mentorshipMailto = `mailto:${MENTORSHIP_EMAIL}?subject=${encodeURIComponent("IoT Security Mentorship Request")}&body=${encodeURIComponent(
  "Hi Veera,\n\n" +
  "Please include the following in your email:\n\n" +
  "1. Full name and country\n" +
  "2. Background (student / self-taught / working pro / researcher)\n" +
  "3. Current experience level (absolute beginner / basics / hardware-curious / hardware-comfortable / pro / researcher)\n" +
  "4. Topics you want to focus on (firmware RE, BLE, fault injection, secure boot, RF, etc.)\n" +
  "5. Specific 3-6 month goal (be concrete: 'find first CVE', 'understand UART well enough to brick less hardware', 'get a job in IoT security')\n" +
  "6. Realistic weekly time commitment (hours per week)\n" +
  "7. Public work / links (GitHub, blog, writeups, CTF profile)\n" +
  "8. Why mentorship from me specifically\n\n" +
  "Replace the lines above with your actual answers and send.\n\n" +
  "Thanks."
)}`;

const sponsorshipMailto = `mailto:${SPONSORSHIP_EMAIL}?subject=${encodeURIComponent("Conference Sponsorship Request")}&body=${encodeURIComponent(
  "Hi Veera,\n\n" +
  "Please include the following in your email:\n\n" +
  "1. Full name, country, background (student / self-taught / pro / researcher)\n" +
  "2. Conference name, URL, and dates\n" +
  "3. Your research / work so far (CTFs, CVEs, blogs, tools, talks, bug bounty, hardware projects). Be specific.\n" +
  "4. What help you need (tickets only)\n" +
  "5. Why you need sponsorship (why this conference matters to you, are you presenting, what changes after attending, why you can't self-fund)\n" +
  "6. What you will give back (writeup, talk recap, open source release, mentoring others, etc.)\n" +
  "7. Public work / links (GitHub, Twitter, blog, CTF profile, talk recordings)\n\n" +
  "Replace the lines above with your actual answers and send.\n\n" +
  "Thanks."
)}`;

const talks = [
  { year: "2026", venue: "Black Hat - India", role: "Arsenal - TCPK Windows thick-client & MSIX audit toolkit." },
  { year: "2025", venue: "BSides Bangalore", role: "Hardware & IoT village lead." },
  { year: "2024", venue: "BSides Dehradun", role: "Keynote on open-source hardware security tooling in India." },
  { year: "2023", venue: "cocon", role: "Workshop on UART, SWD, and JTAG for the paranoid." },
  { year: "2023", venue: "VulnCon", role: "Talk on the anatomy of a BLE stack buffer overflow." },
  { year: "2022", venue: "CraCCon", role: "Talk on radio protocol reverse engineering with SDR." },
  { year: "Rec.", venue: "Null / OWASP chapters", role: "Recurring workshops on IoT, firmware, and mobile security." },
];

const socials = [
  { label: "GitHub", url: "https://github.com/v33ru", role: "Code" },
  { label: "X - @v33riot", url: "https://x.com/v33riot", role: "Signal" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/veeraiot", role: "Work" },
  { label: "Medium", url: "https://medium.com/@veerababupenugonda", role: "Writing" },
  { label: "ORCID", url: "https://orcid.org/0009-0007-9342-6957", role: "Research" },
  { label: "Sessionize", url: "https://sessionize.com/veerababu-penugonda/", role: "Talks" },
];

const programs = [
  { label: "iotsrg1@gmail.com", url: "mailto:iotsrg1@gmail.com", role: "Email" },
  { label: "HackerOne", url: "https://hackerone.com/mr-iot", role: "Bounty" },
  { label: "Bugcrowd", url: "https://bugcrowd.com/h/V33RU_Mr-IoT", role: "Bounty" },
  { label: "OpenBugBounty", url: "https://www.openbugbounty.org/researchers/Mr-IoT/", role: "Bounty" },
  { label: "Buy me a coffee", url: "https://buymeacoffee.com/v33ru", role: "Support" },
];

const SectionHead = ({ title, note }: { title: string; note?: string }) => (
  <div className="flex items-baseline justify-between gap-4 pb-3 mb-8 border-b border-[hsl(var(--rule))]">
    <h2 className="section-title">{title}</h2>
    {note && <span className="section-note">{note}</span>}
  </div>
);

const Home = () => {
  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const [sponsorshipOpen, setSponsorshipOpen] = useState(false);
  const [coffeeOpen, setCoffeeOpen] = useState(false);

  const featured = cves[0];
  const restCves = cves.slice(1);

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12 md:py-16">
      {/* Lede */}
      <section className="mb-20">
        <p className="eyebrow mb-5 flex items-center gap-3">
          <span className="w-5 h-px bg-[hsl(var(--rule-strong))] inline-block" />
          Hardware &amp; IoT Security Research / Since 2017
        </p>
        <h1 className="text-[38px] md:text-[54px] leading-[1.05] tracking-[-0.022em] font-medium text-[hsl(var(--ink))] mb-7 max-w-3xl text-balance">
          I break embedded devices, then{" "}
          <em className="not-italic text-[hsl(var(--signature))] font-normal">publish the exact byte that mattered.</em>
        </h1>
        <p className="text-[19px] md:text-[21px] text-[hsl(var(--ink-muted))] leading-snug max-w-2xl mb-8 italic">
          Independent research on Bluetooth, radio, and firmware attack surfaces - and the tools I ship along the way.
        </p>
        <div className="max-w-2xl space-y-4 text-[17px] leading-[1.65] text-[hsl(var(--ink-2))]">
          <p>
            Founder of{" "}
            <a href="https://iotsrg.org" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--signature))] signature-underline">
              IoTSRG
            </a>
            , an active community for hardware and IoT security research in India since 2017. My work targets emerging attack surfaces - hardware microprobing, protocol fuzzing, and the BLE and radio stacks that ship inside medical devices, meters, and consumer wearables. Everything I publish stays free.
          </p>
          <p>
            I speak, train, and disclose. Keynote sessions, workshops, and villages at Black Hat India, BSides Bangalore, BSides Dehradun, cocon, VulnCon, CraCCon, and the Null / OWASP chapters. When I&rsquo;m not hunting for vulnerabilities, I&rsquo;m coding new automation frameworks to hunt them faster.
          </p>
        </div>
      </section>

      {/* Now */}
      <aside className="mb-20 px-6 py-5 bg-[hsl(var(--paper-2))] border-l-2 border-[hsl(var(--signature))]" aria-labelledby="now-h">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span id="now-h" className="eyebrow text-[hsl(var(--signature))]">Now</span>
          <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))]">Updated {new Date().getFullYear()}</span>
        </div>
        <div className="space-y-2 text-[16px] leading-[1.6] text-[hsl(var(--ink-2))]">
          <p>
            Preparing <em className="text-[hsl(var(--ink))]">TCPK</em> for its Black Hat Arsenal debut in India - a Windows thick-client and MSIX audit toolkit with static, runtime, and IL analysis in one loop.
          </p>
          <p>
            Following up on Nordic&rsquo;s BLE CGMS disclosure ({" "}
            <a href="#recent" className="text-[hsl(var(--signature))] signature-underline">CVE-2026-14297</a>
            {" "}) and quietly hunting the same shape of bug elsewhere in the medical-device BLE surface.
          </p>
          <p>
            Writing the next installment of <em className="text-[hsl(var(--ink))]">Field Notes</em> on UART discovery workflows using <em className="text-[hsl(var(--ink))]">BaudOwl</em>.
          </p>
        </div>
      </aside>

      {/* Recent CVE */}
      {featured && (
        <section id="recent" className="mb-20">
          <SectionHead title="Recent / Disclosure" note={`Filed ${featured.year}`} />
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[15px] font-medium text-[hsl(var(--signature))] signature-underline tracking-tight"
            >
              {featured.id}
            </a>
            <span className="mono text-[11px] uppercase tracking-widest text-[hsl(var(--ink-muted))]">
              {featured.issuer}
            </span>
          </div>
          <h3 className="text-[24px] md:text-[30px] leading-[1.2] tracking-tight font-medium text-[hsl(var(--ink))] mb-4 max-w-2xl text-balance">
            A 20-byte buffer, and every peer with an ATT_MTU above 23.
          </h3>
          <p className="text-[17.5px] leading-[1.65] text-[hsl(var(--ink-2))] max-w-2xl mb-4">
            A blood-glucose monitoring service on Nordic&rsquo;s nRF Connect SDK, the world&rsquo;s most widely shipped BLE stack, accepted the full attacker-controlled ATT payload and copied it straight into a fixed 20-byte BSS buffer. Any byte past the twentieth landed on whatever the linker had placed next: padding, a mutex, occasionally a callable function pointer.
          </p>
          <pre className="mono text-[13px] leading-[1.7] bg-[hsl(var(--paper-2))] border border-[hsl(var(--rule))] rounded-sm px-5 py-4 overflow-x-auto max-w-2xl mb-4 text-[hsl(var(--ink))]">
{`// cgms_racp.c, req_buf is a static 20-byte array
memcpy(req_buf, req_data, req_len);
//                          ^
//     up to ATT_MTU, no length check`}
          </pre>
          <p className="text-[17.5px] leading-[1.65] text-[hsl(var(--ink-2))] max-w-2xl mb-5">
            The fix is one length check, applied at the ATT layer before any data is processed. It shipped in v3.3.1 as commit{" "}
            <code className="mono text-[13px] text-[hsl(var(--signature))]">0684d602</code>. Reported through Nordic PSIRT.
          </p>
          <p className="text-[14px] text-[hsl(var(--ink-muted))]">
            {featured.description}
          </p>
        </section>
      )}

      {/* Selected work */}
      <section id="work" className="mb-20">
        <SectionHead title="Selected work / Open source" note={`${projects.length} tools`} />
        <ol className="list-none p-0 m-0">
          {projects.map((p, i) => (
            <li key={p.name} className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-1 py-5 border-b border-[hsl(var(--rule))]">
              <h3 className="text-[20px] leading-tight font-medium tracking-tight flex items-baseline gap-3 min-w-0">
                <span className="mono text-[11px] font-medium tracking-wider text-[hsl(var(--ink-dim))] w-6 shrink-0 pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors inline-flex items-baseline gap-1.5 min-w-0"
                  >
                    <span className="truncate">{p.name}</span>
                    <ExternalLink size={12} className="text-[hsl(var(--ink-dim))] shrink-0" />
                  </a>
                ) : (
                  <span>{p.name}</span>
                )}
              </h3>
              <span className="mono text-[12px] text-[hsl(var(--ink-muted))] tracking-wider whitespace-nowrap self-baseline">
                {p.year}
              </span>
              <p className="col-span-2 pl-9 text-[15.5px] leading-[1.55] text-[hsl(var(--ink-muted))] max-w-3xl">
                {p.description}
              </p>
              {p.showcase && (
                <p className="col-span-2 pl-9 mono text-[11px] tracking-wider text-[hsl(var(--signature))] mt-1">
                  &diams; {p.showcase}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* CVEs */}
      <section id="cves" className="mb-20">
        <SectionHead title="CVE / Advisories" note={`${cves.length} filed`} />
        <ul className="list-none p-0 m-0">
          {[featured, ...restCves].filter(Boolean).map((cve) => (
            <li key={cve.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 border-b border-[hsl(var(--rule))] items-baseline">
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline min-w-0">
                <a
                  href={cve.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[14px] font-medium text-[hsl(var(--signature))] signature-underline tracking-tight"
                >
                  {cve.id}
                </a>
                <span className="italic text-[15px] text-[hsl(var(--ink))] font-medium">{cve.issuer}</span>
              </div>
              <span className="mono text-[11px] uppercase tracking-widest text-[hsl(var(--ink-muted))] justify-self-end">
                {cve.year}
              </span>
              {cve.description && (
                <p className="col-span-2 text-[15px] leading-[1.55] text-[hsl(var(--ink-muted))] max-w-3xl">
                  {cve.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Writing */}
      <section id="writing" className="mb-20">
        <SectionHead title="Writing" note="Feature pieces" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {publications.map((pub) => (
            <a
              key={pub.title}
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-5 border-b border-[hsl(var(--rule))] block group"
            >
              <p className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))] mb-1.5">
                {pub.publishedIn} / {pub.year}
              </p>
              <h3 className="text-[18px] leading-[1.3] font-medium tracking-tight text-[hsl(var(--ink))] group-hover:text-[hsl(var(--signature))] transition-colors">
                {pub.title}
              </h3>
            </a>
          ))}
        </div>
      </section>

      {/* Speaking */}
      <section id="speaking" className="mb-20">
        <SectionHead title="Speaking &amp; Villages" note="Recent stages" />
        <ul className="list-none p-0 m-0">
          {talks.map((t, i) => (
            <li
              key={i}
              className="grid grid-cols-[5rem_1fr] gap-5 py-3.5 border-b border-dashed border-[hsl(var(--rule))]"
            >
              <span className="mono text-[12px] text-[hsl(var(--ink-dim))] tracking-wider self-baseline">
                {t.year}
              </span>
              <div>
                <span className="block text-[16.5px] font-medium tracking-tight text-[hsl(var(--ink))]">
                  {t.venue}
                </span>
                <span className="block italic text-[14.5px] text-[hsl(var(--ink-muted))] leading-[1.5]">
                  {t.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section id="contact" className="mb-16">
        <SectionHead title="Follow / Contact" note="Programs &amp; social" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
          <div>
            <p className="eyebrow mb-3">Follow</p>
            <ul className="list-none p-0 m-0 space-y-2">
              {socials.map((s) => (
                <li key={s.label} className="flex items-baseline justify-between gap-4">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors"
                  >
                    {s.label}
                  </a>
                  <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-dim))]">
                    {s.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Programs</p>
            <ul className="list-none p-0 m-0 space-y-2">
              {programs.map((p) => (
                <li key={p.label} className="flex items-baseline justify-between gap-4">
                  <a
                    href={p.url}
                    target={p.url.startsWith("mailto:") ? undefined : "_blank"}
                    rel={p.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="text-[15px] text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors"
                  >
                    {p.label}
                  </a>
                  <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-dim))]">
                    {p.role}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setMentorshipOpen(true)}
                  className="text-[15px] text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors text-left"
                >
                  Mentorship request
                </button>
                <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-dim))]">Email</span>
              </li>
              <li className="flex items-baseline justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSponsorshipOpen(true)}
                  className="text-[15px] text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors text-left"
                >
                  Conference sponsorship
                </button>
                <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-dim))]">Email</span>
              </li>
              <li className="flex items-baseline justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCoffeeOpen(true)}
                  className="text-[15px] text-[hsl(var(--ink))] hover:text-[hsl(var(--signature))] transition-colors text-left"
                >
                  Support the work
                </button>
                <span className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-dim))]">Coffee</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mentorship dialog */}
      <Dialog open={mentorshipOpen} onOpenChange={setMentorshipOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--ink))]">
              <GraduationCap size={20} /> IoT Security Mentorship
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--ink-2))]">
              I mentor a small number of people each cycle. Drop me an email with the details below and I will read it personally.
            </DialogDescription>
          </DialogHeader>
          <a
            href={mentorshipMailto}
            className="inline-flex items-center gap-3 px-5 py-3 border border-[hsl(var(--signature))] bg-[hsl(var(--signature)/0.05)] hover:bg-[hsl(var(--signature)/0.12)] transition-colors self-start"
          >
            <GraduationCap size={18} className="text-[hsl(var(--signature))]" />
            <span className="text-[14px] font-medium">Email mentorship request</span>
            <Mail size={14} className="text-[hsl(var(--signature))]/60" />
          </a>
          <p className="text-[11px] text-[hsl(var(--ink-muted))]">Opens your mail client with a pre-filled template to {MENTORSHIP_EMAIL}.</p>
        </DialogContent>
      </Dialog>

      {/* Coffee dialog */}
      <Dialog open={coffeeOpen} onOpenChange={setCoffeeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--ink))]">
              <Coffee size={20} /> Support the work
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--ink-2))]">
              Everything on this site is free and stays free. If it has helped you, fueling the next round of work is the cleanest way to give back.
            </DialogDescription>
          </DialogHeader>
          <a
            href="https://buymeacoffee.com/v33ru"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 border border-[hsl(var(--signature))] bg-[hsl(var(--signature)/0.05)] hover:bg-[hsl(var(--signature)/0.12)] transition-colors self-start"
          >
            <Coffee size={18} className="text-[hsl(var(--signature))]" />
            <span className="text-[14px] font-medium">Buy me a coffee</span>
            <ExternalLink size={14} className="text-[hsl(var(--signature))]/60" />
          </a>
        </DialogContent>
      </Dialog>

      {/* Sponsorship dialog */}
      <Dialog open={sponsorshipOpen} onOpenChange={setSponsorshipOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--ink))]">
              <Ticket size={20} /> Conference sponsorship
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--ink-2))]">
              Need sponsorship to attend or present at a security conference? Drop me an email with the details below.
            </DialogDescription>
          </DialogHeader>
          <a
            href={sponsorshipMailto}
            className="inline-flex items-center gap-3 px-5 py-3 border border-[hsl(var(--signature))] bg-[hsl(var(--signature)/0.05)] hover:bg-[hsl(var(--signature)/0.12)] transition-colors self-start"
          >
            <Ticket size={18} className="text-[hsl(var(--signature))]" />
            <span className="text-[14px] font-medium">Email sponsorship request</span>
            <Mail size={14} className="text-[hsl(var(--signature))]/60" />
          </a>
          <p className="text-[11px] text-[hsl(var(--ink-muted))]">Opens your mail client with a pre-filled template to {SPONSORSHIP_EMAIL}.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
