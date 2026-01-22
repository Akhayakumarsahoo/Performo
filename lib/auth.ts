import { roleToDefaultPath } from "./utils";
import { User } from "./user";

type Auth = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export function setAuth(auth: Auth) {
  localStorage.setItem("token", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  localStorage.setItem("user", JSON.stringify(auth.user));
}

export function getAuth(): Auth | null {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const userString = localStorage.getItem("user");

  if (token && refreshToken && userString) {
    const user = JSON.parse(userString) as User;
    return {
      accessToken: token,
      refreshToken,
      user,
    };
  }

  return null;
}

export function useAuth() {
  const auth = getAuth();
  if (auth?.user) {
    return {
      ...auth,
      defaultPath: roleToDefaultPath(auth.user.role),
    };
  }
  return null;
}
