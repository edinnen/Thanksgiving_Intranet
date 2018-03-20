const sm = 768;

const md = 992;

const lg = 1200;

const breakpoints = {
  xs: { min: 0, max: sm - 1 },
  sm: { min: sm, max: md - 1 },
  md: { min: md, max: lg - 1 },
  lg: { min: lg, max: 100000 },
};

export default {
  primaryBlue: '#005EB8',
  lightBlue: '#64A5C3',
  blueGrey: '#6A7B83',
  seaGreen: '#00B398',
  orange: '#F59F4F',
  rescueRed: '#D44E4E',
  apple: '#8FBA60',
  lilac: '#7E57C1',
  lightBlueGrey: '#B2BEC4',
  iceBlue: '#E9EEF6',
  paleBlueGrey: '#FAFBFD',
  grey: '#4D4D4D',
  lightGrey: '#8D8D8D',

  breakpoints,
  bps: breakpoints,
};
