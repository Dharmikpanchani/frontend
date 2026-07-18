import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { store } from "./redux/Store";
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(
  document.getElementById("lhn_v1") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
