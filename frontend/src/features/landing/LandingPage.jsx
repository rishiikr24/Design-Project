import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  CheckCircle2, 
  FileText, 
  GitBranch, 
  Layers, 
  MessageSquareCode, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { PublicNavbar } from './PublicNavbar';
import { authService } from '../../services/authService';

export function LandingPage() {
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

  const primaryCtaLink = currentUser ? '/dashboard' : '/login';
  const primaryCtaText = currentUser ? 'Enter Dashboard' : 'Get Started / Sign In';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#102B46] font-sans selection:bg-[#247C78]/20">
      {/* Public Top Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2942] via-[#102B46] to-[#153450] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Geometric Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-[#247C78] blur-3xl" />
          <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#2DD4BF] blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#2DD4BF] text-xs font-semibold backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alliance University Design Project · Cloud Decision-Support System</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Data-Driven Enterprise SaaS Readiness, Evaluation & Migration Intelligence
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-200 font-normal leading-relaxed">
            NIRNAY empowers enterprise architects and executive leadership to scientifically evaluate multi-SaaS 
            alternatives, deconstruct legacy on-premise monoliths, and execute structured 8-phase transformation roadmaps 
            with empirical rigor.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              to={primaryCtaLink}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#247C78] hover:bg-[#1D6864] text-white font-bold text-sm transition-all shadow-lg shadow-[#247C78]/40 hover:shadow-xl hover:shadow-[#247C78]/50 flex items-center justify-center gap-2.5 group"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Learn About NIRNAY</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>

          {/* Metrics Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-[#2DD4BF]">40-35-25%</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">TOE Weighted Framework</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-[#2DD4BF]">10 Solutions</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">Curated SaaS Benchmarks</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-[#2DD4BF]">8 Phases</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">Stage-Gate Execution Roadmap</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-[#2DD4BF]">Kernel RLS</div>
              <div className="text-xs text-slate-300 mt-1 font-medium">PostgreSQL Multi-Tenancy</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step "How It Works" Workflow Strip */}
      <section className="bg-white border-y border-[#DCE5EA] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#247C78]">Transformation Lifecycle</h2>
            <p className="text-xl sm:text-2xl font-bold text-[#102B46] mt-1">From Monolith Audit to Live Cloud Operation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="relative p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] hover:border-[#247C78]/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#102B46] text-white font-extrabold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h3 className="font-bold text-sm text-[#102B46]">Assess</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Catalog legacy monoliths and evaluate organizational readiness across Technological, Organizational, and Environmental dimensions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] hover:border-[#247C78]/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#247C78] text-white font-extrabold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h3 className="font-bold text-sm text-[#102B46]">Evaluate</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Execute Multi-Criteria Decision Analysis (MCDA) across Cost, Security, Scalability, Integration, and Feature completeness.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] hover:border-[#247C78]/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#147D73] text-white font-extrabold text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h3 className="font-bold text-sm text-[#102B46]">De-Risk</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Map vulnerabilities onto a dynamic 5×5 exposure matrix to calculate elevated data-loss and integration failure mitigations.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative p-5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EA] hover:border-[#247C78]/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#0F2942] text-white font-extrabold text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h3 className="font-bold text-sm text-[#102B46]">Migrate</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Track sequential cutovers across 8 standardized implementation phases with granular milestone progress rollups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Card Feature Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#247C78]/10 text-[#247C78] text-xs font-bold uppercase tracking-wider border border-[#247C78]/20">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#102B46] tracking-tight">
            Comprehensive Decision-Support Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Six integrated enterprise pillars designed to eliminate guesswork, mitigate cloud migration risks, 
            and justify SaaS investment to board-level stakeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">1. TOE Readiness Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A 5-step guided wizard assessing Technology (40%), Organization (35%), and Environment (25%) readiness. 
                Normalizes custom criteria weights to guarantee 100% mathematical integrity.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>Tornatzky & Fleischer Model</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">2. Multi-Criteria Recommendation Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Objective scoring across Cost (20%), Security (30%), Scalability (25%), Integration (15%), and Features (10%) 
                with live sensitivity analysis sliders and explainability rationale.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>MCDA / Weighted Scoring</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">3. 5×5 Risk Exposure & Heatmap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rule-based risk classification analyzing likelihood and severity. Automatically elevates high-sensitivity 
                data loss risks and on-premise integration bottlenecks with contextual mitigations.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>Severity Matrix & Heatmaps</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">4. 8-Phase Transformation Planner</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sequenced implementation roadmap from Strategy Definition through Post-Go-Live Support. 
                Features interactive milestone progress sliders with automatic roadmap completion rollups.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>Stage-Gate Transition Model</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">5. Context-Aware AI Advisor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive transformation assistant grounded in active tenant topology, monolith inventory, and readiness scores. 
                Protects enterprise credentials with zero frontend API key leakage.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>Tenant-Grounded AI Guidance</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 bg-white rounded-2xl border border-[#DCE5EA] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#247C78]/10 text-[#247C78] flex items-center justify-center group-hover:bg-[#247C78] group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102B46]">6. Executive Telemetry & Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive Recharts visualizations, radar readiness profiles, side-by-side product matrices, 
                and one-click printable formal audit briefs ready for stakeholder defense.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-[#247C78]">
              <span>C-Level Decision Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Architecture Callout */}
      <section className="bg-[#F1F5F9] border-y border-[#DCE5EA] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#247C78]">Security First Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B46] tracking-tight">
              Enterprise Data Isolation Guaranteed by PostgreSQL Row-Level Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every table across tenants, assessments, legacy monoliths, and transformation roadmaps is protected 
              at the database kernel layer via Supabase Row-Level Security (RLS) policies tied directly to authenticated JWT identity.
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#247C78] shrink-0" />
                <span>Zero cross-tenant data leakage via automated PostgreSQL WHERE injection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#247C78] shrink-0" />
                <span>Deterministic Edge Function execution with secure serverless compute</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#247C78] shrink-0" />
                <span>Role-based access control (Admin, Manager, Analyst, Viewer personas)</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DCE5EA] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#102B46] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                PostgreSQL Security Validation
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Active Enforced
              </span>
            </div>
            <pre className="p-3 bg-[#0F2942] rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`CREATE POLICY "Assessments company isolation"
  ON public.assessments FOR ALL TO authenticated
  USING (
    company_id = (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );`}
            </pre>
            <p className="text-[11px] text-slate-500 italic">
              Tenant queries from unauthorized accounts automatically return zero rows at the database engine level.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gradient-to-r from-[#0F2942] to-[#153450] text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Enterprise Modernization?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Evaluate candidate products, audit legacy applications, and structure your migration roadmap today with NIRNAY.
          </p>
          <div className="pt-2">
            <Link
              to={primaryCtaLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#247C78] hover:bg-[#1D6864] text-white font-bold text-sm shadow-xl shadow-[#247C78]/30 transition-all hover:scale-105"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1E32] text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#247C78] flex items-center justify-center text-white font-extrabold text-sm">
              N
            </div>
            <div>
              <span className="font-bold text-white text-sm">NIRNAY</span>
              <span className="text-slate-400 text-xs ml-2">Enterprise SaaS Transformation Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium text-xs">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-1">
            <p>E1CSA313 / E1ITA306 Design Project · Alliance University</p>
            <p>Mentor: Dr. T Prashant · Team: Rishi Kumar, Aarushi Joshi, Pradyumn Bisen, Akshayadevi K</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
