// utils/authStorage.js

// Save token & tenant info in localStorage
export const setAuthData = (token, tenant) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("tenant", tenant);
};

// Get token
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Get tenant
export const getTenant = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tenant");
};

// Clear token (logout)
export const clearAuthData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("tenant");
};
