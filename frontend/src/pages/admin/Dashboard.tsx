import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { AreaChart } from '../../components/charts/AreaChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { getAdminStats } from '../../utils/mockData';
import { studentService, teacherService, classService, subjectService } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const stats = getAdminStats();

  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [classCount, setClassCount] = useState<number | null>(null);
  const [subjectCount, setSubjectCount] = useState<number | null>(null);
  const [genderData, setGenderData] = useState<{ label: string; value: number; color: string }[]>([
    { label: 'Male', value: 610, color: '#3b82f6' },
    { label: 'Female', value: 640, color: '#f43f5e' },
  ]);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [studs, tchs, clss, subjs] = await Promise.all([
          studentService.list(),
          teacherService.list(),
          classService.list(),
          subjectService.list()
        ]);
        setStudentCount(studs.length);
        setTeacherCount(tchs.length);
        setClassCount(clss.length);
        setSubjectCount(subjs.length);

        if (studs.length > 0) {
          const maleCount = studs.filter((s: any) => s.gender === 'Male').length;
          const femaleCount = studs.filter((s: any) => s.gender === 'Female').length;
          setGenderData([
            { label: 'Male', value: maleCount, color: '#3b82f6' },
            { label: 'Female', value: femaleCount, color: '#f43f5e' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard dynamic counts:', err);
      }
    }
    loadCounts();
  }, []);

  // Simple quick actions with target navigation paths
  const quickActions = [
    { label: 'Register Student', icon: '👤+', color: 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20', path: '/admin/students?openModal=student' },
    { label: 'Add Teacher', icon: '👨‍🏫+', color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20', path: '/admin/teachers?openModal=teacher' },
    { label: 'Manage Classes', icon: '🏫', color: 'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20', path: '/admin/classes' },
    { label: 'Approvals', icon: '✅', color: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20', path: '/admin/assignments' },
  ];



  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time statistics & administration hub for Wampeewo Ntake SS.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => navigate('/admin/students')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Students"
            value={studentCount !== null ? studentCount : stats.totalStudents}
            color="indigo"
            trend={{ value: 4.8, isPositive: true, label: 'vs last term' }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
        </div>
        <div onClick={() => navigate('/admin/teachers')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Teachers"
            value={teacherCount !== null ? teacherCount : stats.totalTeachers}
            color="emerald"
            trend={{ value: 2.1, isPositive: true, label: 'vs last year' }}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            }
          />
        </div>
        <div onClick={() => navigate('/admin/classes')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Active Classes"
            value={classCount !== null ? classCount : stats.totalClasses}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
        </div>
        <div onClick={() => navigate('/admin/subjects')} className="cursor-pointer transition-transform hover:scale-105">
          <StatCard
            title="Total Subjects"
            value={subjectCount !== null ? subjectCount : stats.totalSubjects}
            color="amber"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Main Charts & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-800">Daily Attendance Trends</h3>
            <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Average weekly attendance: {stats.attendancePercentage}%</p>
          </div>
          <div className="mt-6">
            <AreaChart data={stats.attendanceTrends} strokeColor="#3b82f6" />
          </div>
        </Card>

        {/* Gender Demographics */}
        <Card className="p-6 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-800">Student Gender Ratio</h3>
            <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Total registered enrollment</p>
          </div>
          <div className="flex items-center justify-center py-4 w-full h-full min-h-[140px] shrink-0">
            <DonutChart data={genderData} size={130} centerText={`${studentCount !== null ? studentCount : '1,250'}`} centerLabel="Enrolled" />
          </div>
        </Card>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-800 mb-4">Quick Tasks</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-xl border border-black/5 flex flex-col items-center justify-center text-center transition-all hover:scale-102 focus:outline-none ${action.color}`}
              >
                <span className="text-xl mb-1.5">{action.icon}</span>
                <span className="text-xs font-bold">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-800 mb-4">Recent System Log</h3>
          <div className="space-y-4">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-slate-700 font-medium leading-relaxed">{act.message}</p>
                  <span className="text-slate-500 text-3xs font-semibold uppercase tracking-widest mt-1 block">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

