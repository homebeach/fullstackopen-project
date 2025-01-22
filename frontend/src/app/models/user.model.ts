export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  user_type: string;
  created_at: string;
  disabled: boolean;
  password: string; // Updated field to match backend
}
