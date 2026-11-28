import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Lock, 
  Users, 
  Globe2, 
  Server, 
  Scale 
} from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { authService } from '../../services/authService';

export function AboutPage() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const u = await authService.getCurrentUser();
        if (isMounted) setCurrentUser(u);
      } catch {
        // Guest mode
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const launchCtaLink = currentUser ? '/dashboard' : '/login';
  const launchCtaText = currentUser ? 'Open Dashboard Workspace' : 'Launch Platform';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#102B46] font-sans selection:bg-[#247C78]/20">
      {/* Public Top Navbar */}
      <PublicNavbar />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#0F2942] via-[#102B46] to-[#153450] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#2DD4BF] text-xs font-semibold backdrop-blur-sm">
            <span>Methodology & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            About NIRNAY Decision Platform
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminating guesswork in enterprise cloud migration through empirical decision modeling, 
            multi-criteria weighted scoring, and PostgreSQL kernel-level multi-tenancy.
          </p>
        </div>
      </section>

      {/* The Enterprise Challenge Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#DCE5EA] shadow-sm space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#247C78]">The Problem Space</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B46] tracking-tight">
            Why Traditional Cloud Transformations Fail
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              According to enterprise industry audits, over 70% of legacy modernization initiatives overrun budgets or 
              deliver suboptimal ROI due to subjective vendor pitch decks, unquantified data loss liabilities, and lack of 
              stage-gate implementation roadmaps.
            </p>
            <p>
              NIRNAY replaces vendor bias with a verifiable, mathematically grounded decision engine. By evaluating 
              organizational readiness across Technology, Organization, and Environment (TOE) dimensions, enterprises gain 
              board-ready justifications for multi-SaaS adoption.
            </p>
          </div>
        </div>
      </section>

      {/* The TOE Framework Deep Dive */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#247C78]/10 text-[#247C78] text-xs font-bold uppercase tracking-wider border border-[#247C78]/20">
            Theoretical Foundation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B46] tracking-tight">
            The Technology-Organization-Environment (TOE) Framework
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Rooted in the Tornatzky &amp; Fleischer innovation adoption model, NIRNAY computes an overall 
            composite readiness score using strict normalized weights:
          </p>
          <div className="p-3 bg-white rounded-xl border border-[#DCE5EA] inline-block font-mono text-xs font-bold text-[#102B46] shadow-sm">
            Readiness Score = 0.40 · S(Tech) + 0.35 · S(Org) + 0.25 · S(Env)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dimension 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE5EA] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-[#247C78]">40% Weight</span>
              </div>
              <h3 className="text-base font-bold text-[#102B46]">Technological Context</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates existing infrastructure maturity, integration architecture complexity, custom database scale, 
                and legacy monolith density.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Monolith Inventory Audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>API & Middleware Readiness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Custom DB Scalability Penalty</span>
                </li>
              </ul>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#247C78] h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Dimension 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE5EA] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#247C78] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-[#247C78]">35% Weight</span>
              </div>
              <h3 className="text-base font-bold text-[#102B46]">Organizational Context</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Measures internal change appetite, executive leadership mandates, workforce cloud competencies, 
                and annual cloud migration budget allocation.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Executive Sponsorship Index</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Staff Cloud Proficiency Rating</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Budget Adequacy Ratio</span>
                </li>
              </ul>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#247C78] h-full rounded-full" style={{ width: '35%' }} />
            </div>
          </div>

          {/* Dimension 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE5EA] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Globe2 className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-[#247C78]">25% Weight</span>
              </div>
              <h3 className="text-base font-bold text-[#102B46]">Environmental Context</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Analyzes external constraints, regulatory governance regimes (GDPR, HIPAA, SOC 2), industry competitive 
                velocity, and partner ecosystem integration demands.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Regulatory Compliance Strictness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Industry Cloud Velocity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#247C78]" />
                  <span>Vendor Neutrality Safeguards</span>
                </li>
              </ul>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#247C78] h-full rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Engineering Innovations */}
      <section className="bg-white border-y border-[#DCE5EA] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#247C78]">Technical Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B46] tracking-tight">
              Architecture & Security Highlights
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Built on production-grade cloud standards designed for high-concurrency enterprise decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#102B46] text-white flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#102B46]">React 18 + Vite</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-second hot-module replacement, production bundle under 320 KB gzip, and 77 automated unit and integration tests.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#247C78] text-white flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#102B46]">Supabase PostgreSQL</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kernel-level Row-Level Security (RLS) guaranteeing strict multi-tenant isolation bound to authenticated JWT tokens.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#147D73] text-white flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#102B46]">MCDA Decision Engines</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-criteria weighted scoring across Cost, Security, Scalability, Integration, and Features with sensitivity sliders.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F2942] text-white flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#102B46]">Legacy SAP Evolution</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transformed from a proprietary SAP CAP / SAPUI5 prototype (`legacy-sap/`) into a modern, vendor-neutral web architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Project Credits */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4">
        <h3 className="text-lg font-bold text-[#102B46]">Academic Project Context</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Developed as part of the <strong>E1CSA313 / E1ITA306 Design Project - I</strong> at Alliance University.
        </p>
        <div className="p-4 rounded-xl bg-white border border-[#DCE5EA] inline-block text-xs text-slate-700 shadow-sm space-y-1">
          <p><span className="font-semibold text-[#102B46]">Faculty Mentor:</span> Dr. T Prashant</p>
          <p><span className="font-semibold text-[#102B46]">Team Members:</span> Rishi Kumar, Aarushi Joshi, Pradyumn Bisen, Akshayadevi K</p>
        </div>
      </section>

      {/* Launch CTA */}
      <section className="bg-gradient-to-r from-[#0F2942] to-[#153450] text-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to evaluate your enterprise stack?</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Sign in to access your organization workspace, conduct a 5-step TOE assessment, and generate migration roadmaps.
          </p>
          <div>
            <Link
              to={launchCtaLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#247C78] hover:bg-[#1D6864] text-white font-bold text-sm shadow-xl shadow-[#247C78]/30 transition-all hover:scale-105"
            >
              <span>{launchCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1E32] text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#247C78] flex items-center justify-center text-white font-extrabold text-xs">
              N
            </div>
            <span className="font-bold text-white text-xs">NIRNAY · Enterprise SaaS Transformation Platform</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white font-semibold">About</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
