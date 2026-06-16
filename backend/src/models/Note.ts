export type Note = {
  id: string;
  userId: string;
  submissionId?: string;
  title?: string;
  body: string;
  createdAt: Date;
};
