import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <GoogleOAuthProvider
      clientId={
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "44768809191-06o2cddv0gci0rtf28cibp0042qat62j.apps.googleusercontent.com"
      }
    >
      <App />
    </GoogleOAuthProvider>

  </React.StrictMode>
);

