import React, {useState} from 'react';
import CloseIcon from '@material-ui/icons/Close';
import {Card, makeStyles} from '@material-ui/core';
import List from '@material-ui/core/List';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import CategoryItem from './CategoryItem';
import {Fonts} from 'shared/constants/AppEnums';
import {CategoriesData} from '../../../../types/models/Widgets';

interface CategoriesProps {
  data: CategoriesData[];
}

const Categories: React.FC<CategoriesProps> = ({data}) => {
  const useStyles = makeStyles(() => ({
    listHalf: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginLeft: '-10px',
      marginRight: '-10px',
      paddingTop: 0,

      '& li': {
        width: '50%',
        padding: '0px 10px',
        '& .MuiListItemIcon-root': {
          minWidth: 0,
        },
      },
    },
    pointer: {
      cursor: 'pointer',
    },
  }));

  const classes = useStyles();

  const [categoryList, handleList] = useState(data);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: CategoriesData,
  ) => {
    category.isChecked = e.target.checked;
    const list = categoryList.map((item) =>
      item.id === category.id ? category : item,
    );
    handleList(list);
  };

  return (
    <Box
      py={{xs: 4, sm: 4, xl: 6}}
      px={{xs: 6, sm: 8, xl: 10}}
      height='1'
      clone>
      <Card>
        <Box mb={4} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.categories' />
          </Box>
          <Box component='span' ml='auto' mt={1.5}>
            <CloseIcon className={classes.pointer} />
          </Box>
        </Box>
        <List className={classes.listHalf}>
          {categoryList.map((item) => {
            return (
              <CategoryItem
                key={item.id}
                item={item}
                handleChange={handleChange}
              />
            );
          })}
        </List>
      </Card>
    </Box>
  );
};

export default Categories;
