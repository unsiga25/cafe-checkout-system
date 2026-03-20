import React from 'react';
import { IonContent, IonText, IonButton, IonIcon } from '@ionic/react';
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
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <IonIcon icon={bagHandleOutline} />
            </div>
            <p className="cart-empty-title">Your cart is empty</p>
            <p className="cart-empty-sub">Add items from the menu to get started</p>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Items ──────────────────────────────────── */}
            <div className="cart-items-wrap">
              <p className="cart-section-label">Your Order</p>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <CartItemRow key={item.cartItemId} item={item} />
                ))}
              </div>
            </div>

            {/* ── Summary ────────────────────────────────── */}
            <div className="cart-summary-wrap">
              <p className="cart-section-label">Order Summary</p>
              <div className="cart-summary-card">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">{formatCurrency(subtotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Service Charge <span className="cart-summary-muted">(10%)</span></span>
                  <span>{formatCurrency(serviceCharge)}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-total">
                  <span>Total</span>
                  <span data-testid="cart-total">{formatCurrency(total)}</span>
                </div>

                <IonButton
                  expand="block"
                  onClick={() => dispatch(checkout())}
                  className="cart-checkout-btn"
                  data-testid="checkout-btn"
                >
                  <IonIcon slot="start" icon={cardOutline} />
                  Checkout — {formatCurrency(total)}
                </IonButton>

                <p className="cart-summary-note">
                  Prices include all applicable taxes. Service charge is non-negotiable.
                </p>
              </div>
            </div>

          </div>
        )}
      </IonContent>

      {receipt && <ReceiptModal receipt={receipt} />}
    </>
  );
};

export default CartPage;