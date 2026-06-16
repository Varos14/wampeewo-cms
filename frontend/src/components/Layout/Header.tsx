import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';
import { announcementService } from '../../services/api';
import { Announcement } from '../../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, toggleMobileSidebar, unreadNotificationsCount, setUnreadNotificationsCount } = useUiStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string, path: string}[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      announcementService.list(user.role).then(data => {
        setAnnouncements(data);
        // Set count to number of announcements initially
        setUnreadNotificationsCount(data.length);
      }).catch(err => console.error("Failed to load announcements", err));
    }
  }, [user, setUnreadNotificationsCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const quickLinks: Record<string, { title: string, path: string }[]> = {
    admin: [
      { title: 'Dashboard', path: '/admin' },
      { title: 'Students', path: '/admin/students' },
      { title: 'Teachers', path: '/admin/teachers' },
      { title: 'Classes', path: '/admin/classes' },
      { title: 'Subjects', path: '/admin/subjects' },
      { title: 'Attendance', path: '/admin/attendance' },
      { title: 'Exams', path: '/admin/exams' },
      { title: 'Results', path: '/admin/results' },
      { title: 'Fees', path: '/admin/fees' },
      { title: 'Reports', path: '/admin/reports' },
      { title: 'Settings', path: '/admin/settings' },
    ],
    teacher: [
      { title: 'Dashboard', path: '/teacher' },
      { title: 'Attendance', path: '/teacher/attendance' },
      { title: 'Assignments', path: '/teacher/assignments' },
      { title: 'Gradebook', path: '/teacher/gradebook' },
      { title: 'My Classes', path: '/teacher/classes' },
      { title: 'Timetable', path: '/teacher/timetable' },
    ],
    student: [
      { title: 'Dashboard', path: '/student' },
      { title: 'Subjects', path: '/student/subjects' },
      { title: 'Assignments', path: '/student/assignments' },
      { title: 'Attendance', path: '/student/attendance' },
      { title: 'Results', path: '/student/results' },
      { title: 'Notes', path: '/student/notes' },
      { title: 'Timetable', path: '/student/timetable' },
    ],
    parent: [
      { title: 'Dashboard', path: '/parent' },
      { title: 'Results', path: '/parent/results' },
      { title: 'Attendance', path: '/parent/attendance' },
      { title: 'Fee Statements', path: '/parent/fees' },
    ]
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const links = quickLinks[user.role] || [];
      const matches = links.filter(link => 
        link.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(matches);
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  const executeSearch = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#09101d]/60 backdrop-blur-md border-b border-white/5 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Mobile Toggle & Sidebar collapse button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl lg:hidden focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl hidden lg:block focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>

        {/* Welcome Text */}
        <h1 className="text-sm md:text-base font-bold text-slate-100 hidden sm:block">
          Welcome back, <span className="text-blue-400 font-extrabold">{user.name}</span>
        </h1>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative max-w-xs hidden md:block" ref={searchRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => {
              if (searchResults.length > 0) setSearchOpen(true);
            }}
            placeholder="Search portal..."
            className="w-48 xl:w-64 bg-slate-950/45 border border-white/5 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Search Dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#0f1624] border border-white/5 rounded-xl shadow-xl z-50 p-1.5 animate-slide-up max-h-64 overflow-y-auto">
              <div className="px-3 py-1.5 border-b border-white/5 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Quick Links
              </div>
              {searchResults.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-500">No matching sections found.</div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.path}
                    onClick={() => executeSearch(result.path)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    {result.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
              setUnreadNotificationsCount(0); // clear count when opened
            }}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl focus:outline-none transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border border-[#09101d]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-[#0f1624] border border-white/5 rounded-xl shadow-xl z-50 p-2 animate-slide-up max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b border-white/5 mb-1.5 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200">Notifications</h3>
                </div>
                {announcements.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  <div className="space-y-1">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-3 bg-slate-900/50 hover:bg-slate-800/50 rounded-lg transition-colors border border-white/5">
                        <p className="text-xs font-bold text-slate-200 mb-1">{ann.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                        <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-wider font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-800/30 rounded-xl focus:outline-none transition-all"
          >
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {profileOpen && (
            <>
              {/* Overlay close click */}
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-[#0f1624] border border-white/5 rounded-xl shadow-xl z-50 p-1.5 animate-slide-up">
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                  <p className="text-3xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;