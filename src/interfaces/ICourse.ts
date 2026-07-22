interface ICourse {
  _id: string;
  code: string;
  title?: string;
  about: string;
  creditHours?: number;
  semester: number;
  numberOfLectures?: number;
  approvedQuestionsCount?: number;
  year?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface IUpdateCoursePayload {
  title?: string;
  about?: string;
  code?: string;
  creditHours?: number;
  semester?: number;
}

interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type { ICourse, IUpdateCoursePayload, IPaginationMeta };
