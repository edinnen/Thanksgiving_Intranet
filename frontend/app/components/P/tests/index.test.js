import React from 'react';
import { shallow } from 'enzyme';

import P from '../index';

describe('<P />', () => {
  it('should render a prop', () => {
    const id = 'testId';
    const renderedComponent = shallow(
      <P id={id} />
    );
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  it('should render its text', () => {
    const children = 'Text';
    const renderedComponent = shallow(
      <P>{children}</P>
    );
    expect(renderedComponent.contains(children)).toBe(true);
  });
});
