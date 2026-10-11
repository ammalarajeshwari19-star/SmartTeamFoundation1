import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Code2,
  BookOpen
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900 via-navy-950 to-slate-900 text-white p-8 sm:p-14 lg:p-20 shadow-xl border border-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(14,134,212,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Academic Collaboration
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Form Balanced Project Teams with <span className="text-brand-400">Explainable Skill Matching</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            SmartTeamFoundation helps college students and project coordinators assemble high-performing engineering teams. Our transparent algorithm evaluates technical skills, proficiency levels, domain interests, and availability to eliminate team imbalances.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm shadow-lg shadow-brand-500/20 transition-all hover:translate-y-[-1px]"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold text-white text-sm transition-all"
            >
              Browse Open Projects
            </Link>
          </div>

          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-300">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Explainable Scoring</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">6 Weights</div>
              <div className="text-xs text-slate-400">Multi-Factor Matching</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Real-Time</div>
              <div className="text-xs text-slate-400">Skill Gap Analysis</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Greedy</div>
              <div className="text-xs text-slate-400">Complementary Selection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Algorithm Workflow Section */}
      <section id="algorithm" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            Transparent & Configurable
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How The AI Skill-Matching Engine Works
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Unlike opaque black-box AI tools, SmartTeamFoundation uses a deterministic, explainable multi-attribute scoring model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-slate-800 text-base">Multi-Factor Weighted Scoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzes technical skill overlap (40%), proficiency levels (20%), project interests (15%), role compatibility (10%), experience (10%), and weekly availability (5%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-slate-800 text-base">Dynamic Skill Gap Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates combined skill coverage of existing teammates. Identifies missing requirements and highlights candidates who cover those specific gaps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-slate-800 text-base">Greedy Complementary Formation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Selects balanced cohorts rather than clones with identical skills. Evaluates each candidate's incremental contribution to overall team synergy.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Student Creators and Coordinators
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Everything you need to take an academic or hackathon project from concept to a complete, balanced team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Role & Capacity Enforcement</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strict backend validation ensures team size limits and prevents duplicate memberships or unauthorized modifications.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Search & Teammate Discovery</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Find students by programming languages, frameworks, proficiency, year of study, and minimum weekly availability hours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Interactive Visual Dashboards</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Personalized dashboards track profile completion, project invitations, candidate recommendations, and skill growth suggestions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Secure Authentication</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              JWT sessions, bcrypt password hashing, input sanitization, and database-level constraint integrity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Multi-Database Ready</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ships with zero-config SQLite persistence by default and full MySQL 8.0 support configurable via environment variables.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Invitation & Request Workflows</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Two-way matching workflows allow students to apply with custom pitches, and project owners to send formal invites.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Card */}
      <section className="bg-navy-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 shadow-xl border border-navy-800">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to Build Your Dream Project Team?
        </h3>
        <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
          Create your student profile today, list your skills, and let our matching engine discover the best projects and teammates for you.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-white text-sm shadow-md transition-all"
          >
            Create Your Profile
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold text-white text-sm transition-all"
          >
            Sign In with Demo Account
          </Link>
        </div>
      </section>
    </div>
  );
}
