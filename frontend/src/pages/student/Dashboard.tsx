import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { formatDate } from '../../utils/helpers';
import { RubricBadge } from '../../components/ui/Badge';
import { mockExamResults } from '../../utils/mockData';
import { TermSelector } from '../../components/ui/TermSelector';
import { useUiStore } from '../../store/uiStore';

// Helper to determine term for an assignment
const getTermForAOI = (aoi: any): number => {
  const titleLower = aoi.title.toLowerCase();
  const descLower = aoi.description.toLowerCase();
  if (titleLower.includes('term i') || titleLower.includes('term 1') || descLower.includes('term i') || descLower.includes('term 1')) return 1;
  if (titleLower.includes('term ii') || titleLower.includes('term 2') || descLower.includes('term ii') || descLower.includes('term 2')) return 2;
  if (titleLower.includes('term iii') || titleLower.includes('term 3') || descLower.includes('term iii') || descLower.includes('term 3')) return 3;
  
  if (aoi.deadline) {
    const month = new Date(aoi.deadline).getMonth();
    if (month >= 0 && month <= 4) return 1;
    if (month >= 5 && month <= 7) return 2;
    return 3;
  }
  return 1;
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { aois, submissions, announcements, loading, fetchData } = useAppDataStore();
  const { activeTerm } = useUiStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading dashboard...</div>;

  // Assuming user object contains the classId (e.g. s1 -> c1)
  const studentClassId = 'c1'; // Defaulting for demo if missing in user payload

  // Assignments statistics filtered by activeTerm
  const classAOIs = aois.filter(a => a.classId === studentClassId && getTermForAOI(a) === activeTerm);
  const totalAssignments = classAOIs.length;
  const studentSubmissions = submissions.filter(s => s.studentId === user.id && classAOIs.some(a => a.id === s.aoiId));
  const gradedAssignments = studentSubmissions.filter(s => s.grade !== undefined).length;
  
  // Latest exam results (mocked for now)
  const myResults = mockExamResults.filter(r => r.studentId === user.id);

  // Filter announcements for students
  const studentAnnouncements = announcements.filter(a => a.targetRoles && a.targetRoles.includes('student'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Desktop</h2>
          <p className="text-xs text-slate-500 mt-1">Review assignments, course syllabuses, grades, and timetables — Term {activeTerm}</p>
        </div>
        <TermSelector />
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Submit Assignment', link: '/student/assignments', icon: '📝' },
          { label: 'View Timetable', link: '/student/timetable', icon: '📅' },
          { label: 'Download Notes', link: '/student/materials', icon: '📥' },
          { label: 'Join Class', link: '/student/presentations', icon: '🎥' }
        ].map((shortcut) => (
          <Card key={shortcut.label} className="p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors" variant="glass" onClick={() => window.location.href = shortcut.link}>
            <span className="text-2xl mb-2">{shortcut.icon}</span>
            <span className="text-xs font-bold text-slate-700">{shortcut.label}</span>
          </Card>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Projects"
          value={totalAssignments}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <StatCard
          title="Submitted Works"
          value={studentSubmissions.length}
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <StatCard
          title="Evaluated Skills"
          value={gradedAssignments}
          color="emerald"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Timetable & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments list */}
          <Card className="p-6" variant="glass">
            <h3 className="text-base font-bold text-slate-800 mb-4">Pending Assignments</h3>
            <div className="space-y-4">
              {aois.filter(a => a.classId === studentClassId).map((aoi) => {
                const sub = studentSubmissions.find(s => s.aoiId === aoi.id);
                return (
                  <div
                    key={aoi.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 border border-black/5 rounded-xl transition hover:border-blue-500/20"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{aoi.title}</h4>
                      <p className="text-2xs text-slate-600 mt-1 max-w-md line-clamp-1">{aoi.description}</p>
                      <p className="text-3xs font-semibold text-slate-500 uppercase tracking-widest mt-1.5">
                        Deadline: {formatDate(aoi.deadline, 'PPP p')}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 shrink-0">
                      {sub ? (
                        <div className="flex items-center gap-2">
                          <RubricBadge grade={sub.grade} />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Submitted</span>
                        </div>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-xl text-3xs font-bold text-blue-400 uppercase tracking-wider">
                          Todo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {aois.filter(a => a.classId === studentClassId).length === 0 && (
                <p className="text-sm text-slate-500 italic">No assignments to display.</p>
              )}
            </div>
          </Card>

          {/* School Announcements */}
          <Card className="p-6" variant="glass">
            <h3 className="text-base font-bold text-slate-800 mb-4">Teacher Communications & Notices</h3>
            <div className="space-y-4">
              {studentAnnouncements.map((ann) => (
                <div key={ann.id} className="p-4 bg-white/50 border border-black/5 rounded-xl">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800">{ann.title}</h4>
                    <span className="text-3xs text-slate-500 font-semibold uppercase tracking-widest">{formatDate(ann.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                  <span className="text-[10px] text-blue-500 font-bold block mt-2.5">{ann.authorName}</span>
                </div>
              ))}
              {studentAnnouncements.length === 0 && (
                <p className="text-sm text-slate-500 italic">No new announcements.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar stats */}
        <div className="space-y-6">
          {/* Attendance Ring */}
          <Card className="p-6 flex flex-col justify-between" variant="glass">
            <div>
              <h3 className="text-base font-bold text-slate-800">Term Attendance</h3>
              <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Academic Term {activeTerm === 1 ? 'I' : activeTerm === 2 ? 'II' : 'III'}
              </p>
            </div>
            <div className="my-6">
              <DonutChart value={activeTerm === 1 ? 95 : activeTerm === 2 ? 92 : 97} size={120} centerLabel="Attendance" />
            </div>
            <div className="flex justify-around text-center mt-2">
              <div>
                <span className="text-sm font-bold text-slate-800">{activeTerm === 1 ? 8 : activeTerm === 2 ? 11 : 14}</span>
                <p className="text-3xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Present</p>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800">{activeTerm === 1 ? 1 : activeTerm === 2 ? 0 : 1}</span>
                <p className="text-3xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Excused</p>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800">{activeTerm === 1 ? 0 : activeTerm === 2 ? 1 : 0}</span>
                <p className="text-3xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Absent</p>
              </div>
            </div>
          </Card>

          {/* Recent Exam Results preview */}
          <Card className="p-6" variant="glass">
            <h3 className="text-base font-bold text-slate-800 mb-4">Latest Exam Scores</h3>
            <div className="space-y-3">
              {myResults.map((res) => (
                <div key={res.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700">
                      {res.subjectId === 's1' ? 'Mathematics' : res.subjectId === 's2' ? 'Physics' : 'English Literature'}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{res.remarks}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-black text-slate-800">{res.score}/100</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 rounded-md">
                      {res.grade}
                    </span>
                  </div>
                </div>
              ))}
              {myResults.length === 0 && (
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Mathematics</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">Excellent performance</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-bold text-slate-800">N/A</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

