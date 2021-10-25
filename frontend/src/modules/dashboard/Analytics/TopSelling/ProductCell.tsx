import React from 'react';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {makeStyles} from '@material-ui/core';
import AppCircularProgress from '../../../../@crema/core/AppCircularProgress';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Hidden from '@material-ui/core/Hidden';
import {TopSellingProduct} from '../../../../types/models/Analytics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface ProductCellProps {
  data: TopSellingProduct;
}

const ProductCell: React.FC<ProductCellProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    root: {
      [theme.breakpoints.up('lg')]: {
        alignItems: 'center',
      },
    },
    statsCard: {
      borderRadius: theme.overrides.MuiCardLg.root.borderRadius,
      padding: 12,
    },
    logo: {
      height: 70,
      width: 70,
      borderRadius: 10,
      overflow: 'hidden',
    },
  }));

  const classes = useStyles();
  return (
    <Box key={data.id} display='flex' alignItems='center' my={{xs: 3, md: 4}}>
      <Box display='flex'>
        <img className={classes.logo} alt='' src={data.icon} />

        <Box flex={1} ml={{xs: 3, md: 4, xl: 6}}>
          <Box
            component='h3'
            color='primary.main'
            display='inline-block'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 16, xl: 18}}>
            {data.name}
          </Box>
          <Box
            component='p'
            fontSize={{xs: 14, xl: 16}}
            color='grey.500'
            mb={1}>
            {data.description}
          </Box>
          <Box
            component='p'
            fontSize={{xs: 16, xl: 18}}
            fontFamily={Fonts.LIGHT}>
            ${data.price}
          </Box>
        </Box>
      </Box>
      <Hidden xsDown>
        <Box
          ml='auto'
          display='flex'
          alignItems='center'
          justifyContent='flex-end'>
          <Box height={50} width={50}>
            <AppCircularProgress
              activeColor={data.color}
              thickness={4}
              hidePercentage
              value={data.rate}
            />
          </Box>
          <Box display='flex' alignItems='center' ml={2} mr={-2} p={2} pr={0}>
            <Box>
              <Box color='grey.500'>Sales</Box>
              <Box>{data.rate}%</Box>
            </Box>
            <Box ml={2} color='grey.400'>
              <NavigateNextIcon />
            </Box>
          </Box>
        </Box>
      </Hidden>
    </Box>
  );
};

export default ProductCell;
