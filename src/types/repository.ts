export type Repository = {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  local_path: string;
  default_branch: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export type RepositoryFormData = {
  owner: string;
  name: string;
  local_path: string;
  default_branch: string;
  is_private: boolean;
};
