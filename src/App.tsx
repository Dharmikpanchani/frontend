import "./assets/style/global.css";
import "./assets/style/global.responsive.css";
import { Toaster } from "react-hot-toast";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Router from "./routes";

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "var(--font-family, 'PlusJakartaSans', sans-serif)",
      fontWeight: "400",
      lineHeight: "normal",
    },
  },
  palette: {
    primary: {
      main: "#3a0000", // Fallback, but MUI will use the CSS variable more effectively if mapped
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "var(--button-radius, 5px)",
        },
        containedPrimary: {
          background: "var(--theme-gradient, var(--button-bg, #3a0000))",
          color: "var(--button-text, #ffffff)",
          transition: "all 0.3s ease",
          "&:hover": {
            opacity: 0.9,
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        popper: {
          zIndex: 'auto !important'
        }
      }
    }
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Toaster
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              maxWidth: "unset",
            },
          }}
        />
        <Router />
      </div>
    </ThemeProvider>
  );
}

export default App;
