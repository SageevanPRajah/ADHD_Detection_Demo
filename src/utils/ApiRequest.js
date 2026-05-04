// utils/ApiRequest.js
const host = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const UserEndPoint = `${host}/users`;
export const AuthEndPoint = `${host}/auth`;
export const ActivityLogEndPoint = `${host}/api/activities`;
export const TokenAndAuthEndPoint = `${host}/auth/tokens`;

