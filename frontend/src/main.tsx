// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import { Toaster } from "sonner";
// import App from "./App.tsx";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <Toaster position="top-right" richColors />

//     <App />
//   </StrictMode>
// );
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AppProvider from "./provider/AppProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppProvider>
        <Toaster position="top-right" richColors />
        <App />
      </AppProvider>
    </Provider>
  </StrictMode>
);