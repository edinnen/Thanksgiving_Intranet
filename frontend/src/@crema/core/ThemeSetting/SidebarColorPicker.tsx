import React, {useContext, useState} from 'react';
import {SketchPicker} from 'react-color';
import {makeStyles} from '@material-ui/core/index';
import Box from '@material-ui/core/Box';
import AppContext from '../../utility/AppContext';
import {CremaTheme} from '../../../types/AppContextPropsType';
import {grey} from '@material-ui/core/colors';

interface SidebarColorPickerProps {
  props?: any;
}

const SidebarColorPicker: React.FC<SidebarColorPickerProps> = (props) => {
  const [visible, setVisibility] = useState(false);
  const {theme, sidebarColor, updateTheme, updateSidebarColor} = useContext(
    AppContext,
  );

  const useStyles = makeStyles((theme: CremaTheme) => ({
    cpSwatch: {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      cursor: 'pointer',
      marginBottom: 10,
      marginRight: 10,
    },
    cpColor: {
      width: 30,
      height: 16,
      backgroundColor: theme.palette.sidebar.bgColor,
      border: `solid 1px ${grey[100]}`,
      marginRight: 10,
      [theme.breakpoints.up('xl')]: {
        width: 40,
        height: 26,
      },
    },
    cpPopover: {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: 1,
    },
  }));

  const classes = useStyles(props);

  return (
    <>
      <Box className={classes.cpSwatch} onClick={() => setVisibility(!visible)}>
        <Box className={classes.cpColor} />
        <span className='font-extrabold'>Sidebar</span>
      </Box>
      {visible ? (
        <Box className={classes.cpPopover} onClick={() => setVisibility(false)}>
          <SketchPicker
            color={sidebarColor}
            onChangeComplete={(color) => {
              theme.palette.sidebar.bgColor = color.hex;
              updateTheme!(theme);
              updateSidebarColor!(color.hex);
            }}
          />
        </Box>
      ) : null}
    </>
  );
};

export default SidebarColorPicker;
