import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { gradeService } from '../../services/api';
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

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { 
    classes, aois, students, teachers, submissions, 
    loading, fetchData 
  } = useAppDataStore();
  const { activeTerm } = useUiStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading dashboard...</div>;

  const currentTeacher = teachers.find(t => t.id === user.id);
  const teacherSubjects = currentTeacher?.subjects || ['General'];

  // Filter classes taught by this teacher
  const teacherClasses = classes.filter(c => c.classTeacherId === user.id);
  // Total assignments/AOIs created by this teacher filtered by activeTerm
  const teacherAOIs = aois.filter(a => a.teacherId === user.id && getTermForAOI(a) === activeTerm);
  // Count total submissions waiting for grades
  const ungradedCount = submissions.filter(sub => 
    teacherAOIs.some(aoi => aoi.id === sub.aoiId) && sub.grade === undefined
  ).length;

  // Today's classes timetable preview
  const todayClasses: any[] = []; // Timetable logic can be expanded later

  // Filter students who belong to the classes taught by this teacher
  const teacherStudents = students.filter(s => teacherClasses.some(c => c.id === s.classId));

  // Performance stats mock dynamically adjusted by term
  const performanceData = activeTerm === 1 
    ? [
        { label: 'Achieved', value: 8, color: '#10b981' },
        { label: 'Progressing', value: 12, color: '#f59e0b' },
        { label: 'Not Achieved', value: 2, color: '#f43f5e' },
      ]
    : activeTerm === 2 
    ? [
        { label: 'Achieved', value: 11, color: '#10b981' },
        { label: 'Progressing', value: 9, color: '#f59e0b' },
        { label: 'Not Achieved', value: 1, color: '#f43f5e' },
      ]
    : [
        { label: 'Achieved', value: 14, color: '#10b981' },
        { label: 'Progressing', value: 6, color: '#f59e0b' },
        { label: 'Not Achieved', value: 0, color: '#f43f5e' },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teacher Console</h2>
          <p className="text-xs text-slate-500 mt-1">Manage continuous assessments, classes, and lesson schedules — Term {activeTerm}</p>
        </div>
        <TermSelector />
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
            <h3 className="text-base font-bold text-slate-800 mb-4">My Assigned Classes</h3>
            <div className="space-y-4">
              {teacherClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 bg-white/50 border border-black/5 rounded-xl transition hover:border-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{cls.name}</h4>
                      <p className="text-2xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Stream: {cls.stream || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">{cls.studentCount} Students</span>
                    <span className="text-3xs text-emerald-400 font-semibold uppercase tracking-widest mt-0.5 block">Attendance Marked Today</span>
                  </div>
                </div>
              ))}
              {teacherClasses.length === 0 && (
                <div className="flex items-center justify-between p-4 bg-white/50 border border-black/5 rounded-xl transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Senior 1 Blue</h4>
                      <p className="text-2xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Stream: Blue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">45 Students</span>
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
            <h3 className="text-base font-bold text-slate-800">Continuous Assessment</h3>
            <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Overall competency grades split</p>
          </div>
          <div className="my-auto py-4">
            <DonutChart data={performanceData} size={120} centerText="22" centerLabel="Graded" />
          </div>
        </Card>
      </div>

      {/* Timetable preview and announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col justify-center items-center text-center space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100" variant="glass">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Messages</h3>
            <p className="text-xs text-slate-500 mt-1">Chat privately with Admins and other Teachers.</p>
          </div>
          <a href="/teacher/messages" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95">
            Open Messages
          </a>
        </Card>

        <Card className="lg:col-span-2 p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-800 mb-4">Lesson Timetable</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 whitespace-nowrap">
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Time</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {todayClasses.map((item) => (
                  <tr key={item.id} className="text-xs whitespace-nowrap">
                    <td className="py-3.5 font-bold text-slate-800">Senior 1 Blue</td>
                    <td className="py-3.5 text-slate-700">{item.subjectName}</td>
                    <td className="py-3.5 text-blue-400 font-semibold">{item.startTime} - {item.endTime}</td>
                    <td className="py-3.5 text-slate-600">{item.room || 'N/A'}</td>
                  </tr>
                ))}
                {todayClasses.length === 0 && (
                  <>
                    <tr className="text-xs whitespace-nowrap">
                      <td className="py-3.5 font-bold text-slate-800">Senior 1 Blue</td>
                      <td className="py-3.5 text-slate-700">Mathematics</td>
                      <td className="py-3.5 text-blue-400 font-semibold">08:30 - 10:00</td>
                      <td className="py-3.5 text-slate-600">Room 3</td>
                    </tr>
                    <tr className="text-xs whitespace-nowrap">
                      <td className="py-3.5 font-bold text-slate-800">Senior 1 Blue</td>
                      <td className="py-3.5 text-slate-700">Physics</td>
                      <td className="py-3.5 text-blue-400 font-semibold">10:30 - 12:00</td>
                      <td className="py-3.5 text-slate-600">Lab A</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick reminder details */}
        <Card className="p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-800 mb-4">Class Reminders</h3>
          <ul className="space-y-4 text-xs">
            <li className="flex gap-2">
              <span className="text-amber-500">⚠️</span>
              <p className="text-slate-700 font-medium">Renewable Energy solar heater project deadline ends in 2 weeks.</p>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">✓</span>
              <p className="text-slate-700 font-medium">Class attendance files saved for yesterday.</p>
            </li>
          </ul>
        </Card>
      </div>

      {/* Students Results Section */}
      <Card className="p-6 mt-6" variant="glass">
        <h3 className="text-base font-bold text-slate-800 mb-4">Students Results</h3>
        <p className="text-xs text-slate-500 mb-6">List of students by class for easy grading access.</p>
        
        <div className="space-y-6">
          {teacherClasses.map(cls => {
            const classStudents = teacherStudents.filter(s => s.classId === cls.id);
            return (
              <div key={cls.id} className="space-y-3">
                <h4 className="text-sm font-bold text-blue-400 bg-blue-500/10 inline-block px-3 py-1 rounded-lg">
                  {cls.name} ({cls.stream || 'No Stream'})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 text-slate-600 whitespace-nowrap">
                        <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Student Name</th>
                        <th className="pb-3 text-xs font-semibold uppercase tracking-wider">Reg No.</th>
                        <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {classStudents.map(student => (
                        <tr key={student.id} className="text-xs hover:bg-black/5 transition-colors whitespace-nowrap">
                          <td className="py-3 font-semibold text-slate-800">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                                alt={student.name}
                                className="w-6 h-6 rounded bg-slate-700 shrink-0"
                              />
                              {student.name}
                            </div>
                          </td>
                          <td className="py-3 text-slate-600 font-mono">{student.registrationNumber}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {teacherSubjects.map(subject => (
                                <div key={subject} className="flex flex-col items-end gap-1">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{subject}</span>
                                  <select 
                                    className="px-3 py-1.5 bg-white border border-black/10 text-slate-800 rounded-lg text-xs outline-none focus:border-blue-500 cursor-pointer min-w-[100px]"
                                    defaultValue=""
                                    onChange={async (e) => {
                                      const grade = e.target.value;
                                      if (grade) {
                                        try {
                                          e.target.disabled = true; // prevent double submission
                                          const response = await gradeService.saveQuickGrade(student.id, subject, grade);
                                          alert(`${response.message}: Grade ${grade} in ${subject} assigned to ${student.name}!`);
                                        } catch (error) {
                                          alert('Failed to save grade');
                                          console.error(error);
                                        } finally {
                                          e.target.disabled = false;
                                        }
                                      }
                                    }}
                                  >
                                    <option value="" disabled>Grade...</option>
                                    <optgroup label="Distinction">
                                      <option value="D1">D1 (Exceptional)</option>
                                      <option value="D2">D2 (Excellent)</option>
                                    </optgroup>
                                    <optgroup label="Credit">
                                      <option value="C3">C3 (Very Good)</option>
                                      <option value="C4">C4 (Good)</option>
                                      <option value="C5">C5 (Satisfactory)</option>
                                      <option value="C6">C6 (Adequate)</option>
                                    </optgroup>
                                    <optgroup label="Pass">
                                      <option value="P7">P7 (Pass)</option>
                                      <option value="P8">P8 (Weak Pass)</option>
                                    </optgroup>
                                    <optgroup label="Fail">
                                      <option value="F9">F9 (Fail)</option>
                                    </optgroup>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {classStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-slate-500 italic text-xs">No students in this class.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {teacherClasses.length === 0 && (
            <p className="text-sm text-slate-500 italic">You are not currently assigned as a class teacher to any classes.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

