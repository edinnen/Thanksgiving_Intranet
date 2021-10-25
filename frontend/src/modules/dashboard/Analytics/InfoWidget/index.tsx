import React from 'react';
import AppCard from '../../../../@crema/core/AppCard';
import {Box} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {InfoWidgets} from '../../../../types/models/Analytics';

interface Props {
  data: InfoWidgets;
}

const InfoWidget: React.FC<Props> = ({data}) => {
  return (
    <AppCard px={2} height={1} style={{backgroundColor: data.bgColor}}>
      <Box
        display='flex'
        flexDirection='column'
        flex={1}
        alignItems='center'
        justifyContent='center'>
        <Box mb={2}>
          <img src={data.icon} alt='icon' style={{height: 70, width: 'auto'}} />
        </Box>
        <Box textAlign='center'>
          <Box
            color='white'
            component='h3'
            mt={2}
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 16, sm: 18, xl: 20}}>
            {data.count}
          </Box>
          <Box color='white'>{data.details}</Box>
        </Box>
      </Box>
    </AppCard>
  );
};

export default InfoWidget;
