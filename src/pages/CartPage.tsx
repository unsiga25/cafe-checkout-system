import React from 'react';
import {
  IonContent, IonList, IonText, IonButton, IonIcon,
  IonItem, IonLabel, IonNote, IonFooter, IonToolbar,
} from '@ionic/react';
import { bagHandleOutline, cardOutline } from 'ionicons/icons';
import CartItemRow from '../components/CartItemRow';
import ReceiptModal from '../components/ReceiptModal';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectCartSubtotal } from '../store/selectors';
import { checkout } from '../store/cartSlice';
import { calcServiceCharge, formatCurrency } from '../utils';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const receipt = useAppSelector((s) => s.cart.receipt);
  const subtotal = useAppSelector(selectCartSubtotal);
  const serviceCharge = calcServiceCharge(subtotal);
  const total = subtotal + serviceCharge;
  const isEmpty = cartItems.length === 0;

  return (
    <>
      <IonContent className="cart-content">
        {isEmpty ? (
          <div className="empty-cart">
            <IonIcon icon={bagHandleOutline} className="empty-cart-icon" />
            <IonText color="medium">
              <h3>Your cart is empty</h3>
              <p>Add some items from the menu!</p>
            </IonText>
          </div>
        ) : (
          <>
            <IonList className="cart-list" data-testid="cart-list">
              {cartItems.map((item) => <CartItemRow key={item.cartItemId} item={item} />)}
            </IonList>
            <div className="cart-totals">
              <IonItem lines="none">
                <IonLabel>Subtotal</IonLabel>
                <IonNote slot="end" data-testid="cart-subtotal">{formatCurrency(subtotal)}</IonNote>
              </IonItem>
              <IonItem lines="none">
                <IonLabel color="medium">Service Charge (10%)</IonLabel>
                <IonNote slot="end">{formatCurrency(serviceCharge)}</IonNote>
              </IonItem>
              <IonItem lines="none" className="total-row">
                <IonLabel><strong>Total</strong></IonLabel>
                <IonNote slot="end" className="grand-total" data-testid="cart-total">
                  <strong>{formatCurrency(total)}</strong>
                </IonNote>
              </IonItem>
            </div>
          </>
        )}
        {!isEmpty && (
        <IonButton expand="block" color="primary" onClick={() => dispatch(checkout())} className="checkout-btn" data-testid="checkout-btn">
              <IonIcon slot="start" icon={cardOutline} />
              Checkout — {formatCurrency(total)}
            </IonButton>
      )}
      </IonContent>
      
      {receipt && <ReceiptModal receipt={receipt} />}
    </>
  );
};

export default CartPage;