export interface ReportHistory {
  fileName: string;
  isPeriodic: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface PaginateList<T> {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  offset: number;
  limit: number;
  totalDocs: number;
  pages: number;
}

export interface DiskInfo {
  free: string;
  size: string;
}
