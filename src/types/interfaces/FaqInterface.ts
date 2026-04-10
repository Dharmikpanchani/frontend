export interface FaqAddInterface {
  question: string;
  answer: string;
}
export interface FaqGetInterface {
  question: string;
  answer: string;
  isActive: boolean;
  _id: string;
}
