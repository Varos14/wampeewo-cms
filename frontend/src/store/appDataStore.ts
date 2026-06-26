import { create } from 'zustand';
import { 
  classService, studentService, teacherService, 
  subjectService, aoiService, announcementService 
} from '../services/api';
import { Class, Student, Teacher, Subject, AOI, Announcement, Submission } from '../types';

interface AppDataState {
  classes: Class[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  aois: AOI[];
  submissions: Submission[];
  announcements: Announcement[];
  loading: boolean;
  fetched: boolean;
  fetchData: () => Promise<void>;
  refreshSubmissions: (aoiId?: string) => Promise<void>;
}

export const useAppDataStore = create<AppDataState>((set, get) => ({
  classes: [],
  students: [],
  teachers: [],
  subjects: [],
  aois: [],
  submissions: [],
  announcements: [],
  loading: false,
  fetched: false,
  
  fetchData: async () => {
    if (get().fetched) return; // Only fetch once to optimize
    set({ loading: true });
    try {
      const [cls, stu, tch, sub, aoi, ann] = await Promise.all([
        classService.list(),
        studentService.list(),
        teacherService.list(),
        subjectService.list(),
        aoiService.list(),
        announcementService.list('student').catch(() => []) // Fetch general announcements
      ]);
      
      set({
        classes: cls,
        students: stu,
        teachers: tch,
        subjects: sub,
        aois: aoi,
        announcements: ann as any[],
        fetched: true,
      });

      // Optionally fetch submissions for all AOIs
      const fetchSubs = async () => {
        let allSubs: Submission[] = [];
        for (const a of aoi) {
          try {
            const subs = await aoiService.listSubmissions(a.id);
            allSubs = [...allSubs, ...subs];
          } catch(e) {}
        }
        set({ submissions: allSubs });
      };
      fetchSubs();

    } catch (error) {
      console.error("Failed to load app data", error);
    } finally {
      set({ loading: false });
    }
  },

  refreshSubmissions: async (aoiId?: string) => {
    try {
      const aois = get().aois;
      let allSubs: Submission[] = [];
      const targetAois = aoiId ? aois.filter(a => a.id === aoiId) : aois;
      
      for (const a of targetAois) {
        try {
          const subs = await aoiService.listSubmissions(a.id);
          allSubs = [...allSubs, ...subs];
        } catch(e) {}
      }

      set((state) => {
        if (aoiId) {
          // Replace only submissions for this aoiId
          const filtered = state.submissions.filter(s => s.aoiId !== aoiId);
          return { submissions: [...filtered, ...allSubs] };
        } else {
          return { submissions: allSubs };
        }
      });
    } catch (error) {
      console.error("Failed to refresh submissions", error);
    }
  }
}));
