import { API_BASE_URL } from './config';

export function getAuthToken() {
  return localStorage.getItem("zenque_auth_token");
}

export function getAuthHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = { ...customHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function clearAuthSession() {
  localStorage.removeItem("zenque_auth_token");
  localStorage.removeItem("zenque_current_user");
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent("zenque_auth_unauthorized"));
  }
}

export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem("zenque_auth_token", token);
  }
  if (user) {
    const { password: _pw, token: _tk, ...cleanUser } = user;
    localStorage.setItem("zenque_current_user", JSON.stringify(cleanUser));
  }
}

export async function handleApiResponse(response, defaultErrorMessage = "Request failed", skipAutoClear = false) {
  if (response.status === 401) {
    if (!skipAutoClear) {
      clearAuthSession();
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || defaultErrorMessage || "Session expired or authentication invalid. Please log in again.");
  }

  if (response.status === 403) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "You are not authorized to perform this action.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || defaultErrorMessage);
  }

  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleApiResponse(response, "Invalid email or password.", true);

  if (data && data.token) {
    setAuthSession(data.token, data);
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return await handleApiResponse(response, "Registration failed");
}

export async function getAllUsers() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  return await handleApiResponse(response, "Failed to fetch users");
}

export async function getUserById(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: getAuthHeaders(),
  });
  return await handleApiResponse(response, "Failed to fetch user profile");
}
