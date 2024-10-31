export const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const rateLimitQuery = () => {
  const dt = new Date();
  const today = "24hour";

  const limitSearch = {
    query: "event_type:llm_response",
    limit: 1,
    start: today,
    search_restriction: {},
  };

  return limitSearch;
};
