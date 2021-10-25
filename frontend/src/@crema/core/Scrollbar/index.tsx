import React, {ReactNode, useEffect, useRef} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {RouteComponentProps, withRouter} from 'react-router-dom';

interface ScrollbarProps extends RouteComponentProps<any> {
  children: ReactNode;
  className: string;
  location: any;

  [x: string]: any;
}

const Scrollbar: React.FC<ScrollbarProps> = React.forwardRef((props, ref) => {
  const {children, className, location, ...others} = props;
  let _scrollBarRef = useRef<HTMLElement>(null);
  const {pathname} = location;

  useEffect(() => {
    if (_scrollBarRef) {
      // @ts-ignore
      _scrollBarRef._container.scrollTop = 0;
    }
  }, [_scrollBarRef, pathname]);

  return (
    <PerfectScrollbar
      ref={(ref) => {
        // @ts-ignore
        _scrollBarRef = ref;
      }}
      {...others}
      className={className}>
      {children}
    </PerfectScrollbar>
  );
});

export default withRouter(Scrollbar);
