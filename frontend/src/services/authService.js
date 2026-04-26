import api from "./api";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 10;

export function validatePassword(password, confirmPassword) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Password must be at least 8 characters long.";
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return "Password must be no more than 10 characters long.";
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "Confirm password must match password.";
  }

  return "";
}

export function registerStudent(payload) {
  return api.post("/auth/register/student", payload);
}

export function loginStudent(payload) {
  return api.post("/auth/login/student", payload);
}

export function loginAdmin(payload) {
  return api.post("/auth/login/admin", payload);
}

export function getCurrentUserRole(email) {
  return api.get("/auth/role", {
    params: { email },
  });
}
