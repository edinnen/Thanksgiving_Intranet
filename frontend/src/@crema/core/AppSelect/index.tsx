import React, {useState} from 'react';
import Select from '@material-ui/core/Select';
import {makeStyles} from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import {CremaTheme} from '../../../types/AppContextPropsType';

interface AppSelectProps {
  menus: string[] | any[];
  onChange: (value: any) => void;
  defaultValue: any;
  selectionKey?: string;
}

const AppSelect: React.FC<AppSelectProps> = ({
  menus = [],
  onChange,
  defaultValue = '',
  selectionKey = '',
}) => {
  const [selectionType, setSelectionType] = useState(defaultValue);

  const handleSelectionType = (event: React.ChangeEvent<{value: unknown}>) => {
    setSelectionType(event.target.value);
    onChange(event.target.value);
  };
  const useStyles = makeStyles((theme: CremaTheme) => ({
    selectBox: {
      marginRight: 8,
      cursor: 'pointer',
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        marginLeft: 24,
        fontSize: 18,
      },
      '& .MuiSelect-select': {
        paddingLeft: 10,
      },
    },
    selectOption: {
      cursor: 'pointer',
      padding: 8,
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));
  const classes = useStyles();
  return (
    <Select
      defaultValue={defaultValue}
      value={selectionType}
      onChange={handleSelectionType}
      disableUnderline={true}
      className={classes.selectBox}>
      {menus.map((menu: any, index: number) => (
        <MenuItem
          key={index}
          value={selectionKey ? menu[selectionKey] : menu}
          className={classes.selectOption}>
          {selectionKey ? menu[selectionKey] : menu}
        </MenuItem>
      ))}
    </Select>
  );
};

export default AppSelect;
