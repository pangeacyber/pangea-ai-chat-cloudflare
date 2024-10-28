interface PangeaResponse<T = any> {
  request_id: string;
  status: string;
  summary: string;
  result: T;
}
