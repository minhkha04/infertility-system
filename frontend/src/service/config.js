import axios from "axios";

//setup axios custom xử lí gọi API cho dự án
const http = axios.create({
  baseURL: "https://techleaf.pro/infertility-system/api/", // domain
  timeout: 30000,
  headers: {},
});

// Add a request
http.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (config.skipAuth) {
      return config;
    }
    // lay token tu local
    const token = localStorage.getItem("token");
    if (token) {
      const newToken = JSON.parse(token);
      config.headers.Authorization = "Bearer " + newToken;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
http.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export { http };
