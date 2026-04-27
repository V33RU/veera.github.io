import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypingText from "@/components/TypingText";
import SilkscreenLabel from "@/components/SilkscreenLabel";
import { projects, domains, publications } from "@/data/projects";
import { Badge } from "@/components/ui/badge";
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
  "4. What help you need (ticket only)\n" +
  "5. Why you need sponsorship (why this conference matters to you, are you presenting, what changes after attending, why you can't self-fund)\n" +
  "6. What you will give back (writeup, talk recap, open source release, mentoring others, etc.)\n" +
  "7. Public work / links (GitHub, Twitter, blog, CTF profile, talk recordings)\n\n" +
  "Replace the lines above with your actual answers and send.\n\n" +
  "Thanks."
)}`;

const Home = () => {
  const [showContent, setShowContent] = useState(false);
  const [mentorshipOpen, setMentorshipOpen] = useState(false);
  const [sponsorshipOpen, setSponsorshipOpen] = useState(false);
  const [coffeeOpen, setCoffeeOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 crt-flicker">
      {/* Hero */}
      <section className="mb-16">
        <SilkscreenLabel designator="U1" label="identity" />
        <h1 className="text-3xl md:text-5xl font-bold phosphor-glow mb-4 text-primary leading-tight">
          <TypingText 
            text="Mr-IoT" 
            speed={100} 
            onComplete={() => setShowContent(true)}
          />
        </h1>
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-foreground text-lg mb-2">
                IoT Security Researcher | Hardware Breaker | Community Builder
              </p>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Turning zero-clicks into open-source arsenals. Breaking, building, and securing 
                embedded tech while fueling the rise of research through <span className="text-primary">IoTSRG</span>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Connect + Profile Image */}
      <AnimatePresence>
        {showContent && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <SilkscreenLabel designator="J1" label="connect --social" className="mb-4" />

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Net labels */}
              <div className="space-y-1 flex-1">
                {([
                  { label: "X", url: "https://x.com/v33riot", netColor: "hsl(0 70% 55%)" },
                  { label: "LINKEDIN", url: "https://www.linkedin.com/in/veeraiot", netColor: "hsl(220 70% 55%)" },
                  { label: "GITHUB", url: "https://github.com/v33ru", netColor: "hsl(120 50% 45%)" },
                  { label: "MEDIUM", url: "https://medium.com/@veerababupenugonda", netColor: "hsl(45 90% 55%)" },
                  { label: "COFFEE", onClick: () => setCoffeeOpen(true), netColor: "hsl(280 60% 55%)" },
                  { label: "MENTORSHIP", onClick: () => setMentorshipOpen(true), netColor: "hsl(170 70% 45%)" },
                  { label: "CONFERENCE", onClick: () => setSponsorshipOpen(true), netColor: "hsl(35 90% 55%)" },
                ] as Array<{ label: string; netColor: string; url?: string; onClick?: () => void }>).map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.url}
                    onClick={link.onClick ? (e) => { e.preventDefault(); link.onClick!(); } : undefined}
                    target={link.url ? "_blank" : undefined}
                    rel={link.url ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group flex items-center gap-0 py-[5px] cursor-pointer"
                  >
                    {/* Net label arrow */}
                    <div className="flex items-center shrink-0">
                      <svg width="14" height="20" viewBox="0 0 14 20" className="shrink-0">
                        <polygon
                          points="0,2 10,2 14,10 10,18 0,18"
                          fill="none"
                          stroke={link.netColor}
                          strokeWidth="1.5"
                          className="transition-all duration-300 group-hover:fill-current"
                          style={{ fill: 'transparent' }}
                        />
                        <polygon
                          points="0,2 10,2 14,10 10,18 0,18"
                          className="transition-all duration-300 opacity-0 group-hover:opacity-20"
                          style={{ fill: link.netColor }}
                        />
                      </svg>
                    </div>

                    {/* Net name label */}
                    <div
                      className="px-2 py-[2px] border-y border-r text-[11px] font-bold tracking-[0.2em] transition-colors duration-300"
                      style={{
                        borderColor: link.netColor,
                        color: link.netColor,
                      }}
                    >
                      {link.label}
                    </div>

                    {/* Trace line */}
                    <div className="flex items-center flex-1 max-w-[160px] mx-2">
                      <div
                        className="h-[1.5px] flex-1 transition-all duration-300 group-hover:h-[2.5px]"
                        style={{
                          background: `linear-gradient(90deg, ${link.netColor}, ${link.netColor}40)`,
                          boxShadow: `0 0 4px ${link.netColor}40`,
                        }}
                      />
                      {/* Junction dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0 transition-shadow duration-300 group-hover:shadow-[0_0_8px_2px]"
                        style={{
                          backgroundColor: link.netColor,
                          boxShadow: `0 0 3px ${link.netColor}60`,
                        }}
                      />
                    </div>

                    {/* Destination indicator */}
                    <span className="text-muted-foreground text-[10px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      → OPEN
                    </span>
                  </motion.a>
                ))}
              </div>

              {/* Profile image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 w-[200px] h-[200px] md:w-[220px] md:h-[220px] rounded border border-border bg-card overflow-hidden relative self-center md:self-start"
              >
                <img
                  src="/veera.webp"
                  alt="Mr-IoT"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                  <div className="text-center">
                    <div className="text-3xl mb-1">⬡</div>
                    <p className="text-[9px] tracking-widest uppercase">Profile</p>
                  </div>
                </div>
                {/* Corner traces */}
                <div className="absolute top-0 left-0 w-4 h-[2px] bg-primary/30" />
                <div className="absolute top-0 left-0 h-4 w-[2px] bg-primary/30" />
                <div className="absolute bottom-0 right-0 w-4 h-[2px] bg-primary/30" />
                <div className="absolute bottom-0 right-0 h-4 w-[2px] bg-primary/30" />
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Mentorship dialog */}
      <Dialog open={mentorshipOpen} onOpenChange={setMentorshipOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <GraduationCap size={20} />
              IoT Security Mentorship
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              I mentor a small number of people each cycle who are serious about IoT and hardware security. Drop me an email with the details below and I will read it personally.
            </DialogDescription>
          </DialogHeader>
          <div className="text-muted-foreground text-xs space-y-1">
            <p className="text-foreground/80 font-medium">Include in your email:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Name, country, background (student / self-taught / pro / researcher)</li>
              <li>Current experience level with security and hardware</li>
              <li>Topics you want to focus on (firmware RE, BLE, fault injection, secure boot, RF...)</li>
              <li>Specific 3-6 month goal, be concrete</li>
              <li>Realistic weekly time commitment</li>
              <li>Public work links (GitHub, blog, writeups, CTF profile)</li>
              <li>Why mentorship from me specifically</li>
            </ul>
          </div>
          <a
            href={mentorshipMailto}
            className="group inline-flex items-center gap-3 px-5 py-3 rounded border border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary transition-all self-start"
          >
            <GraduationCap size={18} className="text-primary" />
            <span className="text-foreground font-medium text-sm">Email Mentorship Request</span>
            <Mail size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
          </a>
          <p className="text-[10px] text-muted-foreground/60">
            Opens your email client with a pre-filled template to {MENTORSHIP_EMAIL}.
          </p>
        </DialogContent>
      </Dialog>

      {/* Coffee / Support dialog */}
      <Dialog open={coffeeOpen} onOpenChange={setCoffeeOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Coffee size={20} />
              Support the Work
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Everything on this site is free and stays free. If it has helped you, fueling the next round of work is the cleanest way to give back.
            </DialogDescription>
          </DialogHeader>
          <div className="text-muted-foreground text-xs space-y-1">
            <p className="text-foreground/80 font-medium">Your support directly funds:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Hosting and travel for IoT and hardware security <span className="text-foreground/80">meetups</span> in India</li>
              <li>Buying target hardware to tear down for new <span className="text-foreground/80">deep technical blogs</span></li>
              <li>Lab gear (logic analyzers, glitchers, SDRs, dev kits) for original research</li>
              <li>Time to write longer-form <span className="text-foreground/80">publications</span> in Hakin9, PenTest Magazine, and similar outlets</li>
              <li>Open source tools released for the community (HardenCheck, etc.)</li>
            </ul>
          </div>
          <a
            href="https://buymeacoffee.com/v33ru"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-5 py-3 rounded border border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary transition-all self-start"
          >
            <Coffee size={18} className="text-primary" />
            <span className="text-foreground font-medium text-sm">Buy Me a Coffee</span>
            <ExternalLink size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
          </a>
          <p className="text-[10px] text-muted-foreground/60">
            Opens buymeacoffee.com/v33ru in a new tab. Any amount helps. No subscription pressure.
          </p>
        </DialogContent>
      </Dialog>

      {/* Conference Sponsorship dialog */}
      <Dialog open={sponsorshipOpen} onOpenChange={setSponsorshipOpen}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Ticket size={20} />
              Conference Sponsorship
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Need sponsorship to attend or present at a security conference? Drop me an email with the details below and I will review it personally.
            </DialogDescription>
          </DialogHeader>
          <div className="text-muted-foreground text-xs space-y-1">
            <p className="text-foreground/80 font-medium">Include in your email:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Name, country, background</li>
              <li>Conference name, URL, and dates</li>
              <li>Your research / work so far (CTFs, CVEs, blogs, tools, talks, bug bounty, hardware projects). Be specific.</li>
              <li>What help you need (ticket / training pass / travel / accommodation / visa letter)</li>
              <li>Why you need sponsorship and why this conference matters to you</li>
              <li>Public work links (GitHub, Twitter, blog, CTF profile)</li>
            </ul>
          </div>
          <a
            href={sponsorshipMailto}
            className="group inline-flex items-center gap-3 px-5 py-3 rounded border border-primary/40 bg-primary/5 hover:bg-primary/15 hover:border-primary transition-all self-start"
          >
            <Ticket size={18} className="text-primary" />
            <span className="text-foreground font-medium text-sm">Email Sponsorship Request</span>
            <Mail size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
          </a>
          <p className="text-[10px] text-muted-foreground/60">
            Opens your email client with a pre-filled template to {SPONSORSHIP_EMAIL}.
          </p>
        </DialogContent>
      </Dialog>

      {/* Projects */}
      {showContent && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <SilkscreenLabel designator="U2" label="projects" />
          <div className="circuit-border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-2 text-primary text-xs font-medium">PROJECT</th>
                    <th className="text-left px-4 py-2 text-primary text-xs font-medium">YEAR</th>
                    <th className="text-left px-4 py-2 text-primary text-xs font-medium">STATUS</th>
                    <th className="text-left px-4 py-2 text-primary text-xs font-medium">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p.name} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2 text-foreground font-medium">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-1">
                            {p.name} <ExternalLink size={12} className="text-primary/50" />
                          </a>
                        ) : p.name}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{p.year}</td>
                      <td className="px-4 py-2">
                        <Badge variant={p.track === "Active" ? "default" : "secondary"} className="text-xs">
                          {p.track}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      )}

      {/* Domains of Destruction */}
      {showContent && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <SilkscreenLabel designator="R1" label="domains of destruction" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {domains.map((d, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2 rounded bg-secondary/20 border border-border/50">
                <div className="solder-point mt-1 shrink-0" />
                <span className="text-sm text-foreground">{d}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Publications */}
      {showContent && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <SilkscreenLabel designator="C1" label="publications" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {publications.map((pub, i) => (
              <a
                key={i}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col chip-card rounded overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="w-full h-40 bg-secondary/30 overflow-hidden flex items-center justify-center relative">
                  {pub.cover ? (
                    <img
                      src={pub.cover}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/40 p-4 text-center">
                      <div className="text-4xl">📄</div>
                      <p className="text-[10px] tracking-widest uppercase">Cover unavailable</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-xs flex items-center gap-1">
                      <ExternalLink size={11} /> View Publication
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-foreground text-xs font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {pub.title}
                  </p>
                  <p className="text-muted-foreground text-[10px] mt-1">
                    {pub.publishedIn} • {pub.year}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {/* Collab */}
      {showContent && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-8 border border-border rounded p-6 bg-secondary/10"
        >
          <SilkscreenLabel designator="TP1" label="collab" className="mb-2" />
          <p className="text-foreground text-sm">
            If you're a hacker, conference organizer, community builder, hardware vendor, or FOSS believer — 
            let's build something disruptive together. Open for research collabs, village setups, training sessions, or tool drops.
          </p>
        </motion.section>
      )}
    </div>
  );
};

export default Home;
