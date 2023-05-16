import axios from "axios";
import { toast } from "react-toastify";
import cookies from "./cookiesService";

axios.interceptors.response.use(null, error => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;
  
  if (!expectedError) {
    toast.error("An unexpected error occurrred.");
  }
  else if (error.response.status === 401){
    toast.error("Unauthorized access");    
    if(!cookies.get('token'))
      window.location = "/login";
  }  
  return Promise.reject(error);
});

function setJwt(jwt) {
  axios.defaults.headers.common["x-auth-token"] = jwt;
  axios.defaults.headers.common["Authorization"] = jwt;
}
function setCSRF(){
  axios.defaults.headers.common["X-CSRF-TOKEN"] = cookies.get('csrf');;
}
// Add a request interceptor
axios.interceptors.request.use(function (config) {
  let token = cookies.get('token');
  if(!token)
    token = cookies.get('verify-token');

  config.headers.Authorization =  token;
  return config;
});

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt,
  setCSRF

};
