import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { bagHandleOutline, restaurantOutline } from 'ionicons/icons';
import { store, RootState, AppDispatch } from './store';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartBadge from './components/CartBadge';
import { fetchMenuItems } from './store/menuSlice';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './App.css';

setupIonicReact();

const AppShell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const menuStatus = useSelector((s: RootState) => s.menu.status);

  useEffect(() => {
    if (menuStatus === 'idle') {
      dispatch(fetchMenuItems());
    }
  }, [menuStatus, dispatch]);

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/menu" component={MenuPage} />
          <Route exact path="/product/:id" component={ProductDetailPage} />
          <Route exact path="/cart" component={CartPage} />
          <Route exact path="/" render={() => <Redirect to="/menu" />} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="menu" href="/menu">
            <IonIcon icon={restaurantOutline} />
            <IonLabel>Menu</IonLabel>
          </IonTabButton>
          <IonTabButton tab="cart" href="/cart">
            <IonIcon icon={bagHandleOutline} />
            <IonLabel>Cart</IonLabel>
            <CartBadge />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <IonApp>
      <AppShell />
    </IonApp>
  </Provider>
);

export default App;