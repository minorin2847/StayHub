export type Policy = {
  name: string;
  description: string;
  category: string;
  status: boolean;
  updated_at: string;
};

export type PolicyFilterData = {
  name: string | null;
  category: string | null;
  page: string | null;
};
