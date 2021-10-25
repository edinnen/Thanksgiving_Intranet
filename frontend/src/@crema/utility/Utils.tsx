import {useMediaQuery, useTheme} from '@material-ui/core';

export const useBreakPointDown = (key: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(key));
};

export const createRoutes = (routeConfigs: any[]) => {
  let allRoutes: any[] = [];
  routeConfigs.forEach((config) => {
    allRoutes = [...allRoutes, ...setRoutes(config)];
  });
  return allRoutes;
};

export const setRoutes = (config: any) => {
  let routes = [...config.routes];
  if (config.auth) {
    routes = routes.map((route) => {
      let auth = route.auth
        ? [...config.auth, ...route.auth]
        : [...config.auth];
      return {...route, auth};
    });
  }

  return [...routes];
};
export const getBreakPointsValue = (valueSet: any, breakpoint: string) => {
  if (typeof valueSet === 'number') return valueSet;
  switch (breakpoint) {
    case 'xs':
      return valueSet.xs;
    case 'sm':
      return valueSet.sm || valueSet.xs;
    case 'md':
      return valueSet.md || valueSet.sm || valueSet.xs;
    case 'lg':
      return valueSet.lg || valueSet.md || valueSet.sm || valueSet.xs;
    default:
      return (
        valueSet.xl || valueSet.lg || valueSet.md || valueSet.sm || valueSet.xs
      );
  }
};
