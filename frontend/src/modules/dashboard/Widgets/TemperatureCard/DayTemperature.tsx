import React from 'react';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {Temperatures} from '../../../../types/models/Widgets';

interface DayTemperatureProps {
  day: Temperatures;
}

const DayTemperature: React.FC<DayTemperatureProps> = ({day}) => {
  const useStyles = makeStyles(() => ({
    textUppercase: {
      textTransform: 'uppercase',
    },
  }));

  const classes = useStyles();
  return (
    <Box px={4} textAlign='center'>
      <Box
        component='span'
        mb={3}
        display='block'
        fontFamily={Fonts.LIGHT}
        fontSize={{xs: 16, xl: 18}}
        className={classes.textUppercase}>
        {day.day}
      </Box>
      <Box display='inline-block'>
        <img src={day.image} alt='weather' />
      </Box>
    </Box>
  );
};

export default DayTemperature;
