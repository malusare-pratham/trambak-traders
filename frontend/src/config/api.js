export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const jsonAuthHeaders = () =>
  getAuthHeaders({
    "Content-Type": "application/json",
  });
