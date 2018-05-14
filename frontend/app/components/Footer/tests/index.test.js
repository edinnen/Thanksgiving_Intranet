import React from 'react';
import { shallow } from 'enzyme';

import Footer from '../index';
import Section from '../Section';
import Links from '../Links';

describe('<Footer />', () => {
  it('should render the Links', () => {
    const renderedComponent = shallow(
      <Footer />
    );
    expect(renderedComponent.contains(
      <Section>
        <Links />
      </Section>
    )).toBe(true);
  });
});
