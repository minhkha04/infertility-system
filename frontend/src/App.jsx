import React, { useEffect } from "react";
import UseRoutesCustom from "./hooks/UseRoutesCustom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { Content } from "antd/es/layout/layout";
// 1.Khởi tạo 1 context
export const NotificationContext = React.createContext();
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
function App() {
  const routes = UseRoutesCustom();
  const queryClient = new QueryClient();
  const showNotification = (Content, type) => {
    toast[type](Content, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true, // chờ khi hover mouse
      progress: undefined,
      theme: "light",
      transition: Bounce, // hieu ung khi bien mat
    });
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <NotificationContext.Provider
          value={{
            showNotification: showNotification,
          }}
        >
          <ToastContainer />
          {routes}
        </NotificationContext.Provider>
      </QueryClientProvider>
    </>
  );
}

export default App;
