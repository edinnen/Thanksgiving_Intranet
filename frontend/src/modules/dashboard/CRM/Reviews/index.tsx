import React from 'react';
import Card from '@material-ui/core/Card';
import ReviewsGraph from './ReviewsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {green, teal} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ReviewGraphData} from '../../../../types/models/CRM';

interface ReviewsProps {
  reviewGraphData: ReviewGraphData[];
}

const Reviews: React.FC<ReviewsProps> = ({reviewGraphData}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      style={{backgroundColor: teal[600], color: 'white'}}
      clone>
      <Card>
        <Box display='flex'>
          <Box>
            <Box
              mb={1}
              component='h3'
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              <IntlMessages id='common.reviews' />
            </Box>
            <Box
              component='h4'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, xl: 24}}
              color={green[300]}>
              34,042
            </Box>

            <Box fontSize={14}>
              <IntlMessages id='dashboard.reviewText' />
            </Box>
          </Box>
        </Box>
        <Box mb={-16}>
          <ReviewsGraph reviewGraphData={reviewGraphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default Reviews;
