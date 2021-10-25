import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ProtoTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../shared/constants/AppEnums';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
  },
  circularProgressRoot: (props: any) => ({
    color: props.pathColor,
    width: '100% !important',
    height: '100% !important',
  }),
  circularProgressPrimary: (props: any) => ({
    color: props.activeColor,
    animationDuration: '550ms',
    position: 'absolute',
    left: 2,
    top: -2,
    width: '100% !important',
    height: '100% !important',
  }),
  textRoot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 3,
    fontFamily: Fonts.EXTRA_BOLD,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface AppCircularProgressProps {
  pathColor?: string;
  activeColor?: string;
  value: number;
  hidePercentage?: boolean;
  valueStyle?: any;
  thickness?: number;
  props?: any;
}

const AppCircularProgress: React.FC<AppCircularProgressProps> = ({
  pathColor,
  activeColor,
  value,
  hidePercentage,
  valueStyle,
  thickness,
  ...props
}) => {
  const classes = useStyles({pathColor, activeColor});

  return (
    <Box className={classes.root}>
      <CircularProgress
        variant='static'
        value={100}
        className={classes.circularProgressRoot}
        thickness={thickness}
        {...props}
      />
      <CircularProgress
        className={classes.circularProgressPrimary}
        variant='static'
        value={value}
        thickness={thickness}
        {...props}
      />
      {hidePercentage ? null : (
        <Box
          className={classes.textRoot}
          fontSize={30}
          fontWeight={500}
          color='secondary.main'
          style={valueStyle}>
          {value}%
        </Box>
      )}
    </Box>
  );
};
export default AppCircularProgress;
AppCircularProgress.prototype = {
  hidePercentage: ProtoTypes.bool,
  pathColor: ProtoTypes.string,
  activeColor: ProtoTypes.string,
  value: ProtoTypes.number,
  thickness: ProtoTypes.number,
  valueStyle: ProtoTypes.object,
};

AppCircularProgress.defaultProps = {
  hidePercentage: false,
  pathColor: '#d6d6d6',
  activeColor: '#23fa23',
  thickness: 10,
};
