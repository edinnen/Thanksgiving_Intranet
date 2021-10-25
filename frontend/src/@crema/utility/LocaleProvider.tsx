import React, {useContext} from 'react';
import {IntlProvider} from 'react-intl';

import AppLocale from '../../shared/localization';
import PropTypes from 'prop-types';
import AppContext from './AppContext';
import AppContextPropsType from '../../types/AppContextPropsType';

const LocaleProvider = (props: any) => {
  const {locale} = useContext<AppContextPropsType>(AppContext);
  const currentAppLocale = AppLocale[locale.locale];

  return (
    <IntlProvider
      locale={currentAppLocale.locale}
      defaultLocale='fr'
      messages={currentAppLocale.messages}>
      {props.children}
    </IntlProvider>
  );
};

export default LocaleProvider;

LocaleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
