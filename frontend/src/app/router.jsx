import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AssessmentPage } from '../features/assessment/AssessmentPage';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { RecommendationPage } from '../features/recommendation/RecommendationPage';
import { RiskPage } from '../features/risk/RiskPage';
import { PlannerPage } from '../features/planner/PlannerPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { CompanyPage } from '../features/company/CompanyPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { HealthPage } from '../features/health/HealthPage';

export const router = createBrowserRouter([
  // Redirect legacy /login directly into the application
  {
    path: '/login',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/health',
    element: <HealthPage />
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'assessment',
        element: <AssessmentPage />
      },
      {
        path: 'catalog',
        element: <CatalogPage />
      },
      {
        path: 'recommendation',
        element: <RecommendationPage />
      },
      {
        path: 'risk',
        element: <RiskPage />
      },
      {
        path: 'planner',
        element: <PlannerPage />
      },
      {
        path: 'assistant',
        element: <AssistantPage />
      },
      {
        path: 'company',
        element: <CompanyPage />
      },
      {
        path: 'reports',
        element: <ReportsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
