import React from 'react';
import { Box, Card, makeStyles } from '@material-ui/core';
import { Fonts } from '../../../shared/constants/AppEnums';
import { CremaTheme } from '../../../types/AppContextPropsType';

interface TemperatureCardProps {
  temperature: number;
  title: string;
  color: string;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({temperature, title, color}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    pointer: {
      cursor: 'pointer',
    },
    block: {
      display: 'block',
    },
    textBase: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    textXl: {
      fontSize: 24,
      [theme.breakpoints.up('sm')]: {
        fontSize: 36,
      },
      [theme.breakpoints.up('md')]: {
        fontSize: 64,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 96,
      },
    },
    marginRight: {
      marginRight: 12,
    },
  }));

  const classes = useStyles();
  return (
    <Box display='flex' flexDirection='column' height='1' clone>
      <Card>
        <Box
          py={{xs: 5, sm: 5, xl: 5}}
          px={{xs: 6, sm: 6, xl: 6}}
          color='primary.contrastText'
          flex={1}
          bgcolor={color}
          display='flex'
          flexDirection='column'>
          <Box display='flex' alignItems='center'>
            <Box
              component='h3'
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              {title}
            </Box>
          </Box>

          <Box
            py={4}
            flex={1}
            display='flex'
            alignItems='center'
            justifyContent='center'
            flexDirection='column'
            textAlign='center'>
            <Box
              component='h1'
              fontFamily={Fonts.LIGHT}
              className={classes.textXl}>
              {temperature}°
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default TemperatureCard;
