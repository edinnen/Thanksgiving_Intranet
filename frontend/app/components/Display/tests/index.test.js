import React from 'react';
import { shallow } from 'enzyme';

import Display from '../index';

describe('<Display />', () => {
  it('should render a prop', () => {
    const id = 'testId';
    const renderedComponent = shallow(
      <Display id={id} />
    );
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  it('should render its text', () => {
    const children = 'Text';
    const renderedComponent = shallow(
      <Display>{children}</Display>
    );
    expect(renderedComponent.contains(children)).toBe(true);
  });
});
