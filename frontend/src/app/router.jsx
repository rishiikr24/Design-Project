import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFound } from './NotFound';

import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AssessmentPage } from '../features/assessment/AssessmentPage';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { RecommendationPage } from '../features/recommendation/RecommendationPage';
import { RiskPage } from '../features/risk/RiskPage';
import { PlannerPage } from '../features/planner/PlannerPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { CompanyPage } from '../features/company/CompanyPage';
import { AuthPage } from '../features/auth/AuthPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);
