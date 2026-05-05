const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getStoredAuth = () => {
  const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

  return {
    token: token || null,
    user: userJson ? JSON.parse(userJson) : null,
  };
};

export const saveStoredAuth = (token, user, rememberMe = true) => {
  const store = rememberMe ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));

  const otherStore = rememberMe ? sessionStorage : localStorage;
  otherStore.removeItem(TOKEN_KEY);
  otherStore.removeItem(USER_KEY);
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const authHeaders = () => {
  const { token } = getStoredAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
};