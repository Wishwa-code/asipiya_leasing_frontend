export interface User {
  id: number;
  full_name: string;
  email: string;
  branch_id: number;
  head_branch_id: number;
  branch_name: string;
  privileges: string[];
  logo?: string;
  company_name?: string;
  branches?: { idBranch: number; Name: string }[];
  branch_access?: number;
}
