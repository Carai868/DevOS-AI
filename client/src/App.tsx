/**
 * App.tsx — PyRunner IDE root
 * Design: Brutalist Terminal Aesthetic — always dark
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { IDEProvider } from "./contexts/IDEContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <IDEProvider>
          <TooltipProvider>
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "#141414",
                  border: "1px solid #2A2A2A",
                  color: "#E8E8E8",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  borderRadius: 0,
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </IDEProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
