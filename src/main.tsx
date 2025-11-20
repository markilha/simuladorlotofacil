import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SimpleSimulatorPage from './pages/SimpleSimulatorPage';
import FixedNumbersSimulatorPage from './pages/FixedNumbersSimulatorPage';
import ResultsPage from './pages/ResultsPage';
import ConfigPage from './pages/ConfigPage';
import MainLayout from './layouts/MainLayout';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <SimpleSimulatorPage />,
      },
      {
        path: 'fixos',
        element: <FixedNumbersSimulatorPage />,
      },
      {
        path: 'resultados',
        element: <ResultsPage />,
      },
      {
        path: 'config',
        element: <ConfigPage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
