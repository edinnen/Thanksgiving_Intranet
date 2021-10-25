import React from 'react';
import {Card} from '@material-ui/core';
import WorkViewsGraph from './WorkViewsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {WorkViewsData} from '../../../../types/models/Metrics';

interface WorkViewsProps {
  data: WorkViewsData;
}

const WorkViews: React.FC<WorkViewsProps> = ({data}) => {
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
          color='secondary.main'
          fontSize={{xs: 18, sm: 20, xl: 22}}
          fontFamily={Fonts.LIGHT}>
          {data.views}
        </Box>
        <Box
          component='p'
          color='grey.500'
          fontSize={{xs: 16, xl: 18}}
          fontFamily={Fonts.REGULAR}>
          <IntlMessages id='dashboard.workViews' />
        </Box>

        <Box mt='auto'>
          <WorkViewsGraph data={data.graphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default WorkViews;
