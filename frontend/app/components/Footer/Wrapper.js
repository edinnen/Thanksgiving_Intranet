import styled from 'styled-components';
import * as mixins from 'styles/mixins';

const Wrapper = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: 3em;
  border-top: 1px solid #666;

  ${mixins.bp.xs.max`
    flex-direction: column;
    align-items: center;
    text-align: center;
  `};
`;

export default Wrapper;
