import React from 'react';
import Box from '@material-ui/core/Box';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItem from '@material-ui/core/ListItem';
import {makeStyles} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface CategoriesProps {
  category: any;
}

const Categories: React.FC<CategoriesProps> = ({category}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    crEarningText: {
      margin: 0,
      '&  > *': {
        display: 'block',
        fontSize: '18px !important',
        [theme.breakpoints.up('xl')]: {
          fontSize: '20px !important',
        },
      },
    },
    dot: {
      backgroundColor: `${category.colorName}`,
    },
  }));

  const classes = useStyles();

  return (
    <Box p={0} pb={2} clone>
      <ListItem>
        <Box
          component='span'
          height={12}
          width={12}
          mr={4}
          borderRadius='50%'
          className={classes.dot}
        />
        <ListItemText
          className={classes.crEarningText}
          primary={`${category.name}:`}
        />
        <ListItemSecondaryAction>
          <Box
            component='span'
            fontFamily={Fonts.MEDIUM}
            fontSize={{xs: 16, xl: 18}}>
            ${category.value}
          </Box>
        </ListItemSecondaryAction>
      </ListItem>
    </Box>
  );
};

export default Categories;
