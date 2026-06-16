import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';

export default function AdminSettings() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure and view Wampeewo Ntake SS school administration options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Profile Card */}
        <Card className="p-5 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="font-bold text-slate-200 text-sm border-b border-white/5 pb-3 mb-4">School Details</h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">School Name</span>
                <span className="text-slate-300 font-medium mt-0.5 block">Wampeewo Ntake Secondary School</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Active Academic Term</span>
                <span className="text-slate-300 font-medium mt-0.5 block">Term I, 2026</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Curriculum Model</span>
                <span className="text-slate-300 font-medium mt-0.5 block">Uganda Lower Secondary (Competence-based)</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Grading Rubric</span>
                <span className="text-slate-300 font-medium mt-0.5 block">3-Point Competence Grid + D1-F9 Terminal Exams</span>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-white/5 pt-3">
            <Badge color="emerald" variant="subtle">Active School Profile</Badge>
          </div>
        </Card>

        {/* User Account Info */}
        <Card className="p-5 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="font-bold text-slate-200 text-sm border-b border-white/5 pb-3 mb-4">Your Session Profile</h3>
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl bg-slate-800 shrink-0 border border-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{user.name}</h4>
                    <p className="text-2xs text-slate-500 font-mono">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold uppercase tracking-wider block">System Role</span>
                    <span className="text-indigo-400 font-bold mt-0.5 block capitalize">{user.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold uppercase tracking-wider block">Session Credentials</span>
                    <span className="text-slate-300 font-medium font-mono text-2xs truncate block">JWT Token Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 border-t border-white/5 pt-3">
            <Badge color="indigo" variant="subtle">Session Verified</Badge>
          </div>
        </Card>

        {/* System Settings / Server details */}
        <Card className="p-5 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="font-bold text-slate-200 text-sm border-b border-white/5 pb-3 mb-4">Developer & Server Config</h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Operational Mode</span>
                <span className="text-blue-300 font-medium mt-0.5 block flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Live Express API Connected
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Backend Endpoint</span>
                <span className="text-slate-300 font-medium font-mono mt-0.5 block">http://localhost:4000/api</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">Database Driver</span>
                <span className="text-slate-300 font-medium mt-0.5 block">MySQL2 / Pool Connection</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block">App Build Target</span>
                <span className="text-slate-300 font-medium font-mono mt-0.5 block">Vite / ES2020</span>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-white/5 pt-3">
            <Badge color="blue" variant="outline">v1.1.0-live</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
