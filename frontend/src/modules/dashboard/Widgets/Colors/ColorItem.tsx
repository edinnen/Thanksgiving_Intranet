import React from 'react';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ColorsList} from '../../../../types/models/Widgets';

interface ColorItemProps {
  item: ColorsList;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    item: ColorsList,
  ) => void;
}

const ColorItem: React.FC<ColorItemProps> = (props) => {
  const {item, handleChange} = props;
  const useStyles = makeStyles(() => ({
    checkBox: {
      color: `${item.color} !important`,
    },
  }));

  const classes = useStyles(props);
  return (
    <Box display='flex' alignItems='center' key={item.id}>
      <Box mr={2} ml={-3}>
        <Checkbox
          className={classes.checkBox}
          checked={item.isChecked}
          onChange={(e) => handleChange(e, item)}
        />
      </Box>
      <Box
        component='span'
        color={item.color}
        fontFamily={Fonts.LIGHT}
        fontSize={{xs: 16, xl: 18}}>
        {item.name}
      </Box>
    </Box>
  );
};

export default ColorItem;
