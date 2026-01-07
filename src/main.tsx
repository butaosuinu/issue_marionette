import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { I18nProvider } from "@lingui/react";
import { routeTree } from "./routeTree.gen";
import { i18n } from "./i18n";
import "./index.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Module augmentation requires interface
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.querySelector("#root");
if (rootElement !== null) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <I18nProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nProvider>
    </React.StrictMode>
  );
}
