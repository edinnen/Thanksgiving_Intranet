import React from 'react';
import {Card} from '@material-ui/core';
import GoalProgressGraph from './GoalProgressGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ProgressGraphData} from '../../../../types/models/CRM';

interface GoalProgressProps {
  progressGraphData: ProgressGraphData[];
}

const GoalProgress: React.FC<GoalProgressProps> = ({progressGraphData}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      display='flex'
      height='1'
      clone>
      <Card>
        <Box width={1}>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.goalProgress' />
          </Box>
          <GoalProgressGraph progressGraphData={progressGraphData} />
          <Box mt={5} px={2} mb={1} display='flex' alignItems='center'>
            <Box display='flex' alignItems='center'>
              <Box
                component='span'
                height={{xs: 12, xl: 16}}
                width={{xs: 12, xl: 16}}
                mr={2}
                borderRadius='50%'
                bgcolor='primary.main'
              />
              <Box component='span' fontSize={{xs: 16, xl: 18}}>
                <IntlMessages id='dashboard.inProgress' />
              </Box>
            </Box>
            <Box ml='auto' display='flex' alignItems='center'>
              <Box
                component='span'
                height={{xs: 12, xl: 16}}
                width={{xs: 12, xl: 16}}
                mr={2}
                borderRadius='50%'
                bgcolor='error.main'
              />
              <Box component='span' fontSize={{xs: 16, xl: 18}}>
                <IntlMessages id='common.actual' />
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default GoalProgress;
