import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap/lib';

function TopNavbar() {
  return (
    <Navbar inverse fixedTop>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="/">Thanksgiving Cabin</a>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          <NavItem href="/logbook">Logbook</NavItem>
          <NavItem href="/power">Power Stats</NavItem>
          <NavItem href="/music">Music</NavItem>
          <NavItem href="/lights">Lights</NavItem>
          <NavItem href="/wiki">Wiki</NavItem>
          <NavItem href="/memes">Dank Memes</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default TopNavbar;
