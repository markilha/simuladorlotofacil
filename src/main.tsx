import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SimpleSimulatorPage from "./pages/SimpleSimulatorPage";
import FixedNumbersSimulatorPage from "./pages/FixedNumbersSimulatorPage";
import ResultsPage from "./pages/ResultsPage";
import ConfigPage from "./pages/ConfigPage";
import StrategyLabPage from "./pages/StrategyLabPage";
import HelpPage from "./pages/HelpPage";
import MainLayout from "./layouts/MainLayout";
import ImpressaoVolantePage from "./pages/ImpressaoVolantePage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SimpleSimulatorPage />,
      },
      {
        path: "fixos",
        element: <FixedNumbersSimulatorPage />,
      },
      {
        path: "resultados",
        element: <ResultsPage />,
      },
      {
        path: "estrategias",
        element: <StrategyLabPage />,
      },
      {
        path: "config",
        element: <ConfigPage />,
      },
      {
        path: "ajuda",
        element: <HelpPage />,
      },
      {
        path: "impressao-volante",
        element: <ImpressaoVolantePage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
