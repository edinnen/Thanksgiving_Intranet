import React, {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import Box from '@material-ui/core/Box';
import {Button, makeStyles} from '@material-ui/core';
import clsx from 'clsx';
import AppContextPropsType, {
  CremaTheme,
} from '../../../../types/AppContextPropsType';

interface AppFixedFooterProps {
  props?: any;
}

const AppFixedFooter: React.FC<AppFixedFooterProps> = (props) => {
  const {footer, footerType} = useContext<AppContextPropsType>(AppContext);

  const useStyles = makeStyles((theme: CremaTheme) => ({
    footer: {
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      zIndex: 99,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      margin: '0',
      '& .footerContainer': {
        padding: '5px 20px',
        [theme.breakpoints.up('md')]: {
          paddingLeft: 32,
          paddingRight: 32,
        },
        [theme.breakpoints.up('xl')]: {
          padding: '10px 32px',
        },
      },
    },
  }));

  const classes = useStyles(props);

  return (
    <>
      {footer && footerType === 'fixed' ? (
        <Box className={clsx(classes.footer, 'footer')}>
          <Box
            className='footerContainer'
            alignItems='center'
            flexDirection='row'
            display='flex'>
            <Box>Copy right @crema 2020</Box>
            <Box ml='auto'>
              <Box px={5} clone>
                <Button color='primary'>Buy Now</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </>
  );
};

export default AppFixedFooter;
