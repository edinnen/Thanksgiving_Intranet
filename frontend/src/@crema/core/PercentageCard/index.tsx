import React from 'react';
import { Box, Card } from '@material-ui/core';
import { Fonts } from '../../../shared/constants/AppEnums';
import AppCircularProgress from '../AppCircularProgress';

interface PercentageCardProps {
  title: string;
  percentage: number;
}

const PercentageCard: React.FC<PercentageCardProps> = ({ title, percentage }) => {

  return (
    <Box py={{ xs: 5, sm: 5, xl: 5 }} px={{ xs: 6, sm: 6, xl: 6 }} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={4}
          fontFamily={Fonts.LIGHT}
          fontSize={{ xs: 18, sm: 20, xl: 22 }}>
          {title}
        </Box>
        <Box mb={6} p={{ xs: 5, lg: 10 }} py={{ xl: 12 }} px={{ xl: 16 }}>
          <AppCircularProgress activeColor='#F04F47' value={percentage} thickness={2} />
        </Box>
      </Card>
    </Box>
  );
};

export default PercentageCard;
