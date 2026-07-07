import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { SCHOOL_SHORT_NAME, ROLE_LABELS } from '../../utils/constants';

// Simple SVG Icons as components
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Students: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Teachers: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
    </svg>
  ),
  Classes: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Subjects: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Attendance: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Exams: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Results: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),

  Reports: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Assignments: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  GradeBook: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Timetable: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Notes: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
    </svg>
  ),
  Presentations: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Skills: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
};

interface LinkItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  if (!user) return null;

  const links: Record<string, LinkItem[]> = {
    admin: [
      { to: '/admin', label: 'Dashboard', icon: <Icons.Dashboard /> },
      { to: '/admin/students', label: 'Students', icon: <Icons.Students /> },
      { to: '/admin/teachers', label: 'Teachers', icon: <Icons.Teachers /> },
      { to: '/admin/classes', label: 'Classes', icon: <Icons.Classes /> },
      { to: '/admin/subjects', label: 'Subjects', icon: <Icons.Subjects /> },
      { to: '/admin/assignments', label: 'Assignments', icon: <Icons.Assignments /> },
      { to: '/admin/attendance', label: 'Attendance', icon: <Icons.Attendance /> },
      { to: '/admin/exams', label: 'Exams', icon: <Icons.Exams /> },
      { to: '/admin/results', label: 'Results', icon: <Icons.Results /> },

      { to: '/admin/reports', label: 'Reports', icon: <Icons.Reports /> },
      { to: '/admin/settings', label: 'Settings', icon: <Icons.Settings /> },
    ],
    teacher: [
      { to: '/teacher', label: 'Dashboard', icon: <Icons.Dashboard /> },
      { to: '/teacher/attendance', label: 'Attendance', icon: <Icons.Attendance /> },
      { to: '/teacher/assignments', label: 'Assignments', icon: <Icons.Assignments /> },
      { to: '/teacher/gradebook', label: 'Grade Book', icon: <Icons.GradeBook /> },
      { to: '/teacher/classes', label: 'My Classes', icon: <Icons.Classes /> },
      { to: '/teacher/skills', label: 'Generic Skills', icon: <Icons.Skills /> },
      { to: '/teacher/timetable', label: 'Timetable', icon: <Icons.Timetable /> },
      { to: '/teacher/presentations', label: 'Meetings', icon: <Icons.Presentations /> },
      { to: '/teacher/materials', label: 'Materials', icon: <Icons.Notes /> },
    ],
    student: [
      { to: '/student', label: 'Dashboard', icon: <Icons.Dashboard /> },
      { to: '/student/subjects', label: 'Subjects', icon: <Icons.Subjects /> },
      { to: '/student/assignments', label: 'Assignments', icon: <Icons.Assignments /> },
      { to: '/student/attendance', label: 'Attendance', icon: <Icons.Attendance /> },
      { to: '/student/results', label: 'Results', icon: <Icons.Results /> },
      { to: '/student/notes', label: 'My Notes', icon: <Icons.Notes /> },
      { to: '/student/materials', label: 'Materials', icon: <Icons.Notes /> },
      { to: '/student/presentations', label: 'Online Classes', icon: <Icons.Presentations /> },
      { to: '/student/timetable', label: 'Timetable', icon: <Icons.Timetable /> },
    ],

  };

  const currentLinks = links[user.role] || [];

  const handleLinkClick = () => {
    setMobileSidebarOpen(false);
  };

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72';
  const displayClass = mobileSidebarOpen 
    ? 'translate-x-0' 
    : '-translate-x-full lg:translate-x-0';

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col h-full bg-[#09101d] text-slate-100 border-r border-white/5 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${sidebarWidth} ${displayClass}`}
    >
      {/* Sidebar Header/Branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-white/5">
            <img
              src="/logo.png"
              alt="Wampeewo Ntake SS Logo"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.parentElement as HTMLElement).innerText = 'W'; }}
            />
          </div>
          {!sidebarCollapsed && (
            <span className="font-extrabold tracking-tight text-slate-100 text-sm truncate uppercase">
              {SCHOOL_SHORT_NAME}
            </span>
          )}
        </div>
      </div>


      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        {currentLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleLinkClick}
            end={link.to === `/${user.role}`}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-semibold uppercase tracking-wider ${
                isActive
                  ? 'bg-blue-600/15 border border-blue-500/20 text-blue-400 font-bold'
                  : 'hover:bg-slate-800/30 text-slate-400 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
            alt={user.name}
            className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 object-cover"
          />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;