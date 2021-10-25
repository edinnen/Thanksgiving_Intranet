import React from 'react';
import Card from '@material-ui/core/Card';
import WebTrafficGraph from './WebTrafficGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {blue, red} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {WebsiteTrafficData} from '../../../../types/models/CRM';

interface WebTrafficProps {
  websiteTrafficData: WebsiteTrafficData[];
}

const WebTraffic: React.FC<WebTrafficProps> = ({websiteTrafficData}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      mb={{xs: 5, md: 8}}
      clone>
      <Card>
        <Box
          component='h3'
          mb={3}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.websiteTraffic' />
        </Box>
        <WebTrafficGraph websiteTrafficData={websiteTrafficData} />
        <Box pt={4} mb={1} display='flex' justifyContent='space-between'>
          <Box>
            <Box
              component='h4'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, xl: 24}}
              color={red[500]}>
              1,265
            </Box>
            <Box component='p' fontSize={{xs: 16, xl: 18}} color='grey.500'>
              <IntlMessages id='common.subscribers' />
            </Box>
          </Box>
          <Box color='grey.400' pt={2} fontSize={{xs: 18, xl: 24}}>
            2019
          </Box>
          <Box>
            <Box
              component='h4'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, xl: 24}}
              color={blue[400]}>
              12,432
            </Box>
            <Box component='p' fontSize={{xs: 16, xl: 18}} color='grey.500'>
              <IntlMessages id='common.newUsers' />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default WebTraffic;
