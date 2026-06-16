import { 
  User, Student, Teacher, Parent, Class, Subject, 
  AOI, Submission, Note, GenericSkill, Attendance, 
  Exam, ExamResult, FeeStatement, Announcement, TimetableEntry 
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: '1', name: 'Nalule Margaret', email: 'admin@wampeewo.com', role: 'admin' },
  { id: '2', name: 'Okello John', email: 'teacher@wampeewo.com', role: 'teacher' },
  { id: '3', name: 'Kato Paul', email: 'student@wampeewo.com', role: 'student' },
  { id: '4', name: 'Mukasa Ronald', email: 'parent@wampeewo.com', role: 'parent' },
  { id: '5', name: 'Nsubuga David', email: 'david@wampeewo.com', role: 'teacher' },
  { id: '6', name: 'Babirye Sarah', email: 'sarah@wampeewo.com', role: 'student' },
  { id: '7', name: 'Wasswa Peter', email: 'peter@wampeewo.com', role: 'student' }
];

export const mockTeachers: Teacher[] = [
  { 
    id: '2', 
    name: 'Okello John', 
    email: 'teacher@wampeewo.com', 
    role: 'teacher', 
    subjects: ['Mathematics', 'Physics'], 
    classIds: ['c1', 'c2'] 
  },
  { 
    id: '5', 
    name: 'Nsubuga David', 
    email: 'david@wampeewo.com', 
    role: 'teacher', 
    subjects: ['English Literature', 'History'], 
    classIds: ['c1', 'c3'] 
  }
];

export const mockStudents: Student[] = [
  { 
    id: '3', 
    name: 'Kato Paul', 
    email: 'student@wampeewo.com', 
    role: 'student', 
    classId: 'c1', 
    registrationNumber: 'WNS/2026/089', 
    gender: 'Male',
    parentIds: ['4'] 
  },
  { 
    id: '6', 
    name: 'Babirye Sarah', 
    email: 'sarah@wampeewo.com', 
    role: 'student', 
    classId: 'c1', 
    registrationNumber: 'WNS/2026/090', 
    gender: 'Female',
    parentIds: ['4'] 
  },
  { 
    id: '7', 
    name: 'Wasswa Peter', 
    email: 'peter@wampeewo.com', 
    role: 'student', 
    classId: 'c2', 
    registrationNumber: 'WNS/2025/112', 
    gender: 'Male',
    parentIds: [] 
  }
];

export const mockParents: Parent[] = [
  { 
    id: '4', 
    name: 'Mukasa Ronald', 
    email: 'parent@wampeewo.com', 
    role: 'parent', 
    childIds: ['3', '6'] 
  }
];

// Classes & Subjects
export const mockClasses: Class[] = [
  { id: 'c1', name: 'Senior 1 Blue', stream: 'Blue', classTeacherId: '2', studentCount: 45 },
  { id: 'c2', name: 'Senior 2 Red', stream: 'Red', classTeacherId: '5', studentCount: 42 },
  { id: 'c3', name: 'Senior 3 East', stream: 'East', classTeacherId: '2', studentCount: 38 },
  { id: 'c4', name: 'Senior 4 West', stream: 'West', classTeacherId: '5', studentCount: 40 }
];

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MTH', classId: 'c1' },
  { id: 's2', name: 'Physics', code: 'PHY', classId: 'c1' },
  { id: 's3', name: 'English Literature', code: 'ENG', classId: 'c1' },
  { id: 's4', name: 'History', code: 'HST', classId: 'c1' },
  { id: 's5', name: 'Mathematics', code: 'MTH', classId: 'c2' },
  { id: 's6', name: 'Geography', code: 'GEO', classId: 'c2' }
];

