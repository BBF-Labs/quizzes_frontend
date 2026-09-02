export interface ITask {
  id: string;
  _id?: string;
  title: string;
  subject?: string;
  status: "active" | "completed";
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITasksMetadata {
  completed: number;
  total: number;
  progress: number;
}

export interface ITasksResponse {
  tasks: ITask[];
  metadata: ITasksMetadata;
}

export interface CreateTaskInput {
  title: string;
  subject?: string;
}

export interface UpdateTaskInput {
  title?: string;
  subject?: string;
  status?: "active" | "completed";
}
