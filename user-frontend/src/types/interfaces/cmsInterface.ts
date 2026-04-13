export interface AddCmsInterface {
  template: string;
}

export interface GetCmsInterface {
  privacy_policy: string;
  term_condition: string;
  about_us: string;
}

export interface GetCmsManageInterface {
  _id: string;
  outdoor_indoor: string;
  apartments: string;
  square_meters: string;
  isAvatarShow: boolean;
}

export interface AddCmsManageInterface {
  outdoor_indoor: string;
  apartments: string;
  square_meters: string;
  isAvatarShow?: boolean;
}