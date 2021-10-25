import React, {useState} from 'react';
import {Card} from '@material-ui/core';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import ColorItem from './ColorItem';
import {Fonts} from 'shared/constants/AppEnums';
import {ColorsList} from '../../../../types/models/Widgets';

interface ColorsProps {
  data: ColorsList[];
}

const Colors: React.FC<ColorsProps> = ({data}) => {
  const [colorsList, handleList] = useState(data);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    color: ColorsList,
  ) => {
    color.isChecked = e.target.checked;
    const list = colorsList.map((item) =>
      item.id === color.id ? color : item,
    );
    handleList(list);
  };

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={4}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.colors' />
        </Box>

        {data.map((item) => {
          return (
            <ColorItem key={item.id} item={item} handleChange={handleChange} />
          );
        })}
      </Card>
    </Box>
  );
};

export default Colors;
