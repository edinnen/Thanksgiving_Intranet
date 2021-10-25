import React from 'react';
import {Card} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface StatsCardSecondProps {
  icon: string;
  bgColor: string;
  text: any;
  value: string;
}

const StatsCardSecond: React.FC<StatsCardSecondProps> = ({
  icon,
  bgColor,
  text,
  value,
}) => {
  const useStyle = makeStyles((theme: CremaTheme) => ({
    avatarStyle: {
      padding: 12,
      display: 'flex',
      marginBottom: 16,
      marginLeft: 'auto',
      marginRight: 'auto',
      height: 60,
      width: 60,
      backgroundColor: bgColor,
      [theme.breakpoints.up('md')]: {
        height: 80,
        width: 80,
      },
      [theme.breakpoints.up('lg')]: {
        height: 90,
        width: 90,
      },
      [theme.breakpoints.up('xl')]: {
        marginBottom: 32,
        height: 130,
        width: 130,
      },
    },
  }));
  const classes = useStyle();
  return (
    <Box textAlign='center' p={{xs: 4, sm: 5, lg: 6, xl: 8}} height={1} clone>
      <Card>
        <Avatar className={classes.avatarStyle}>
          <img src={icon} alt='' />
        </Avatar>
        <Box
          component='h3'
          mb={2}
          fontSize={{xs: 18, sm: 20, xl: 22}}
          fontFamily={Fonts.LIGHT}>
          {value}
        </Box>
        <Box component='p' mb={2} color='grey.400' fontSize={{xs: 16, xl: 18}}>
          {text}
        </Box>
      </Card>
    </Box>
  );
};

export default StatsCardSecond;
