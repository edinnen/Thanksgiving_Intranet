import React, {ReactNode} from 'react';
import Card from '@material-ui/core/Card';
import {Box, makeStyles} from '@material-ui/core';
import {Fonts} from '../../../shared/constants/AppEnums';
import {MessageFormatElement} from 'intl-messageformat-parser';
import {CremaTheme} from '../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => ({
  link: {
    underline: 'none',
    fontSize: 16,
    [theme.breakpoints.up('xl')]: {
      fontSize: 18,
    },
  },
}));

interface AppCardProps {
  title?: string | MessageFormatElement[];
  titleStyle?: any;
  action?: ReactNode | string | MessageFormatElement[];
  actionStyle?: any;
  footer?: any;
  footerPosition?: string;
  footerStyle?: any;
  children: ReactNode;

  [x: string]: any;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  titleStyle,
  action,
  actionStyle,
  footer,
  footerPosition = 'left',
  footerStyle,
  children,
  ...rest
}) => {
  const classes = useStyles();
  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} {...rest} clone>
      <Card>
        <Box>
          {title || action ? (
            <Box
              display='flex'
              flexDirection={{xs: 'column', sm: 'row'}}
              alignItems={{xs: 'center'}}
              justifyContent={{sm: 'space-between'}}
              mb={3}>
              {typeof title === 'object' ? (
                title
              ) : (
                <Box
                  component='h3'
                  color='text.primary'
                  fontFamily={Fonts.LIGHT}
                  fontSize={{xs: 18, sm: 20, xl: 22}}
                  {...titleStyle}>
                  {title}
                </Box>
              )}

              {typeof action === 'object' ? (
                action
              ) : (
                <Box
                  color='secondary'
                  component='button'
                  className={classes.link}
                  ml={footerPosition === 'right' ? 'auto' : 0}>
                  {action}
                </Box>
              )}
            </Box>
          ) : null}

          {children}
        </Box>
        {footer ? (
          <Box pt={2} {...footerStyle}>
            {typeof footer === 'object' ? (
              footer
            ) : (
              <Box
                color='secondary'
                component='button'
                className={classes.link}
                ml={footerPosition === 'right' ? 'auto' : 0}>
                {footer}
              </Box>
            )}
          </Box>
        ) : null}
      </Card>
    </Box>
  );
};

export default AppCard;
