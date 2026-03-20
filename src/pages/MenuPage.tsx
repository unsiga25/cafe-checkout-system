import React, { useEffect } from 'react';
import {
  IonContent, IonGrid, IonRow, IonCol, IonSpinner, IonText,
  IonButton, IonIcon, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';
import { fetchMenuItems } from '../store/menuSlice';
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

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMenuItems());
  }, [status, dispatch]);

  const handleRefresh = (event: CustomEvent) => {
    dispatch(fetchMenuItems()).finally(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  };

  return (
    <IonContent className="menu-content">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>
      <SearchSortBar searchQuery={searchQuery} sortField={sortField} sortOrder={sortOrder} />
      {status === 'loading' && (
        <div className="loading-container" data-testid="loading-spinner">
          <IonSpinner name="crescent" color="primary" />
          <IonText color="medium"><p>Loading menu…</p></IonText>
        </div>
      )}
      {status === 'failed' && (
        <div className="error-container">
          <IonText color="danger"><p>{error}</p></IonText>
          <IonButton onClick={() => dispatch(fetchMenuItems())} color="primary">
            <IonIcon slot="start" icon={refreshOutline} />Retry
          </IonButton>
        </div>
      )}
      {status === 'succeeded' && products.length === 0 && (
        <div className="empty-container">
          <IonText color="medium"><p>No items match your search.</p></IonText>
        </div>
      )}
      {status === 'succeeded' && products.length > 0 && (
        <IonGrid className="product-grid">
          <IonRow>
            {products.map((product) => (
              <IonCol key={`${product.id}-${product.title}`} size="12" sizeSm="6" sizeMd="4" sizeLg="3">
                <ProductCard product={product} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      )}
    </IonContent>
  );
};

export default MenuPage;