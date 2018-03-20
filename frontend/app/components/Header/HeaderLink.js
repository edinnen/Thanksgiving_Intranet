import { Link } from 'react-router-dom';
import styled from 'styled-components';

export default styled(Link)`
  color: #005EB8;
  padding: 15px 30px;
  margin: 10px 3px;
  border: 1px solid;
  border-color: #005EB8;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease-out;
  background-color: transparent;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #005EB8;
    color: white;
  }
  &:disabled {
    background-color: rgba(178, 190, 196, 0.5);
    color: rgba(141, 141, 141, 0.8);
    border: 1px rgba(141, 141, 141, 0.5);
  }
  ${(props) => props.invert && `
    border-color: white;
    color: white;
    &:hover {
      background-color: white;
      color: #005EB8;
    }
    &:disabled {
      background-color: rgba(178, 190, 196, 0.5);
      color: rgba(77, 77, 77, 0.5);
    }
  `}
`;
