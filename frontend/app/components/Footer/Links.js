import React from 'react';
import { FormattedMessage } from 'react-intl';

import A from './A';
import LinkWrapper from './LinkWrapper';
import messages from './messages';
import H4 from './H4';
import Row from './Row';
import LinkSection from './LinkSection';

function Links() {
  return (
    <LinkWrapper>
      <LinkSection>
        <Row>
          <H4>
            <FormattedMessage {...messages.LinkRow1} />
          </H4>
          <A href="#">
            <FormattedMessage {...messages.LinkRow1.Link1} />
          </A>
          <A href="#">
            <FormattedMessage {...messages.LinkRow1.Link2} />
          </A>
        </Row>
        <Row>
          <H4>
            <FormattedMessage {...messages.LinkRow2} />
          </H4>
          <A href="#">
            <FormattedMessage {...messages.LinkRow2.Link1} />
          </A>
          <A href="#">
            <FormattedMessage {...messages.LinkRow2.Link2} />
          </A>
        </Row>
        <Row>
          <H4>
            <FormattedMessage {...messages.LinkRow3} />
          </H4>
          <A href="#">
            <FormattedMessage {...messages.LinkRow3.Link1} />
          </A>
          <A href="#">
            <FormattedMessage {...messages.LinkRow3.Link2} />
          </A>
        </Row>
      </LinkSection>
    </LinkWrapper>
  );
}

export default Links;
