import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.capitalize = this.capitalize.bind(this);
  }

  toggleDrawer() {
    this.setState({ open: !this.state.open });
  }

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  render() {
    const location = /[^/]*$/.exec(this.context.router.route.location.pathname)[0];
    return (
      <div>
        <AppBar
          title={`Thanksgiving ${location === '' ? 'Intranet' : this.capitalize(location)}`}
          iconClassNameRight="muidocs-icon-navigation-expand-more"
          onLeftIconButtonClick={() => this.toggleDrawer()}
        />
        <Drawer
          docked={false}
          onRequestChange={(open) => this.setState({ open })}
          open={this.state.open}
        >
          <MenuItem
            onClick={() => { this.toggleDrawer(); this.context.router.history.push('/'); }}
          >
            Home
          </MenuItem>
          <MenuItem
            onClick={() => { this.toggleDrawer(); this.context.router.history.push('/log'); }}
          >
            Log Book
          </MenuItem>
          <MenuItem
            onClick={() => { this.toggleDrawer(); this.context.router.history.push('/stats'); }}
          >
            Stats
          </MenuItem>
          <MenuItem
            onClick={() => { this.toggleDrawer(); this.context.router.history.push('/lights'); }}
          >
            Lights
          </MenuItem>
        </Drawer>
      </div>
    );
  }
}

Header.contextTypes = {
  router: React.PropTypes.shape({
    history: React.PropTypes.object.isRequired,
  }),
};

export default Header;
