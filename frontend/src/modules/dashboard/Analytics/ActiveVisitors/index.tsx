import React from 'react';
import {Card} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import VisitorsGraph from './VisitorsGraph';
import {green, red} from '@material-ui/core/colors';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {useIntl} from 'react-intl';
import {ActiveVisitorsProps} from '../../../../types/models/Analytics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => ({
  root: {
    color: theme.palette.secondary.main,
    fontSize: 18,
    marginTop: 6,
    [theme.breakpoints.up('xl')]: {
      fontSize: 20,
      marginTop: 16,
    },
  },
}));

interface Props {
  data: ActiveVisitorsProps;
}

const ActiveVisitors: React.FC<Props> = ({data}) => {
  const classes = useStyles();
  const {messages} = useIntl();
  return (
    <Box p={0} clone>
      <Card>
        <Box pt={{xs: 5, sm: 5, xl: 5}} bgcolor='#49bd65'>
          <Box px={{xs: 6, sm: 6, xl: 6}}>
            <Box
              component='h3'
              color='#FFFFFF'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              {messages['dashboard.analytics.activeVisitors']}
            </Box>
            <Box color='#FFF8'>
              {messages['dashboard.analytics.pageViewPerMinutes']}
            </Box>
          </Box>
          <Box mt='auto'>
            <VisitorsGraph data={data.graphData} />
          </Box>
        </Box>
        <Box
          py={{xs: 5, sm: 5, xl: 5}}
          px={{xs: 6, sm: 6, xl: 6}}
          bgcolor='#FFF'>
          <Box position='relative'>
            <Box>
              <Box
                component='h3'
                display='inline-block'
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 18, sm: 20, xl: 22}}>
                {data.value}
              </Box>
              <Box
                component='span'
                ml={3}
                fontSize={{xs: 16, xl: 18}}
                fontFamily={Fonts.MEDIUM}
                color={data.growth > 0.0 ? green[500] : red[500]}>
                {data.growth}% Then yesterday
              </Box>
            </Box>
            <Box
              component='p'
              fontSize={{xs: 16, xl: 18}}
              color='grey.500'
              mb={1}>
              {data.slug}
            </Box>
          </Box>
          <Box textAlign='right'>
            <Link component='button' className={classes.root} underline='none'>
              View Report
            </Link>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ActiveVisitors;
