import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'components/Button';

import A from './A';
import Img from './Img';
import NavBar from './NavBar';
import Banner from './banner.jpg';
import Container from './Container';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <A href="https://ocean.org">
          <Container>
            <Img src={Banner} alt="Ocean wise" />
          </Container>
        </A>
        <NavBar>
          <Link to="/">
            <Button id="home">
              Home
            </Button>
          </Link>
          <Link to="/log">
            <Button id="log">
              Log Book
            </Button>
          </Link>
          <Link to="/stats">
            <Button id="stats">
              Stats
            </Button>
          </Link>
          <Link to="/lights">
            <Button id="lights">
              Lights
            </Button>
          </Link>
        </NavBar>
      </div>
    );
  }
}

export default Header;
