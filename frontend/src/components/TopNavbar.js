import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap/lib';
import Urls from '../util/Urls';

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
          <NavItem href={Urls.owncloud}>File Storage</NavItem>
          <NavItem href={Urls.music}>Music</NavItem>
          <NavItem href="/lights">Lights</NavItem>
          <NavItem href="/wiki">Wiki</NavItem>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default TopNavbar;
