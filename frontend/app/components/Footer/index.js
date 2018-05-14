import React from 'react';
import { FormattedMessage } from 'react-intl';

import A from 'components/A';
import LocaleToggle from 'containers/LocaleToggle';
import Wrapper from './Wrapper';
import Section from './Section';
import messages from './messages';
import Logo from './Logo';
import OWLogo from './logo.svg';
import Links from './Links';

function Footer() {
  return (
    <Wrapper>
      <Section>
        <Links />
      </Section>
      <Section>
        <LocaleToggle />
      </Section>
      <Section>
        <Logo src={OWLogo} alt="Ocean Wise" />
        <FormattedMessage
          {...messages.authorMessage}
          values={{
            author: <A href="https://edinnen.github.io/">Ethan Dinnen</A>,
          }}
        />
      </Section>
    </Wrapper>
  );
}

export default Footer;
