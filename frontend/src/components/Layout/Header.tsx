import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';
import { announcementService } from '../../services/api';
import { Announcement } from '../../types';
import { useSyncStore } from '../../store/syncStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, toggleMobileSidebar, unreadNotificationsCount, setUnreadNotificationsCount } = useUiStore();
  const { isOnline, syncQueue, isSyncing, flushQueue, removeFromQueue, setOnline } = useSyncStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
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
    <header className="sticky top-0 z-30 h-16 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm">
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

        {/* Sync Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setSyncOpen(!syncOpen);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
            className={`relative p-2 rounded-xl focus:outline-none transition-colors ${
              !isOnline 
                ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10' 
                : syncQueue.length > 0 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                  : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            title={!isOnline ? "Working Offline" : syncQueue.length > 0 ? "Pending Sync" : "Online & Synced"}
          >
            {isSyncing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 8h-5V3" />
              </svg>
            ) : !isOnline ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M18.364 5.636a9 9 0 01-1.282 11.231M15.536 8.464a5 5 0 01-.192 6.82M9 11.536a5 5 0 00-1.282 3.12M5.636 5.636a9 9 0 00-1.282 12.728" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
            {syncQueue.length > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-[#09101d] ${
                !isOnline ? 'bg-amber-600' : 'bg-blue-600'
              }`}>
                {syncQueue.length}
              </span>
            )}
          </button>

          {syncOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSyncOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-[#0f1624] border border-white/5 rounded-xl shadow-xl z-50 p-3 animate-slide-up max-h-120 overflow-y-auto">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offline Sync Manager</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      !isOnline ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {!isOnline ? 'Offline' : 'Online'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <label className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={!isOnline}
                        onChange={(e) => setOnline(!e.target.checked)}
                        className="rounded border-white/10 bg-slate-950/50 text-blue-600 focus:ring-0 w-3 h-3 accent-blue-600 cursor-pointer"
                      />
                      Force Simulate Offline Mode
                    </label>
                  </div>
                </div>

                {syncQueue.length === 0 ? (
                  <div className="py-6 text-center">
                    <svg className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-bold text-slate-300">All data synchronized</p>
                    <p className="text-[10px] text-slate-500 mt-1">Changes are saved to the server in real-time.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-500 font-bold">{syncQueue.length} pending operation{syncQueue.length > 1 ? 's' : ''}</span>
                      {isOnline && (
                        <button
                          onClick={() => flushQueue()}
                          disabled={isSyncing}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 8h-5V3" />
                          </svg>
                          Sync Now
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {syncQueue.map((item) => (
                        <div key={item.id} className="p-2 bg-slate-900/50 hover:bg-slate-800/40 rounded-lg border border-white/5 flex flex-col gap-1 transition-all">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-bold text-slate-200 leading-normal line-clamp-2">
                              {item.description}
                            </span>
                            <button
                              onClick={() => removeFromQueue(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                              title="Discard action"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                              item.status === 'syncing' 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                : item.status === 'failed'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          {item.error && (
                            <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/5 p-1 rounded border border-rose-500/10 mt-1 break-words">
                              Error: {item.error}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
              setSyncOpen(false);
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