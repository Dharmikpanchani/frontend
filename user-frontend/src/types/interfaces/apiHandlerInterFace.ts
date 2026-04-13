export interface ResponseData {
  data: {
    data: [] | object;
  };
  status: number;
  message: string;
}
export interface ErrorData {
  response: {
    data: [] | object;
    status: number;
    message: string;
  };
}
