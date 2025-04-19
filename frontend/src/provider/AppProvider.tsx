// src/providers/AppProvider.tsx
import { ThemeProvider } from "../context/ThemeContext";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

export default AppProvider;