// Activities of Integration (AOIs)
export const mockAOIs: AOI[] = [
  {
    id: 'aoi1',
    title: 'Renewable Energy Project',
    description: 'Design a simple solar-powered water heater layout using locally sourced materials and calculate its efficiency.',
    deadline: '2026-06-30T17:00:00.000Z',
    classId: 'c1',
    teacherId: '2',
    rubric: [
      { skill: 'Critical Thinking', maxScore: 3 },
      { skill: 'Creativity', maxScore: 3 },
      { skill: 'Technical Drawing', maxScore: 3 }
    ]
  },
  {
    id: 'aoi2',
    title: 'Statistics of local crop yields',
    description: 'Collect yield data of maize and beans from five farmers in Wampeewo village and plot comparative bar graphs.',
    deadline: '2026-07-05T17:00:00.000Z',
    classId: 'c1',
    teacherId: '2',
    rubric: [
      { skill: 'Data Collection', maxScore: 3 },
      { skill: 'Graphical Presentation', maxScore: 3 }
    ]
  },
  {
    id: 'aoi3',
    title: 'Ugandan Pre-colonial Trade Analysis',
    description: 'Write an essay highlighting the impact of the Long Distance Trade on the Buganda Kingdom.',
    deadline: '2026-06-25T12:00:00.000Z',
    classId: 'c1',
    teacherId: '5',
    rubric: [
      { skill: 'Historical Accuracy', maxScore: 3 },
      { skill: 'Analytical Writing', maxScore: 3 }
    ]
  }
];

// Submissions
export const mockSubmissions: Submission[] = [
  {
    id: 'sub1',
    aoiId: 'aoi1',
    studentId: '3', // Kato Paul
    content: 'My solar heater project uses black painted plastic bottles connected in a series. I placed them in a wooden box lined with aluminum foil to trap heat. The test showed water temperature rose from 22C to 45C in 3 hours under direct sunlight.',
    grade: 3,
    feedback: 'Excellent design and calculation! Very creative use of local materials.',
    submittedAt: '2026-06-12T10:30:00.000Z'
  },
  {
    id: 'sub2',
    aoiId: 'aoi2',
    studentId: '3', // Kato Paul
    content: 'I visited 5 farms. Farmer Mukasa harvested 10 bags of maize, Farmer Nakato 8 bags, Farmer Sempa 12 bags... (attached charts)',
    submittedAt: '2026-06-15T15:20:00.000Z' // Ungraded
  },
  {
    id: 'sub3',
    aoiId: 'aoi1',
    studentId: '6', // Babirye Sarah
    content: 'Solar heater design draft with zinc sheet and copper tube coils... water heated by thermo-siphoning.',
    grade: 2,
    feedback: 'Good theoretical concept, but calculations for efficiency were missing. Please include them next time.',
    submittedAt: '2026-06-14T08:15:00.000Z'
  }
];

// Notes
export const mockNotes: Note[] = [
  {
    id: 'note1',
    studentId: '3',
    title: 'Physics - Heat Transfer Formulas',
    content: 'Conduction: Q/t = kA(T_hot - T_cold)/d\nConvection: Q/t = hA(T_s - T_f)\nRadiation: P = e * sigma * A * T^4\nRemember: Wampeewo weather averages 25C.',
    tags: ['Physics', 'Thermodynamics'],
    createdAt: '2026-06-10T09:00:00.000Z',
    updatedAt: '2026-06-10T09:30:00.000Z'
  },
  {
    id: 'note2',
    studentId: '3',
    title: 'Math - Summary of Statistics',
    content: 'Mean = Sum of all values / Total values\nMedian = Middle value when sorted\nMode = Most frequent value\nUseful for the crop yield crop project.',
    tags: ['Mathematics', 'Statistics'],
    createdAt: '2026-06-11T14:00:00.000Z',
    updatedAt: '2026-06-11T14:00:00.000Z'
  }
];

