import { Link } from "react-router-dom";
import {
  ArrowRight,
  TerminalSquare,
  BadgeCheck,
  CheckCircle2,
  BookOpen,
  GitBranch,
  Shield,
  Network,
  Monitor,
  FileText,
  User,
  Heart,
  Cpu,
  Play,
  ExternalLink,
} from "lucide-react";
import { scenarios } from "../data/scenarios";
import { useGame } from "../game/store";

export function WelcomePage() {
  const { progress } = useGame();
  const solvedCount = Object.keys(progress.completedTickets).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-12 pb-24">
      {/* Top Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-12 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
            <TerminalSquare size={14} />
            <span>Welcome to GeeDesk · Practical IT Troubleshooting Simulator</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--color-text)] leading-tight">
            Learn Real IT Support. <br />
            <span className="text-[var(--color-primary)]">By Actually Doing It.</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Welcome to <strong>GeeDesk</strong> — a hands-on technical training and assessment platform
            built to teach authentic diagnostic reasoning. You aren't just memorizing multiple-choice questions here.
            You are stepping into the shoes of an enterprise support technician: investigating live endpoints,
            running terminal commands, formulating testable hypotheses, eliminating causes, and fixing real issues.
          </p>

          {/* Prominent "Get Started" Primary Button */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--color-primary)] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg hover:-translate-y-0.5"
            >
              <Play size={16} className="fill-white" />
              <span>Get Started & Launch Official App</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-3.5 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <span>Explore 40 Incidents</span>
            </Link>

            <Link
              to="/kb"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3.5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              <BookOpen size={15} />
              <span>SOP Knowledge Base</span>
            </Link>
          </div>

          {/* Returning User Progress Badge */}
          {solvedCount > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <CheckCircle2 size={14} className="text-[var(--color-success)]" />
              <span>
                Welcome back! You currently have <strong>{solvedCount} of {scenarios.length}</strong> incidents resolved on this device.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Section 1: What is GeeDesk? */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            About the Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
            What is GeeDesk?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            GeeDesk is an interactive IT support simulator that bridges the gap between academic IT certifications
            and real-world production support.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3 shadow-xs">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <TerminalSquare size={20} />
            </span>
            <h3 className="font-bold text-base text-[var(--color-text)]">It's Not a Quiz</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Forget multiple-choice questions where you guess between A, B, C, or D. In GeeDesk, you type real
              commands like <code className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text)]">ipconfig /all</code>,{" "}
              <code className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text)]">ping</code>, and{" "}
              <code className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text)]">nslookup</code> to uncover what is actually broken.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3 shadow-xs">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <Cpu size={20} />
            </span>
            <h3 className="font-bold text-base text-[var(--color-text)]">Live State Simulation</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Every workstation has real internal state. If you correct a bad DNS server, your next{" "}
              <code className="rounded bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text)]">nslookup</code> command succeeds.
              If you restart a crashed Print Spooler service, the printing queue immediately accepts jobs.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3 shadow-xs">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <GitBranch size={20} />
            </span>
            <h3 className="font-bold text-base text-[var(--color-text)]">CompTIA 7-Step Method</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Technicians must follow the scientific method: identify the symptom, formulate competing theories across
              OSI/TCP layers, test them objectively, eliminate false explanations, cite proof, and verify resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Who Made It & Why (Creator & Inspiration) */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-10 shadow-sm space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Who Made It */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <User size={22} />
              </span>
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  The Creator
                </span>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">George Mwanga</h2>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              GeeDesk was created, architected, and built by <strong>George Mwanga</strong>. As a software engineer
              and IT education advocate, George noticed a critical problem facing students and career-changers:
              they could pass multiple-choice exams like CompTIA A+, Network+, or Security+, but still froze up on their
              first day on the job when confronted with a real, ambiguous ticket.
            </p>

            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              George built GeeDesk as an open, accessible training tool so that anyone, anywhere in the world, can
              practice the exact diagnostic workflows and investigative commands used by professional enterprise IT teams.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com/isitGee/GeeDesk"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink size={12} />
              </a>
              <span className="text-xs text-[var(--color-text-muted)]">Open Source Project</span>
            </div>
          </div>

          {/* Why It Was Made (The Inspiration) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
                <Heart size={22} />
              </span>
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  The Inspiration & Why
                </span>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Bridging the Experience Gap</h2>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              In real enterprise IT operations, <em>nobody gives you four options when a hospital workstation loses network access</em> or an
              accounting department cannot map a critical file share.
            </p>

            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              When a user reports <span className="italic text-[var(--color-text)]">"the internet is down,"</span> the issue could be:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Layer 1: Damaged patch cable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Layer 2: Wrong switchport VLAN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Layer 3: Expired DHCP lease</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Layer 7: Unreachable DNS server</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>Security: 802.1X certificate error</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--color-primary)] font-bold">✓</span>
                <span>OS: Corrupted network stack</span>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-[var(--color-text-secondary)] leading-relaxed pt-1">
              GeeDesk forces you to test each layer systematically, eliminating hypotheses with real evidence before you make changes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The 6-Step Troubleshooting Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            How The Simulator Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
            The Technician Workflow
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Every ticket follows the standard ITIL and CompTIA diagnostic lifecycle.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WorkflowCard
            step="01"
            title="Understand & Scope"
            description="Read the user's initial ticket, check connected asset details (IP, MAC, switchport), and ask targeted clarifying questions to the simulated requester."
          />
          <WorkflowCard
            step="02"
            title="Formulate Hypotheses"
            description="Open the Hypothesis Board to state competing theories across physical cabling, network routing, DNS servers, and operating system services."
          />
          <WorkflowCard
            step="03"
            title="Investigate with Tools"
            description="Run command-line diagnostics (ping, ipconfig, nslookup, netstat, sc, reg, wmic) and inspect Event Viewer, Services, and Active Directory."
          />
          <WorkflowCard
            step="04"
            title="Diagnose & Cite Evidence"
            description="Select your root cause diagnosis and check off the exact corroborating evidence findings that prove your theory. Guessing without evidence is penalized."
          />
          <WorkflowCard
            step="05"
            title="Apply Targeted Fix"
            description="Apply the remediation or perform live interventions (e.g. fix DNS config, restart spooler, unlock AD). Unnecessary actions log efficiency penalties."
          />
          <WorkflowCard
            step="06"
            title="Verify & Document"
            description="Execute verification commands to prove the machine has recovered, log ITIL work notes, and receive an educational evaluation report."
          />
        </div>
      </section>

      {/* Section 4: What's Inside the Platform */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Comprehensive Training Library
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mt-1">
            40 Realistic Scenarios Across 5 Domains
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Network}
            title="Networking (13 Scenarios)"
            description="DHCP exhaustion, DNS misconfigurations, 802.1X PEAP certificates, VLAN misassignments, VPN split tunneling, MTU black holes, ARP conflicts."
          />
          <FeatureCard
            icon={Monitor}
            title="Windows Administration (9 Scenarios)"
            description="Print Spooler Error 1068, corrupted TEMP profiles (.bak registry), Kerberos clock skew GPO failures, CBS SFC repair, WMI repository corruption."
          />
          <FeatureCard
            icon={Shield}
            title="Hardware & Peripherals (7 Scenarios)"
            description="Defective DDR5 RAM BSODs, CPU thermal throttling down to 0.79 GHz, USB-C DP Alt-mode dock mirroring, Cat5e duplex degradation, failing SATA HDDs."
          />
          <FeatureCard
            icon={Shield}
            title="Cybersecurity (5 Scenarios)"
            description="C2 reverse shell beacons, spear-phishing macro attachments, homoglyph domains, rogue scheduled tasks, USB storage DLP policy enforcement."
          />
          <FeatureCard
            icon={FileText}
            title="General Enterprise IT (6 Scenarios)"
            description="Bloated 51GB Outlook OST corruptions, legacy SMBv1 file share deprecation, browser PAC script proxy redirects, OneDrive sync loops."
          />
          <FeatureCard
            icon={BadgeCheck}
            title="100% Free & Local-First"
            description="No account required, no paywalls, zero external tracking. Your progress, attempts, and skill metrics persist safely in your browser's local storage."
          />
        </div>
      </section>

      {/* Big Launch Callout Card */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-surface-muted)] p-8 sm:p-12 text-center shadow-sm space-y-5">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs">
          <TerminalSquare size={28} />
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-text)]">
          Ready to Begin Your First Incident?
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
          Step into the technician workstation. Review incoming user tickets, run diagnostics,
          formulate theories, and test your engineering instincts.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>Get Started — Enter GeeDesk</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-3.5 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <span>View All 40 Tickets</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorkflowCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-black text-[var(--color-primary)]">{step}</span>
        <BadgeCheck size={14} className="text-[var(--color-text-muted)]" />
      </div>
      <h4 className="font-bold text-xs text-[var(--color-text)]">{title}</h4>
      <p className="text-[11.5px] text-[var(--color-text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Network;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]">
          <Icon size={14} />
        </span>
        <h4 className="font-bold text-xs text-[var(--color-text)]">{title}</h4>
      </div>
      <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug">{description}</p>
    </div>
  );
}
