import React from 'react';

export const dashBoardConfigs = [
  {
    auth: ['auth'],
    routes: [
      {
        path: '/dashboards/historical',
        component: React.lazy(() => import('./Historical')),
      },
    ],
  },
  {
    auth: [],
    routes: [
      {
        path: '/dashboards/live',
        component: React.lazy(() => import('./Live')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/dashboards/crm',
        component: React.lazy(() => import('./CRM')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/dashboards/analytics',
        component: React.lazy(() => import('./Analytics')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/dashboards/crypto',
        component: React.lazy(() => import('./Crypto')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/dashboards/metrics2',
        component: React.lazy(() => import('./MetricsOld')),
      },
    ],
  },
  {
    auth: ['user'],
    routes: [
      {
        path: '/dashboards/widgets',
        component: React.lazy(() => import('./Widgets')),
      },
    ],
  },
];
