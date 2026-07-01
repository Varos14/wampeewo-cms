import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { 
  mockStudents, mockTeachers, mockClasses, mockSubjects, 
  mockAttendance, mockAOIs, mockSubmissions 
} from '../../utils/mockData';

export default function AdminReports() {
  // 1. Core Counts
  const totalStudents = mockStudents.length;
  const totalTeachers = mockTeachers.length;
  const totalClasses = mockClasses.length;
  const totalSubjects = mockSubjects.length;

  // 2. Attendance Report Math
  const totalAtt = mockAttendance.length;
  const presentAtt = mockAttendance.filter(a => a.status === 'present').length;
  const attRate = totalAtt > 0 ? (presentAtt / totalAtt) * 100 : 0;


  // 4. AOI Activity Math
  const totalAOIs = mockAOIs.length;
  const totalSubmissions = mockSubmissions.length;
  const gradedSubmissions = mockSubmissions.filter(s => s.grade !== undefined).length;
  const ungradedSubmissions = totalSubmissions - gradedSubmissions;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Reports</h2>
        <p className="text-xs text-slate-500 mt-1">Consolidated institutional reporting statistics for Wampeewo Ntake SS.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students Enrolled"
          value={totalStudents}
          color="indigo"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Teaching Staff"
          value={totalTeachers}
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
            </svg>
          }
        />
        <StatCard
          title="Active Streams"
          value={totalClasses}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Active Syllabus"
          value={totalSubjects}
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AOI Activity Report */}
        <Card className="p-5" variant="glass">
          <h3 className="font-bold text-slate-800 text-sm border-b border-black/5 pb-3 mb-4">Activities of Integration (AOI)</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/50 p-2.5 rounded-xl border border-black/5">
                <span className="text-3xs font-semibold uppercase tracking-widest text-slate-500 block">Total AOIs</span>
                <span className="text-base font-extrabold text-indigo-400 mt-1 inline-block">{totalAOIs}</span>
              </div>
              <div className="bg-white/50 p-2.5 rounded-xl border border-black/5">
                <span className="text-3xs font-semibold uppercase tracking-widest text-slate-500 block">Submissions</span>
                <span className="text-base font-extrabold text-blue-400 mt-1 inline-block">{totalSubmissions}</span>
              </div>
              <div className="bg-white/50 p-2.5 rounded-xl border border-black/5">
                <span className="text-3xs font-semibold uppercase tracking-widest text-slate-500 block">Graded</span>
                <span className="text-base font-extrabold text-emerald-400 mt-1 inline-block">{gradedSubmissions}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-black/5">
              <div>
                <p className="text-xs font-semibold text-slate-700">Pending Evaluation</p>
                <p className="text-2xs text-slate-500">Submissions awaiting teacher reviews</p>
              </div>
              <Badge color="amber" variant="solid">{ungradedSubmissions} Ungraded</Badge>
            </div>
          </div>
        </Card>

        {/* Attendance & Demographics */}
        <Card className="p-5" variant="glass">
          <h3 className="font-bold text-slate-800 text-sm border-b border-black/5 pb-3 mb-4">Attendance Performance</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Term Attendance Rate</span>
                <span>{attRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-black/5">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${attRate}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/2 border border-black/5 px-4 py-3 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-700">Daily Log Summary</p>
                <p className="text-3xs text-slate-500 mt-0.5">Total checked profiles: {totalAtt}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


