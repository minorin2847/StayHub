export type Policy = {
  name: string;
  icon: string;
  description: string;
  category: string;
  updated_at: string;
};

export type PolicyFilterData = {
  name: string | null;
  category: string | null;
  page: string | null;
};
