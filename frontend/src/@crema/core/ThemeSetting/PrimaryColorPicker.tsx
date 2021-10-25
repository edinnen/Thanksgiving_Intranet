import React, {useContext, useState} from 'react';
import AppContext from '../../utility/AppContext';
import {SketchPicker} from 'react-color';
import {makeStyles} from '@material-ui/core/index';
import Box from '@material-ui/core/Box';
import {CremaTheme} from '../../../types/AppContextPropsType';
import {grey} from '@material-ui/core/colors';

interface PrimaryColorPickerProps {
  props?: any;
}

const PrimaryColorPicker: React.FC<PrimaryColorPickerProps> = (props) => {
  const [visible, setVisibility] = useState(false);
  const {primary, updatePrimaryColor, theme, updateTheme} = useContext(
    AppContext,
  );

  const useStyles = makeStyles((theme: CremaTheme) => {
    return {
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
        backgroundColor: theme.palette.primary.main,
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
    };
  });

  const classes = useStyles(props);

  return (
    <>
      <Box className={classes.cpSwatch} onClick={() => setVisibility(!visible)}>
        <Box className={classes.cpColor} />
        <Box component='span' className='font-extrabold'>
          Primary
        </Box>
      </Box>
      {visible ? (
        <Box
          className={classes.cpPopover}
          onClick={() => setVisibility(!visible)}>
          <SketchPicker
            color={primary}
            onChangeComplete={(color) => {
              theme.palette.primary.main = color.hex;
              updateTheme!(theme);
              updatePrimaryColor!(color.hex);
            }}
          />
        </Box>
      ) : null}
    </>
  );
};

export default PrimaryColorPicker;
