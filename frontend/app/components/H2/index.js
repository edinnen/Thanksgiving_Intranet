import styled from 'styled-components';

const H2 = styled.h2`
  line-height: 1.25;
  font-weight: 500;
  font-size: 2.25rem;
  @media screen and (max-width: 992px) {
    font-size: 2rem;
  }
  @media screen and (max-width: 1200px) {
    font-size: 1.625rem;
  }
`;

export default H2;
