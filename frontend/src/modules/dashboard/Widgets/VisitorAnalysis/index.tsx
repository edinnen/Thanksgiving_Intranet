import React from 'react';
import {Box, Card, makeStyles} from '@material-ui/core';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Typography from '@material-ui/core/Typography';
import {Fonts} from '../../../../shared/constants/AppEnums';
import AppCircularProgress from '../../../../@crema/core/AppCircularProgress';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface VisitorAnalysisProps {}

const VisitorAnalysis: React.FC<VisitorAnalysisProps> = () => {
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
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={4}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.visitorAnalysis' />
        </Box>
        <Box mb={6} p={{xs: 5, lg: 10}} py={{xl: 12}} px={{xl: 16}}>
          <AppCircularProgress activeColor='#F04F47' value={59} thickness={2} />
        </Box>
        <Box color='grey.500' display='flex'>
          <Box
            bgcolor='secondary.main'
            height={{xs: 12, xl: 16}}
            width={{xs: 12, xl: 16}}
            mr={4}
            mt={2}
            borderRadius='50%'
          />
          <Box flex={1}>
            <Typography className={classes.textBase}>
              <IntlMessages id='dashboard.visitorAnalysisContent' />
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default VisitorAnalysis;
