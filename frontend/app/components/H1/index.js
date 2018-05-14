import styled from 'styled-components';

const H1 = styled.h1`
  line-height: 1.05;
  font-weight: 700;
  font-size: 3rem;
  @media screen and (max-width: 992px) {
    font-size: 2.5rem;
  }
  @media screen and (max-width: 1200px) {
    font-size: 2rem;
    line-height: 1.1;
  }
`;

export default H1;
