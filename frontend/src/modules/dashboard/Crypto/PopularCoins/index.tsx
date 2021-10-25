import React from 'react';
import Card from '@material-ui/core/Card';
import PopularCoinsTable from './PopularCoinsTable';
import Link from '@material-ui/core/Link';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {Box, makeStyles} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {PopularCoinsData} from '../../../../types/models/Crypto';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface PopularCoinsProps {
  popularCoins: PopularCoinsData[];
}

const PopularCoins: React.FC<PopularCoinsProps> = ({popularCoins}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    textRes: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));

  const classes = useStyles();
  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box mb={4} display='flex' alignItems='center'>
          <Box
            component='h2'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.popularCoins' />
          </Box>
          <Box component='span' ml='auto'>
            <Link
              color='secondary'
              component='button'
              className={classes.textRes}
              underline='none'>
              <IntlMessages id='common.viewAll' />
            </Link>
          </Box>
        </Box>
        <PopularCoinsTable popularCoins={popularCoins} />
      </Card>
    </Box>
  );
};

export default PopularCoins;
