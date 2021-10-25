import Card from '@material-ui/core/Card';
import Link from '@material-ui/core/Link';
import React from 'react';
import SocialVisitorsGraph from './SocialVisitorsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Categories from './Categories';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {SocialVisitorsData} from '../../../../types/models/Metrics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface SocialVisitorsProps {
  data: SocialVisitorsData[];
}

const SocialVisitors: React.FC<SocialVisitorsProps> = ({data}) => {
  const useStyle = makeStyles((theme: CremaTheme) => ({
    textLink: {
      fontSize: 16,
      marginTop: 8,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    graphText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));
  const classes = useStyle();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box mb={5} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontSize={{xs: 18, sm: 20, xl: 22}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='dashboard.socialVisitors' />
          </Box>

          <Box component='span' ml='auto'>
            <Link
              color='secondary'
              component='button'
              className={classes.textLink}
              underline='none'>
              <IntlMessages id='common.viewAll' />
            </Link>
          </Box>
        </Box>

        <SocialVisitorsGraph data={data} />

        <Categories data={data} />
      </Card>
    </Box>
  );
};

export default SocialVisitors;
