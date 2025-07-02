import { createRoot } from "react-dom/client";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <ToastContainer theme="dark" />
      <App />
  </RecoilRoot>
);
