import React, {useContext, useState} from 'react';
import AppContext from '../../utility/AppContext';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import PrimaryColorPicker from './PrimaryColorPicker';
import SecondaryColorPicker from './SecondaryColorPicker';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import SidebarColorPicker from './SidebarColorPicker';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import {layoutTypes, navStyles} from '../../services/db/navigationStyle';
import clsx from 'clsx';
import {Scrollbar} from '../../index';
import Box from '@material-ui/core/Box';
import IntlMessages from '../../utility/IntlMessages';
import useStyles from './index.style';
import CheckIcon from '@material-ui/icons/Check';
import themeColorSets from '../../../shared/constants/ColorSets';
import CustomColorCell from './CustomColorCell';
import {
  Fonts,
  FooterType,
  LayoutType,
  NavStyle,
  RouteTransition,
  ThemeMode,
  ThemeStyle,
  ThemeStyleRadius,
} from '../../../shared/constants/AppEnums';
import {useBreakPointDown} from '../../utility/Utils';
import AppContextPropsType from '../../../types/AppContextPropsType';

interface ThemeSettingProps {
  props: any;
}

const ThemeSetting: React.FC<ThemeSettingProps> = (props) => {
  const isBelowMD = useBreakPointDown('md');
  const [open, setCustomizerStatus] = useState(false);
  const [themeColor, setThemeColor] = useState('preset');
  const {
    themeMode,
    updateThemeMode,
    updatePrimaryColor,
    updateSecondaryColor,
    themeStyle,
    updateThemeStyle,
    updateTheme,
    footer,
    footerType,
    setFooter,
    setFooterType,
    theme,
    isRTL,
    setRTL,
    rtAnim,
    changeRTAnim,
    navStyle,
    layoutType,
    updateLayoutStyle,
    changeNavStyle,
  } = useContext<AppContextPropsType>(AppContext);
  const onStyleChange = (
    event: React.MouseEvent<HTMLElement>,
    themeStyle: ThemeStyle,
  ) => {
    if (themeStyle) {
      if (themeStyle === ThemeStyle.MODERN) {
        if (isBelowMD) {
          theme.overrides.MuiCard.root.borderRadius = 20;
          theme.overrides.MuiToggleButton.root.borderRadius = 20;
        } else {
          theme.overrides.MuiCard.root.borderRadius = ThemeStyleRadius.MODERN;
          theme.overrides.MuiToggleButton.root.borderRadius =
            ThemeStyleRadius.MODERN;
        }
        theme.overrides.MuiButton.root.borderRadius = ThemeStyleRadius.MODERN;
        theme.overrides.MuiCardLg.root.borderRadius =
          ThemeStyleRadius.MODERN + 20;
        updateThemeStyle!(ThemeStyle.MODERN);
      } else {
        theme.overrides.MuiCard.root.borderRadius = ThemeStyleRadius.STANDARD;
        theme.overrides.MuiToggleButton.root.borderRadius =
          ThemeStyleRadius.STANDARD;
        theme.overrides.MuiButton.root.borderRadius = ThemeStyleRadius.STANDARD;
        theme.overrides.MuiCardLg.root.borderRadius = ThemeStyleRadius.STANDARD;
        updateThemeStyle!(ThemeStyle.STANDARD);
      }
      updateTheme!(theme);
    }
  };

  const onModeChange = (
    event: React.MouseEvent<HTMLElement>,
    themeMode: ThemeMode,
  ) => {
    if (themeMode) updateThemeMode!(themeMode);
  };

  const onSelectThemeColor = (
    event: React.MouseEvent<HTMLElement>,
    color: any,
  ) => {
    if (color) setThemeColor(color);
  };

  const onLayoutChange = (layoutType: LayoutType) => {
    updateLayoutStyle!(layoutType);
  };
  const onNavStyleChange = (navStyle: NavStyle) => {
    changeNavStyle!(navStyle);
  };

  const onChangeRtlSetting = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRTL!(event.target.checked);
  };
  const updateThemeColors = (colorSet: any) => {
    theme.palette.primary.main = colorSet.PrimaryColor;
    theme.palette.secondary.main = colorSet.SecondaryColor;
    theme.palette.sidebar.bgColor = colorSet.SidebarColor;
    updateTheme!(theme);
    updatePrimaryColor!(colorSet.PrimaryColor);
    updateSecondaryColor!(colorSet.SecondaryColor);
  };
  const classes = useStyles(props);

  return (
    <Box className={clsx(classes.customizerOption, 'customizerOption')}>
      <Box className={classes.customizerButton}>
        <IconButton onClick={() => setCustomizerStatus(!open)}>
          <i
            className={clsx(
              classes.textWhite,
              'material-icons animated infinite pulse',
            )}>
            settings
          </i>
        </IconButton>
      </Box>
      <Drawer
        anchor='right'
        className={layoutType === LayoutType.BOXED ? 'boxed-drawer' : ''}
        open={open}
        onClose={() => setCustomizerStatus(false)}>
        <Scrollbar className={classes.rightSidebar}>
          <Box className={classes.rightSidebarHeader}>
            <Box
              component='h2'
              mb={3}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, xl: 24}}
              style={{textTransform: 'uppercase'}}>
              <IntlMessages id='customizer.customiseTheme' />
            </Box>
            <Box component='p' mb={0} color='grey.500'>
              <IntlMessages id='customizer.customiseText' />
            </Box>
          </Box>
          <Box className={classes.rightSidebarMain}>
            <Box className={classes.customizerItem}>
              <Box
                component='h4'
                mb={{xs: 2, xl: 3}}
                className='font-extrabold text-base xl:text-lg uppercase'>
                <IntlMessages id='customizer.themeStyle' />
              </Box>
              <ToggleButtonGroup
                value={themeStyle}
                exclusive={true}
                onChange={onStyleChange}
                aria-label='text alignment'>
                <ToggleButton
                  value={ThemeStyle.MODERN}
                  className={clsx(classes.toggleBtn, {
                    active: themeStyle === ThemeStyle.MODERN,
                  })}
                  aria-label='left aligned'>
                  <IntlMessages id='sidebar.pages.userList.modern' />
                </ToggleButton>
                <ToggleButton
                  value={ThemeStyle.STANDARD}
                  className={clsx(classes.toggleBtn, {
                    active: themeStyle === ThemeStyle.STANDARD,
                  })}
                  aria-label='centered'>
                  <IntlMessages id='sidebar.pages.userList.standard' />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box className={classes.customizerItem}>
              <Box
                component='h4'
                mb={{xs: 2, xl: 3}}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                <IntlMessages id='customizer.themeMode' />
              </Box>
              <ToggleButtonGroup
                value={themeMode}
                exclusive
                onChange={onModeChange}
                aria-label='text alignment'>
                <ToggleButton
                  value='light'
                  className={clsx(classes.toggleBtn, {
                    active:
                      themeMode === ThemeMode.LIGHT &&
                      theme.palette.type === ThemeMode.LIGHT,
                  })}
                  aria-label='left aligned'>
                  <IntlMessages id='customizer.light' />
                </ToggleButton>
                <ToggleButton
                  value='semi-dark'
                  className={clsx(classes.toggleBtn, {
                    active:
                      themeMode === ThemeMode.SEMI_DARK &&
                      theme.palette.type === ThemeMode.LIGHT,
                  })}
                  aria-label='centered'>
                  <IntlMessages id='customizer.semiDark' />
                </ToggleButton>
                <ToggleButton
                  value='dark'
                  className={clsx(classes.toggleBtn, {
                    active:
                      themeMode === ThemeMode.DARK ||
                      theme.palette.type === ThemeMode.DARK,
                  })}
                  aria-label='centered'>
                  <IntlMessages id='customizer.dark' />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box className={classes.customizerItem}>
              <Box
                component='h4'
                mb={{xs: 2, xl: 3}}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                <IntlMessages id='customizer.themeColors' />
              </Box>
              <ToggleButtonGroup
                value={themeColor}
                exclusive
                onChange={onSelectThemeColor}
                aria-label='text alignment'>
                <ToggleButton
                  value='preset'
                  className={clsx(classes.toggleBtn, {
                    active: themeColor === 'preset',
                  })}
                  aria-label='centered'>
                  <IntlMessages id='customizer.preset' />
                </ToggleButton>
                <ToggleButton
                  value='custom'
                  className={clsx(classes.toggleBtn, {
                    active: themeColor === 'custom',
                  })}
                  aria-label='left aligned'>
                  <IntlMessages id='customizer.custom' />
                </ToggleButton>
              </ToggleButtonGroup>
              {themeColor === 'custom' ? (
                <Box className={classes.colorRow} mt={4}>
                  <PrimaryColorPicker />
                  <SecondaryColorPicker />
                  <SidebarColorPicker />
                </Box>
              ) : (
                <Box mt={4}>
                  <Box component='ul' className={classes.colorOptionList}>
                    {themeColorSets.map((colorSet, index) => (
                      <CustomColorCell
                        key={index}
                        updateThemeColors={updateThemeColors}
                        themeColorSet={colorSet}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Box className={classes.customizerItem}>
              <Box display='flex' alignItems='center'>
                <Box
                  component='h4'
                  fontFamily={Fonts.LIGHT}
                  fontSize={{xs: 16, xl: 18}}
                  style={{textTransform: 'uppercase'}}>
                  <IntlMessages id='customizer.rtlSupport' />
                </Box>
                <Box component='span' ml='auto'>
                  <Switch
                    checked={isRTL}
                    onChange={onChangeRtlSetting}
                    value='checkedA'
                    inputProps={{'aria-label': 'secondary checkbox'}}
                  />
                </Box>
              </Box>
            </Box>

            <Box pb={1} className={clsx(classes.customizerItem)}>
              <Box
                component='h4'
                mb={{xs: 2, xl: 3}}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                <IntlMessages id='customizer.navigationStyles' />
              </Box>
              <Box className={classes.navOption}>
                {navStyles.map((navLayout) => {
                  return (
                    <Box className={classes.navOptionItem} key={navLayout.id}>
                      <Box
                        className={classes.navOptionContent}
                        onClick={() => onNavStyleChange(navLayout.alias)}>
                        <img src={navLayout.image} alt='nav' />
                        {navStyle === navLayout.alias ? (
                          <span className={classes.navOptionRightIcon}>
                            <CheckIcon className={classes.textWhite}>
                              <IntlMessages id='customizer.checked' />
                            </CheckIcon>
                          </span>
                        ) : null}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box pb={1} className={clsx(classes.customizerItem)}>
              <Box
                component='h4'
                mb={{xs: 2, xl: 3}}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                <IntlMessages id='customizer.layoutTypes' />
              </Box>
              <Box className={classes.navOption}>
                {layoutTypes.map((layout) => {
                  return (
                    <Box className={classes.navOptionItem} key={layout.id}>
                      <Box
                        className={classes.navOptionContent}
                        onClick={() => onLayoutChange(layout.alias)}>
                        <img src={layout.image} alt='nav' />
                        {layoutType === layout.alias ? (
                          <span className={classes.navOptionRightIcon}>
                            <CheckIcon className={classes.textWhite}>
                              <IntlMessages id='customizer.checked' />
                            </CheckIcon>
                          </span>
                        ) : null}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box className={classes.customizerItem}>
              <Box display='flex' alignItems='center'>
                <Box
                  component='h4'
                  fontFamily={Fonts.LIGHT}
                  fontSize={{xs: 16, xl: 18}}
                  style={{textTransform: 'uppercase'}}>
                  Footer
                </Box>
                <Box component='span' ml='auto'>
                  <Switch
                    checked={footer}
                    onChange={() => setFooter!(!footer)}
                    value='checkedA'
                    inputProps={{'aria-label': 'secondary checkbox'}}
                  />
                </Box>
              </Box>
            </Box>
            <Box className={classes.customizerItem}>
              <Box
                component='h4'
                mb={4}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                Footer Type
              </Box>
              <FormControl variant='outlined' className={classes.wFull}>
                <InputLabel htmlFor='outlined-rt'>Footer Type</InputLabel>
                <Select
                  className={classes.selectBox}
                  value={footerType}
                  labelWidth={100}
                  onChange={(e) => setFooterType!(e.target.value as FooterType)}
                  inputProps={{
                    name: 'rt',
                    id: 'outlined-rt',
                  }}>
                  <MenuItem value={FooterType.FIXED}>Fixed</MenuItem>
                  <MenuItem value={FooterType.FLUID}>Fluid</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.customizerItem}>
              <Box
                component='h4'
                mb={4}
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 16, xl: 18}}
                style={{textTransform: 'uppercase'}}>
                <IntlMessages id='customizer.routeTransition' />
              </Box>
              <FormControl variant='outlined' className={classes.wFull}>
                <InputLabel htmlFor='outlined-rt'>
                  <IntlMessages id='customizer.routeTransition' />
                </InputLabel>
                <Select
                  className={classes.selectBox}
                  value={rtAnim}
                  labelWidth={100}
                  onChange={(e) =>
                    changeRTAnim!(e.target.value as RouteTransition)
                  }
                  inputProps={{
                    name: 'rt',
                    id: 'outlined-rt',
                  }}>
                  <MenuItem value={RouteTransition.NONE}>
                    <IntlMessages id='common.none' />
                  </MenuItem>
                  <MenuItem value={RouteTransition.FADE}>
                    <IntlMessages id='customizer.fade' />
                  </MenuItem>
                  <MenuItem value={RouteTransition.SLIDE_LEFT}>
                    <IntlMessages id='customizer.slideLeft' />
                  </MenuItem>
                  <MenuItem value={RouteTransition.SLIDE_RIGHT}>
                    <IntlMessages id='customizer.slideRight' />
                  </MenuItem>
                  <MenuItem value={RouteTransition.SLIDE_UP}>
                    <IntlMessages id='customizer.slideUp' />
                  </MenuItem>
                  <MenuItem value={RouteTransition.SLIDE_DOWN}>
                    <IntlMessages id='customizer.slideDown' />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Scrollbar>
      </Drawer>
    </Box>
  );
};

export default ThemeSetting;
