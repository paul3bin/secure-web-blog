import jwtDecode from "jwt-decode";
import http from "./httpService";
import cookies from "./cookiesService";

const tokenKey = "token";
//const cookies = new Cookies();
export async function login(email, password) {
  const response = await http.post("/user/v1/signIn", { email, password });
  if (response && response.data && response.data.status === "pass") {
    cookies.set("token", response.data.token, { path: "/" });
    //cookies.set("otp", response.data.otp, { path: "/" });
    cookies.set("csrf", response.headers["x-csrf-token"], { path: "/" });

    //   { path: '/',
    //   maxAge: 3600000, // 1 hour
    //   secure: false, // set to true if you're using https
    //   httpOnly: true });
    http.setJwt(getJwt());
  }
  return response;
}

export async function register(data) {
  const response = await http.post("/user/v1/signup", data);
  if (response && response.data && response.data.status === "pass") {
    cookies.set("verify-token", response.data.token, { path: "/" });
  }
  return response;
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export async function logout() {
  await http.post("/user/v1/signout");
  removeAllCookies();
}

export function getCurrentUser() {
  try {
    const jwt = cookies.get("token");
    if (jwt) {
      let user = jwtDecode(jwt);
      //if user didn't login with otp yet, the session is not active and returns null
      if (user.active) {
        return user;
      }
    }
    return null;
  } catch (ex) {
    return null;
  }
}
export function getLoggedInUser() {
  try {
    const jwt = cookies.get("token");
    if (jwt) {
      let user = jwtDecode(jwt);
      return user;
    }
    return null;
  } catch (ex) {
    return null;
  }
}

export function getRegisteredUser() {
  try {
    const token = cookies.get("verify-token");
    if (token) {
      return token;
    }
    return null;
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  const jwt = cookies.get("token");
  return jwt;
}

export function getCSRF() {
  const csrf = cookies.get("csrf");
  return csrf;
}

export async function verifyLoginOtp(otp) {
  http.setCSRF();
  const response = await http.post("/user/v1/verify", { otp: otp });
  if (response && response.data && response.data.status === "pass") {
    cookies.set("token", response.data.token, { path: "/" });
    http.setJwt(getJwt());
  }
  return response;
}

export async function verifyRegistrationOtp(otp) {
  const response = await http.post("/user/v1/verifyRegistration", { otp: otp });
  return response;
}

export function removeAllCookies() {
  cookies.remove("csrf");
  cookies.remove("token");
  cookies.remove("verify-token");
}

export function removeCookie(name) {
  cookies.remove(name);
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
  verifyLoginOtp,
  register,
  getCSRF,
  removeAllCookies,
  verifyRegistrationOtp,
  removeCookie,
  getLoggedInUser,
  getRegisteredUser,
};
