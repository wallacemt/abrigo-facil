const normalizeBaseUrl = (value: string): string => {
  return value.replace(/\/+$/, "");
};

export const getApiBaseUrl = (): string => {
  const value = process.env.API_BASE_URL;

  if (!value) {
    throw new Error("Missing API_BASE_URL environment variable.");
  }

  return normalizeBaseUrl(value);
};