// Generic Skills (per student)
export const mockGenericSkills: Record<string, GenericSkill[]> = {
  '3': [
    { name: 'Critical Thinking', value: 3 },
    { name: 'Creativity', value: 2 },
    { name: 'Collaboration', value: 3 },
    { name: 'Communication', value: 2 },
    { name: 'Self-direction', value: 3 }
  ],
  '6': [
    { name: 'Critical Thinking', value: 2 },
    { name: 'Creativity', value: 3 },
    { name: 'Collaboration', value: 2 },
    { name: 'Communication', value: 3 },
    { name: 'Self-direction', value: 2 }
  ]
};

// Attendance
export const mockAttendance: Attendance[] = [
  // Today's records for c1 students (say, 2026-06-16)
  { id: 'att1', studentId: '3', classId: 'c1', date: '2026-06-16', status: 'present', markedBy: '2' },
  { id: 'att2', studentId: '6', classId: 'c1', date: '2026-06-16', status: 'present', markedBy: '2' },
  
  // Previous records
  { id: 'att3', studentId: '3', classId: 'c1', date: '2026-06-15', status: 'present', markedBy: '2' },
  { id: 'att4', studentId: '6', classId: 'c1', date: '2026-06-15', status: 'absent', markedBy: '2' },
  { id: 'att5', studentId: '3', classId: 'c1', date: '2026-06-12', status: 'present', markedBy: '2' },
  { id: 'att6', studentId: '6', classId: 'c1', date: '2026-06-12', status: 'present', markedBy: '2' },
  { id: 'att7', studentId: '3', classId: 'c1', date: '2026-06-11', status: 'excused', markedBy: '2' },
  { id: 'att8', studentId: '6', classId: 'c1', date: '2026-06-11', status: 'present', markedBy: '2' }
];

// Exams & Results
export const mockExams: Exam[] = [
  { id: 'ex1', name: 'Mid of Term I Exams 2026', term: 1, year: 2026, classId: 'c1' },
  { id: 'ex2', name: 'End of Term I Exams 2026', term: 1, year: 2026, classId: 'c1' }
];

export const mockExamResults: ExamResult[] = [
  // Kato Paul (student 3) - Term 1
  { id: 'er1', examId: 'ex2', studentId: '3', subjectId: 's1', score: 85, grade: 'D1', remarks: 'Excellent performance' },
  { id: 'er2', examId: 'ex2', studentId: '3', subjectId: 's2', score: 78, grade: 'D2', remarks: 'Good analytical skills' },
  { id: 'er3', examId: 'ex2', studentId: '3', subjectId: 's3', score: 62, grade: 'C4', remarks: 'Can improve essay writing' },
  
  // Babirye Sarah (student 6) - Term 1
  { id: 'er4', examId: 'ex2', studentId: '6', subjectId: 's1', score: 72, grade: 'C3', remarks: 'Consistent worker' },
  { id: 'er5', examId: 'ex2', studentId: '6', subjectId: 's2', score: 81, grade: 'D2', remarks: 'Great practical layout' },
  { id: 'er6', examId: 'ex2', studentId: '6', subjectId: 's3', score: 88, grade: 'D1', remarks: 'Outstanding literature insights' }
];

// Fee Statements & Payments
export const mockFeeStatements: Record<string, FeeStatement> = {
  '3': {
    studentId: '3',
    billedAmount: 1200000, // 1.2M UGX
    paidAmount: 850000,
    balance: 350000,
    payments: [
      { id: 'pay1', amount: 500000, receiptNumber: 'REC-9081', paymentMethod: 'Bank Slip', paymentDate: '2026-05-10', term: 1, year: 2026 },
      { id: 'pay2', amount: 350000, receiptNumber: 'REC-9243', paymentMethod: 'Mobile Money', paymentDate: '2026-06-01', term: 1, year: 2026 }
    ]
  },
  '6': {
    studentId: '6',
    billedAmount: 1200000,
    paidAmount: 1200000,
    balance: 0,
    payments: [
      { id: 'pay3', amount: 1200000, receiptNumber: 'REC-8991', paymentMethod: 'Bank Slip', paymentDate: '2026-05-08', term: 1, year: 2026 }
    ]
  }
};

// Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'Visitation Day Details',
    content: 'We welcome parents for our Term I Visitation Day on Sunday, June 21, 2026. Gate opens at 9:00 AM. Please clear pending fees.',
    authorId: '1',
    authorName: 'Nalule Margaret (Admin)',
    targetRoles: ['student', 'parent'],
    createdAt: '2026-06-12T08:00:00.000Z'
  },
  {
    id: 'ann2',
    title: 'Mid-Term Examinations Rescheduled',
    content: 'Please note that mid-term tests will begin on Monday, June 29 instead of June 22. Timetables will be uploaded by the end of this week.',
    authorId: '1',
    authorName: 'Nalule Margaret (Admin)',
    targetRoles: ['student', 'teacher', 'parent'],
    createdAt: '2026-06-14T11:30:00.000Z'
  },
  {
    id: 'ann3',
    title: 'Staff Meeting on Curriculum Guidelines',
    content: 'A mandatory staff assembly to align on the lower secondary competence-based grading rubric will be held in the library tomorrow at 4:30 PM.',
    authorId: '1',
    authorName: 'Nalule Margaret (Admin)',
    targetRoles: ['teacher'],
    createdAt: '2026-06-15T09:00:00.000Z'
  }
];

// Timetable
export const mockTimetables: TimetableEntry[] = [
  // Kato Paul & Babirye Sarah (Class c1)
  { id: 't1', classId: 'c1', subjectId: 's1', subjectName: 'Mathematics', teacherName: 'Okello John', dayOfWeek: 1, startTime: '08:30', endTime: '10:00', room: 'Room 3' },
  { id: 't2', classId: 'c1', subjectId: 's2', subjectName: 'Physics', teacherName: 'Okello John', dayOfWeek: 1, startTime: '10:30', endTime: '12:00', room: 'Lab A' },
  { id: 't3', classId: 'c1', subjectId: 's3', subjectName: 'English Literature', teacherName: 'Nsubuga David', dayOfWeek: 2, startTime: '09:00', endTime: '10:30', room: 'Room 3' },
  { id: 't4', classId: 'c1', subjectId: 's4', subjectName: 'History', teacherName: 'Nsubuga David', dayOfWeek: 3, startTime: '11:00', endTime: '12:30', room: 'Room 3' },
  { id: 't5', classId: 'c1', subjectId: 's1', subjectName: 'Mathematics', teacherName: 'Okello John', dayOfWeek: 4, startTime: '08:30', endTime: '10:00', room: 'Room 3' },
  { id: 't6', classId: 'c1', subjectId: 's2', subjectName: 'Physics', teacherName: 'Okello John', dayOfWeek: 5, startTime: '14:00', endTime: '15:30', room: 'Lab A' }
];

// Dashboard stats for Admin
export const getAdminStats = () => ({
  totalStudents: 1250,
  totalTeachers: 75,
  totalClasses: 32,
  totalSubjects: 18,
  attendancePercentage: 94.2,
  feesCollected: 450000000, // 450M UGX
  feesTarget: 600000000,    // 600M UGX
  recentActivities: [
    { id: 'act1', type: 'user_created', message: 'New student Babirye Sarah registered', time: '10 mins ago' },
    { id: 'act2', type: 'payment', message: 'Shs 1,200,000 tuition paid for Babirye Sarah', time: '1 hour ago' },
    { id: 'act3', type: 'aoi_created', message: 'Okello John created new AOI: Renewable Energy Project', time: '2 hours ago' },
    { id: 'act4', type: 'attendance', message: 'Okello John marked attendance for Senior 1 Blue', time: '4 hours ago' }
  ],
  attendanceTrends: [
    { date: 'Mon', value: 92 },
    { date: 'Tue', value: 95 },
    { date: 'Wed', value: 94 },
    { date: 'Thu', value: 96 },
    { date: 'Fri', value: 93 },
    { date: 'Sat', value: 0 },
    { date: 'Sun', value: 0 }
  ]
});