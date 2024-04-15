
export interface Image {
  id: string;
  file_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface FoodLinkImage {
  file_id: string;
  food_id: string;
  created_at: Date;
  updated_at: Date;

  image?: Image;
}

export interface ServiceLinkImage {
  file_id: string;
  service_id: string;
  created_at: Date;
  updated_at: Date;

  image?: Image;
}