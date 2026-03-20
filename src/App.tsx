import React from 'react';
import { Provider } from 'react-redux';
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { bagHandleOutline, restaurantOutline } from 'ionicons/icons';
import { store } from './store';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CartBadge from './components/CartBadge';

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

const App: React.FC = () => (
  <Provider store={store}>
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/menu" component={MenuPage} />
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
    </IonApp>
  </Provider>
);

export default App;