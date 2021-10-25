import React from 'react';
import {Card, makeStyles} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import {green, red} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CoinData} from '../../../../types/models/Crypto';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface CoinStatsProps {
  icon: string;
  bgColor: string;
  data: CoinData;
  heading: any;
}

const CoinStats: React.FC<CoinStatsProps> = ({
  icon,
  bgColor,
  data,
  heading,
}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    statsCard: {
      borderRadius: theme.overrides.MuiCardLg.root.borderRadius,
      padding: 12,
    },
    root: {
      height: 50,
      width: 50,
      backgroundColor: bgColor,
      [theme.breakpoints.up('md')]: {
        height: 60,
        width: 60,
      },
      [theme.breakpoints.up('lg')]: {
        height: 65,
        width: 65,
      },
      [theme.breakpoints.up('xl')]: {
        height: 85,
        width: 85,
      },
    },
  }));

  const classes = useStyles();

  return (
    <Card className={classes.statsCard}>
      <Box display='flex' alignItems='center'>
        <Box p={3} fontSize={{xs: 30, md: 48}} clone>
          <Avatar className={classes.root}>
            <img alt='' src={icon} />
          </Avatar>
        </Box>

        <Box position='relative' ml={{xs: 3, xl: 6}}>
          <Box
            component='p'
            fontSize={{xs: 16, xl: 18}}
            color='grey.500'
            mb={1}>
            {heading}
          </Box>
          <Box
            component='h3'
            display='inline-block'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            ${data.price}
          </Box>
          <Box
            component='span'
            ml={3}
            fontSize={{xs: 16, xl: 18}}
            fontFamily={Fonts.MEDIUM}
            color={data.increment > 0.0 ? green[500] : red[500]}>
            {data.increment}%
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CoinStats;
