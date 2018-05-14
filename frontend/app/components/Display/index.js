import styled from 'styled-components';

const Display = styled.div`
  line-height: 1.1;
  font-weight: 700;
  font-size: 4.5rem;
  @media screen and (max-width: 992px) {
    font-size: 4rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 3.5rem;
  }
`;

export default Display;
