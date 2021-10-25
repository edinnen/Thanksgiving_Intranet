import React from 'react';
import Card from '@material-ui/core/Card';
import NewsList from './NewsList';
import Link from '@material-ui/core/Link';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {Box, makeStyles} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {NewsData} from '../../../../types/models/Crypto';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface LatestNewsProps {
  newsData: NewsData[];
}

const LatestNews: React.FC<LatestNewsProps> = ({newsData}) => {
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
    <Box
      py={{xs: 4, sm: 6, xl: 6}}
      px={{xs: 6, sm: 8, xl: 10}}
      height='1'
      clone>
      <Card>
        <Box mb={2} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.latestNews' />
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
        <NewsList newsData={newsData} />
      </Card>
    </Box>
  );
};

export default LatestNews;
