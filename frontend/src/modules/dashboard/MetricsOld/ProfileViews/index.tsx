import React from 'react';
import {Card} from '@material-ui/core';
import ProfileViewsGraph from './ProfileViewsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ProfileViewsData} from '../../../../types/models/Metrics';

interface ProfileViewsProps {
  data: ProfileViewsData;
}

const ProfileViews: React.FC<ProfileViewsProps> = ({data}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height={1}
      display='flex'
      flexDirection='column'
      clone>
      <Card>
        <Box
          component='h3'
          mb={1}
          color='text.primary'
          fontSize={{xs: 18, sm: 20, xl: 22}}
          fontFamily={Fonts.LIGHT}>
          {data.views}
        </Box>
        <Box
          component='p'
          color='grey.500'
          fontSize={{xs: 16, xl: 18}}
          fontFamily={Fonts.REGULAR}>
          <IntlMessages id='dashboard.profileViews' />
        </Box>
        <Box mt='auto'>
          <ProfileViewsGraph data={data.graphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default ProfileViews;
