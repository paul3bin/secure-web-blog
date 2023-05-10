import jwtDecode from "jwt-decode";
import http from "./httpService";
import { apiUrl } from "../config.json";
import cookies from "./cookiesService";

const apiEndpoint = apiUrl + "/auth";
const tokenKey = "token";
//const cookies = new Cookies();
export async function login(email, password) {
  const response = await http.post("/user/v1/signIn", { email, password });    
  if(response && response.data && response.data.status=='pass'){   
    
        cookies.set('token', response.data.token, { path: '/'});
        cookies.set('otp', response.data.otp, { path: '/'});
        // cookies.set('token', response.data.token, 
        //   { path: '/',
        //   maxAge: 3600000, // 1 hour
        //   secure: false, // set to true if you're using https
        //   httpOnly: true });
    http.setJwt(getJwt());
  }
  return response;
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export async function logout() {
  await http.post("/user/v1/signout");
  cookies.remove('token');
}

export function getCurrentUser() {
  try {
    const jwt = cookies.get('token');
    return jwtDecode(jwt);
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  const jwt = cookies.get('token');
  return jwt;
}

export async function verifyLoginOtp(otp) {
  const response = await http.post("/user/v1/verify", { "otp" : otp });  
  return response;
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
  verifyLoginOtp
};
