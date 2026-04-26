export type City = {
    name: string;
    abbreviation: string;
    images: string[];
    description: string;
}

export type CityActivity = {
    id: number;
    name: string;
    city_abbreviation: string;
    images: string[];
    description: string;

    type: "landmarks" | "activity" | "entertainment";
}