import React from 'react';

export const dashBoardConfigs = [
  {
    auth: ['auth'],
    routes: [
      {
        path: '/historical',
        component: React.lazy(() => import('./Historical')),
      },
    ],
  },
  {
    auth: [],
    routes: [
      {
        path: '/live',
        component: React.lazy(() => import('./Live')),
      },
    ],
  },
];
