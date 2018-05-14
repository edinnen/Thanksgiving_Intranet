import styled from 'styled-components';

const P = styled.p`
  font-size: 1rem;
  line-height: 1.375;
  font-weight: 500;
  ${(props) => props.small && `
    font-size: 0.75rem;
    line-height: 1.5;
    font-weight: 500;
  `}
`;

export default P;
