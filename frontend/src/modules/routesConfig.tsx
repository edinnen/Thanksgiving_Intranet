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
        id: 'live',
        title: 'Live',
        messageId: 'sidebar.app.dashboard.live',
        type: 'item',
        icon: 'insert_chart',
        url: '/live',
      },
      {
        id: 'historical',
        title: 'Historical',
        messageId: 'sidebar.app.dashboard.historical',
        type: 'item',
        icon: 'history',
        url: '/historical',
      },
      {
        id: 'log',
        title: 'Logbook',
        messageId: 'sidebar.app.dashboard.logbook',
        type: 'item',
        icon: 'auto_stories',
        url: '/log',
      },
    ],
  },
];
export default routesConfig;
