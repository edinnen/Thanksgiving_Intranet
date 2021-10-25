import React, {ReactNode, useContext} from 'react';
import {renderRoutes} from 'react-router-config';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useLocation} from 'react-router-dom';
import {Suspense} from '../../index';
import routes from '../../../modules';
import Scrollbar from '../Scrollbar';
import AppContext from '../../utility/AppContext';
import AppFooter from '../AppLayout/AppFooter';
import Box from '@material-ui/core/Box';
import {RouteTransition} from '../../../shared/constants/AppEnums';
import AppContextPropsType from '../../../types/AppContextPropsType';

interface TransitionWrapperProps {
  children: ReactNode;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({children}) => {
  const {rtAnim} = useContext<AppContextPropsType>(AppContext);
  const location = useLocation();
  if (rtAnim === RouteTransition.NONE) {
    return <>{children}</>;
  }
  return (
    <TransitionGroup appear enter exit>
      <CSSTransition
        key={location.key}
        timeout={{enter: 300, exit: 300}}
        classNames={rtAnim}>
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

TransitionWrapper.propTypes = {};

interface ContentViewProps {
  children?: ReactNode;
}

const ContentView: React.FC<ContentViewProps> = () => {
  return (
    <Scrollbar>
      <Box
        display='flex'
        flex={1}
        flexDirection='column'
        className='main-content-view'>
        <Suspense>
          <TransitionWrapper>{renderRoutes(routes)}</TransitionWrapper>
        </Suspense>
      </Box>
      <AppFooter />
    </Scrollbar>
  );
};

export default ContentView;
