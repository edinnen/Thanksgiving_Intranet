import styled from 'styled-components';
import * as mixins from 'styles/mixins';

export default styled.span`
  ${mixins.bp.sm.max`
    display: none;
  `};
`;
