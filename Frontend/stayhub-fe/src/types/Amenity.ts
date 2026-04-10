export type Amenity = {
  name: string;
  icon: string;
  category: string;
}

export type AmenityFilterData = {
  name: string | null;
  category: string | null;
  page: string | null;
};
