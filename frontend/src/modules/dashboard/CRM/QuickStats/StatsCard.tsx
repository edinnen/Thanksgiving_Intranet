import React, {ReactNode} from 'react';
import {Card, makeStyles} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface StatsCardProps {
  icon: ReactNode;
  bgColor: string;
  heading: any;
  data: {
    count: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  bgColor = '',
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
        <Box fontSize={{xs: 36, md: 48}} clone>
          <Avatar className={classes.root}>{icon}</Avatar>
        </Box>
        <Box ml={{xs: 3, xl: 6}}>
          <Box
            component='p'
            color='grey.500'
            mb={0}
            fontSize={{xs: 16, xl: 18}}>
            {heading}
          </Box>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            {data.count}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default StatsCard;
