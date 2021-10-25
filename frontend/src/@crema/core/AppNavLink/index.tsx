import React, {ReactNode} from 'react';
import {Link} from 'react-router-dom';

interface AppNavLinkProps {
  to: string;
  children: ReactNode;

  [x: string]: any;
}

const AppNavLink: React.FC<AppNavLinkProps> = ({to, children, ...rest}) => (
  <Link to={to} {...rest}>
    <>{children}</>
  </Link>
);

export default AppNavLink;
