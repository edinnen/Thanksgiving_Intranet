import React from 'react';
import {Card, makeStyles} from '@material-ui/core';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import ReviewItem from './ReviewItem';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ReviewsList} from '../../../../types/models/Widgets';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface ReviewsProps {
  data: ReviewsList[];
}

const Reviews: React.FC<ReviewsProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    reviewsList: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
      '&:not(:last-child)': {
        marginBottom: 16,
      },
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={5}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='common.reviews' />
        </Box>
        {data.map((item) => {
          return <ReviewItem key={item.id} item={item} classes={classes} />;
        })}
      </Card>
    </Box>
  );
};

export default Reviews;
