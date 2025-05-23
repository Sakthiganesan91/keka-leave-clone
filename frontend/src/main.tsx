import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "./context/auth.tsx";
import { ThemeProvider } from "./context/theme-provider.tsx";

const queryClient = new QueryClient();
const defaultTheme = "dark";
const storageKey = `vite-ui-theme`;

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme={defaultTheme} storageKey={storageKey}>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthContextProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
