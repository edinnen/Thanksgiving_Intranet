import React from 'react';
import {Card} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import Slider from '@material-ui/core/Slider';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';

const AirbnbSlider = withStyles({
  root: {
    color: '#E53E3E',
    height: 10,
    padding: '13px 0',
  },
  thumb: {
    height: 27,
    width: 27,
    backgroundColor: '#fff',
    border: '1px solid currentColor',
    marginTop: -10,
    marginLeft: -13,
    boxShadow: '#ebebeb 0px 2px 2px',
    '&:focus,&:hover,&$active': {
      boxShadow: '#ccc 0px 2px 3px 1px',
    },
    '& .bar': {
      // display: inline-block !important;
      height: 9,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 10,
  },
  rail: {
    color: '#d8d8d8',
    opacity: 1,
    height: 10,
    borderRadius: 6,
  },
})(Slider);

function AirbnbThumbComponent(props: any) {
  return (
    <Box component='span' {...props}>
      <Box component='span' className='bar' />
      <Box component='span' className='bar' />
      <Box component='span' className='bar' />
    </Box>
  );
}

interface PriceProps {}

const Price: React.FC<PriceProps> = () => {
  const [value, setValue] = React.useState([20, 37]);

  const handleChange = (
    event: React.ChangeEvent<{}>,
    value: number | number[],
  ) => {
    if (Array.isArray(value)) setValue(value);
  };

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} clone>
      <Card>
        <Box
          component='h3'
          mb={{xs: 2, md: 6}}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.price' />
        </Box>

        <Box>
          <Box
            component='p'
            color='grey.700'
            fontFamily={Fonts.LIGHT}
            fontSize={{
              xs: 18,
              xl: 20,
            }}>{`$${value[0]}mi - $${value[1]}mi`}</Box>

          <AirbnbSlider
            ThumbComponent={AirbnbThumbComponent}
            defaultValue={value}
            onChange={handleChange}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Price;
