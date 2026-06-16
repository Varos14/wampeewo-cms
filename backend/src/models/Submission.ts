export type Submission = {
  id: string;
  userId: string;
  aoiId: string;
  content: string;
  score?: number;
  createdAt: Date;
};
