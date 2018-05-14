import styled from 'styled-components';
import * as mixins from 'styles/mixins';

const Section = styled.section`
  ${mixins.bp.xs.max`
    margin-bottom: 15px;
  `};
`;

export default Section;
