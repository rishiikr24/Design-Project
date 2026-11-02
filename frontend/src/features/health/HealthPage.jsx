/**
 * /health — Developer-only connectivity check.
 *
 * Reports whether Supabase is configured and which service mode is
 * active, WITHOUT revealing any key values or secrets.
 */

import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { getServiceMode } from '../../services/serviceMode';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Badge } from '../../components/Badge';

function StatusRow({ label, ok, detail }) {
  return (
    <tr className="border-b border-slate-800">
      <td className="py-2 pr-4 text-slate-400 font-medium">{label}</td>
      <td className="py-2 pr-4">
        <Badge variant={ok ? 'success' : 'warning'}>{ok ? 'OK' : 'NOT SET'}</Badge>
      </td>
      <td className="py-2 text-slate-300 text-xs font-mono">{detail}</td>
    </tr>
  );
}

export function HealthPage() {
  const urlSet = Boolean(import.meta.env.VITE_SUPABASE_URL);
  const keySet = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
  const configured = isSupabaseConfigured;
  const mode = getServiceMode();

  // Mask URL to show only the host portion, never the full value
  const urlHint = urlSet
    ? import.meta.env.VITE_SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0] + '.***'
    : '(empty)';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Health Check</h2>
        <p className="text-xs text-slate-400 mt-1">
          Developer-only page. Does not display secrets or key values.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Supabase Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <tbody>
              <StatusRow
                label="VITE_SUPABASE_URL"
                ok={urlSet}
                detail={urlHint}
              />
              <StatusRow
                label="VITE_SUPABASE_ANON_KEY"
                ok={keySet}
                detail={keySet ? '••••••••' : '(empty)'}
              />
              <StatusRow
                label="Client configured"
                ok={configured}
                detail={configured ? 'Real Supabase client active' : 'Using mock client'}
              />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Service Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <tbody>
              <StatusRow
                label="Active mode"
                ok={mode === 'supabase'}
                detail={mode}
              />
              <StatusRow
                label="VITE_USE_MOCKS"
                ok={import.meta.env.VITE_USE_MOCKS !== 'true'}
                detail={import.meta.env.VITE_USE_MOCKS ?? '(not set)'}
              />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-[10px] text-slate-500 text-center">
        Build: {import.meta.env.MODE} &middot; Vite {import.meta.env.VITE_PLUGIN_REACT ?? 'dev'}
      </p>
    </div>
  );
}
