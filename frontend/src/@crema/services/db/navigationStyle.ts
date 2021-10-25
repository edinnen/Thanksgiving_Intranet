import {LayoutType, NavStyle} from '../../../shared/constants/AppEnums';

export const navStyles = [
  {
    id: 2,
    alias: NavStyle.STANDARD,
    image: require('assets/images/navigationStyle/nav4.png'),
  },
  {
    id: 1,
    alias: NavStyle.DEFAULT,
    image: require('assets/images/navigationStyle/nav2.png'),
  },
  {
    id: 9,
    alias: NavStyle.HEADER_USER,
    image: require('assets/images/navigationStyle/nav9.png'),
  },
  {
    id: 10,
    alias: NavStyle.HEADER_USER_MINI,
    image: require('assets/images/navigationStyle/nav10.png'),
  },
  {
    id: 3,
    alias: NavStyle.MINI,
    image: require('assets/images/navigationStyle/nav3.png'),
  },
  {
    id: 4,
    alias: NavStyle.DRAWER,
    image: require('assets/images/navigationStyle/nav5.png'),
  },
  {
    id: 5,
    alias: NavStyle.BIT_BUCKET,
    image: require('assets/images/navigationStyle/nav1.png'),
  },
  {
    id: 6,
    alias: NavStyle.H_DEFAULT,
    image: require('assets/images/navigationStyle/nav8.png'),
  },
  {
    id: 7,
    alias: NavStyle.HOR_LIGHT_NAV,
    image: require('assets/images/navigationStyle/nav6.png'),
  },
  {
    id: 8,
    alias: NavStyle.HOR_DARK_LAYOUT,
    image: require('assets/images/navigationStyle/nav7.png'),
  },
];

export const layoutTypes = [
  {
    id: 1,
    alias: LayoutType.FULL_WIDTH,
    image: require('assets/images/layouts/full width.png'),
  },
  {
    id: 2,
    alias: LayoutType.BOXED,
    image: require('assets/images/layouts/boxed.png'),
  },
];
