import React from 'react';
import { shallow } from 'enzyme';

import Blockquote from '../index';

describe('<Blockquote />', () => {
  it('should render a prop', () => {
    const id = 'testId';
    const renderedComponent = shallow(
      <Blockquote id={id} />
    );
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  it('should render its text', () => {
    const children = 'Text';
    const renderedComponent = shallow(
      <Blockquote>{children}</Blockquote>
    );
    expect(renderedComponent.contains(children)).toBe(true);
  });
});
