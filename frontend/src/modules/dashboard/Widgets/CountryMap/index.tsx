import React from 'react';
import {Box, Card, makeStyles} from '@material-ui/core';
import MapChart from './MapChart';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Link from '@material-ui/core/Link';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface CountryMapProps {}

const CountryMap: React.FC<CountryMapProps> = () => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    textBase: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));

  const classes = useStyles();
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height='1'
      display='flex'
      flexDirection='column'
      clone>
      <Card>
        <Box mb={8} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontSize={{xs: 18, sm: 20, xl: 22}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='dashboard.usa' />
          </Box>
          <Box ml='auto'>
            <Link
              color='secondary'
              component='button'
              className={classes.textBase}
              underline='none'>
              <IntlMessages id='common.next' />
            </Link>
          </Box>
        </Box>
        <Box
          flex={1}
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'>
          <MapChart />
        </Box>
      </Card>
    </Box>
  );
};

export default CountryMap;
