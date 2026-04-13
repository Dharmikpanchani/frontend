import type { Moment } from "moment";

export interface AddSettingInterface {
  tokenPrice: string;
  totalPresale: string;
  countries: string;
  referral_point: string;
  profile: File | Blob;
  videoUrl?: string;
  presaleDate: Moment | null;
  pauseRound: boolean;
}

export interface GetSettingInterface {
  _id: string;
  live_presale_date: string;
  token_price_btc: string;
  total_participants: string;
  supported_countries: string;
  referral_bonus: string;
  presale_date: string;
  presale_video: string;
  round_pause: boolean;
}
