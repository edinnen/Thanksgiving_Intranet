import React from 'react';
import { shallow } from 'enzyme';

import HeaderLink from '../HeaderLink';

describe('<HeaderLink />', () => {
  it('should render', () => {
    const renderedComponent = shallow(
      <HeaderLink to="/" />
    );
    expect(renderedComponent.length).toEqual(1);
  });
});
