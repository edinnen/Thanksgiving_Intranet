import React from 'react';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {SocialVisitorsData} from '../../../../types/models/Metrics';

interface CategoriesProps {
  data: SocialVisitorsData[];
}

const Categories: React.FC<CategoriesProps> = ({data}) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      flexWrap='wrap'
      justifyContent='space-between'>
      {data.map((item) => {
        return (
          <Box px={4.5} mb={2} key={item.id}>
            <Box display='flex' alignItems='center'>
              <Box
                component='span'
                height={{xs: 12, xl: 16}}
                width={{xs: 12, xl: 16}}
                borderRadius='50%'
                display='block'
                bgcolor={item.color}
                p={1}
                mr={2}
              />
              <Box
                component='p'
                mb={1}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 18, xl: 24}}>
                {item.visitors}
              </Box>
            </Box>
            <Box
              component='p'
              color='grey.500'
              fontSize={{xs: 16, xl: 18}}
              style={{textTransform: 'capitalize'}}>
              {item.name}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Categories;
