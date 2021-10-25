export interface NavItemProps {
  id: string;
  messageId: string;
  title: string;
  icon?: string;
  url?: string;
  type?: string;
  count?: number;
  color?: string;
  children?: NavItemProps[] | NavItemProps;
}

const routesConfig: NavItemProps[] = [
  {
    id: 'app',
    title: 'Application',
    messageId: 'sidebar.application',
    type: 'group',
    children: [
      {
        id: 'dashboards',
        title: 'Dashboards',
        messageId: 'sidebar.app.dashboard',
        type: 'collapse',
        icon: 'dashboard',
        children: [
          {
            id: 'analytics',
            title: 'Analytics',
            messageId: 'sidebar.app.dashboard.analytics',
            type: 'item',
            url: '/dashboards/analytics',
          },
          {
            id: 'crm',
            title: 'CRM',
            messageId: 'sidebar.app.dashboard.crm',
            type: 'item',
            url: '/dashboards/crm',
          },
          {
            id: 'crypto',
            title: 'Crypto',
            messageId: 'sidebar.app.dashboard.crypto',
            type: 'item',
            url: '/dashboards/crypto',
          },
          {
            id: 'live',
            title: 'Live',
            messageId: 'sidebar.app.dashboard.live',
            type: 'item',
            url: '/dashboards/live',
          },
          {
            id: 'historical',
            title: 'Historical',
            messageId: 'sidebar.app.dashboard.historical',
            type: 'item',
            url: '/dashboards/historical',
          },
        ],
      },
      {
        id: 'metrics',
        title: 'Metrics',
        messageId: 'sidebar.app.metrics',
        type: 'item',
        icon: 'insert_chart',
        url: '/dashboards/metrics',
      },
      {
        id: 'widgets',
        title: 'Widgets',
        messageId: 'sidebar.app.widgets',
        type: 'item',
        icon: 'widgets',
        url: '/dashboards/widgets',
      },
    ],
  },
  {
    id: 'pages',
    title: 'Pages',
    messageId: 'sidebar.pages',
    type: 'group',
    children: [
      {
        id: 'error-pages',
        title: 'Error Pages',
        messageId: 'sidebar.pages.errorPages',
        type: 'collapse',
        icon: 'report',
        children: [
          {
            id: 'error-404',
            title: '404',
            messageId: 'sidebar.pages.errorPages.404',
            type: 'item',
            url: '/error-pages/error-404',
          },
          {
            id: 'error-500',
            title: '500',
            messageId: 'sidebar.pages.errorPages.500',
            type: 'item',
            url: '/error-pages/error-500',
          },
          {
            id: 'maintenance',
            title: 'Maintenance',
            messageId: 'sidebar.pages.errorPages.maintenance',
            type: 'item',
            url: '/error-pages/maintenance',
          },
          {
            id: 'coming-soon',
            title: 'Coming Soon',
            messageId: 'sidebar.pages.errorPages.comingSoon',
            type: 'item',
            url: '/error-pages/coming-soon',
          },
        ],
      },
    ],
  },
];
export default routesConfig;
