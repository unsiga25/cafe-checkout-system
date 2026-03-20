import React, { useEffect } from 'react';
import {
  IonContent, IonGrid, IonRow, IonCol, IonSpinner,
  IonText, IonButton, IonIcon, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectFilteredSortedProducts } from '../store/selectors';
import ProductCard from '../components/ProductCard';
import SearchSortBar from '../components/SearchSortBar';

const MenuPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectFilteredSortedProducts);
  const status = useAppSelector((s) => s.menu.status);
  const error = useAppSelector((s) => s.menu.error);
  const searchQuery = useAppSelector((s) => s.menu.searchQuery);
  const sortField = useAppSelector((s) => s.menu.sortField);
  const sortOrder = useAppSelector((s) => s.menu.sortOrder);

  const handleRefresh = (event: CustomEvent) => {
    import('../store/menuSlice').then(({ fetchMenuItems }) => {
      dispatch(fetchMenuItems()).finally(() => {
        (event.target as HTMLIonRefresherElement).complete();
      });
    });
  };

  return (
    <IonContent className="menu-content">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <div className="menu-page-wrap">
        <SearchSortBar
          searchQuery={searchQuery}
          sortField={sortField}
          sortOrder={sortOrder}
        />

        {status === 'loading' && (
          <div className="menu-loading">
            <IonSpinner name="crescent" color="primary" />
            <p>Loading menu…</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="menu-error">
            <IonText color="danger"><p>{error}</p></IonText>
            <IonButton
              fill="outline"
              color="primary"
              onClick={() =>
                import('../store/menuSlice').then(({ fetchMenuItems }) =>
                  dispatch(fetchMenuItems())
                )
              }
            >
              <IonIcon slot="start" icon={refreshOutline} />
              Retry
            </IonButton>
          </div>
        )}

        {status === 'succeeded' && products.length === 0 && (
          <div className="menu-empty">
            <div className="menu-empty-icon">☕</div>
            <p className="menu-empty-title">No items found</p>
            <p className="menu-empty-sub">Try a different search term</p>
          </div>
        )}

        {status === 'succeeded' && products.length > 0 && (
          <div className="menu-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </IonContent>
  );
};

export default MenuPage;