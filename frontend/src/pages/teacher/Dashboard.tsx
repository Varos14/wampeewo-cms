import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { useAuthStore } from '../../store/authStore';
import { mockClasses, mockAOIs, mockSubmissions, mockTimetables } from '../../utils/mockData';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  
  if (!user) return null;

  // Filter classes taught by this teacher
  const teacherClasses = mockClasses.filter(c => c.classTeacherId === user.id);
  // Total assignments/AOIs created by this teacher
  const teacherAOIs = mockAOIs.filter(a => a.teacherId === user.id);
  // Count total submissions waiting for grades
  const ungradedCount = mockSubmissions.filter(sub => 
    teacherAOIs.some(aoi => aoi.id === sub.aoiId) && sub.grade === undefined
  ).length;

  // Today's classes timetable preview (Monday = 1, let's say Monday timetable)
  const todayClasses = mockTimetables.filter(t => t.teacherName === user.name);

  // Performance stats mock
  const performanceData = [
    { label: 'Achieved', value: 8, color: '#10b981' },
    { label: 'Progressing', value: 12, color: '#f59e0b' },
    { label: 'Not Achieved', value: 2, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Teacher Console</h2>
        <p className="text-xs text-slate-500 mt-1">Manage continuous assessments, classes, and lesson schedules.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Classes"
          value={teacherClasses.length || 2}
          color="emerald"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="Created AOIs"
          value={teacherAOIs.length}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Submissions Pending Grading"
          value={ungradedCount}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <Card className="p-6 lg:col-span-2 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-200 mb-4">My Assigned Classes</h3>
            <div className="space-y-4">
              {teacherClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-xl transition hover:border-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{cls.name}</h4>
                      <p className="text-2xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Stream: {cls.stream || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300 block">{cls.studentCount} Students</span>
                    <span className="text-3xs text-emerald-400 font-semibold uppercase tracking-widest mt-0.5 block">Attendance Marked Today</span>
                  </div>
                </div>
              ))}
              {teacherClasses.length === 0 && (
                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-white/5 rounded-xl transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Senior 1 Blue</h4>
                      <p className="text-2xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Stream: Blue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300 block">45 Students</span>
                    <span className="text-3xs text-emerald-400 font-semibold uppercase tracking-widest mt-0.5 block">Attendance Marked Today</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Continuous Assessment Performance ratios */}
        <Card className="p-6 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-200">Continuous Assessment</h3>
            <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Overall competency grades split</p>
          </div>
          <div className="my-auto py-4">
            <DonutChart data={performanceData} size={120} centerText="22" centerLabel="Graded" />
          </div>
        </Card>
      </div>

      {/* Timetable preview and announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-200 mb-4">Lesson Timetable</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {todayClasses.map((item) => (
                  <tr key={item.id} className="text-xs">
                    <td className="py-3.5 font-bold text-slate-200">Senior 1 Blue</td>
                    <td className="py-3.5 text-slate-300">{item.subjectName}</td>
                    <td className="py-3.5 text-blue-400 font-semibold">{item.startTime} - {item.endTime}</td>
                    <td className="py-3.5 text-slate-400">{item.room || 'N/A'}</td>
                  </tr>
                ))}
                {todayClasses.length === 0 && (
                  <>
                    <tr className="text-xs">
                      <td className="py-3.5 font-bold text-slate-200">Senior 1 Blue</td>
                      <td className="py-3.5 text-slate-300">Mathematics</td>
                      <td className="py-3.5 text-blue-400 font-semibold">08:30 - 10:00</td>
                      <td className="py-3.5 text-slate-400">Room 3</td>
                    </tr>
                    <tr className="text-xs">
                      <td className="py-3.5 font-bold text-slate-200">Senior 1 Blue</td>
                      <td className="py-3.5 text-slate-300">Physics</td>
                      <td className="py-3.5 text-blue-400 font-semibold">10:30 - 12:00</td>
                      <td className="py-3.5 text-slate-400">Lab A</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick reminder details */}
        <Card className="p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-200 mb-4">Class Reminders</h3>
          <ul className="space-y-4 text-xs">
            <li className="flex gap-2">
              <span className="text-amber-500">⚠️</span>
              <p className="text-slate-300 font-medium">Renewable Energy solar heater project deadline ends in 2 weeks.</p>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              <p className="text-slate-300 font-medium">Class attendance files saved for yesterday.</p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}