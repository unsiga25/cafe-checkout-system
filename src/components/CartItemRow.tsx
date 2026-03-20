import React from 'react';
import {
  IonButton, IonButtons, IonIcon, IonItem, IonLabel,
  IonNote, IonThumbnail, IonImg, IonBadge,
} from '@ionic/react';
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { CartItem as CartItemType } from '../types';
import { formatCurrency } from '../utils';
import { removeFromCart, updateQuantity } from '../store/cartSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props { item: CartItemType; }

const CartItemRow: React.FC<Props> = ({ item }) => {
  const dispatch = useAppDispatch();
  return (
    <IonItem className="cart-item" data-testid="cart-item">
      <IonThumbnail slot="start">
        <IonImg src={item.product.thumbnail} alt={item.product.title} />
      </IonThumbnail>
      <IonLabel>
        <h2 className="cart-item-title">{item.product.title}</h2>
        {item.size && <IonBadge color="tertiary" className="size-badge">{item.size}</IonBadge>}
        <p className="cart-item-price">{formatCurrency(item.unitPrice)} each</p>
      </IonLabel>
      <IonNote slot="end" className="cart-item-subtotal">{formatCurrency(item.unitPrice * item.quantity)}</IonNote>
      <IonButtons slot="end" className="qty-buttons">
        <IonButton fill="clear" size="small" onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, delta: -1 }))} aria-label="Decrease quantity" data-testid="decrease-qty">
          <IonIcon icon={removeOutline} />
        </IonButton>
        <span className="qty-display" data-testid="qty-display">{item.quantity}</span>
        <IonButton fill="clear" size="small" onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, delta: 1 }))} aria-label="Increase quantity" data-testid="increase-qty">
          <IonIcon icon={addOutline} />
        </IonButton>
        <IonButton fill="clear" size="small" color="danger" onClick={() => dispatch(removeFromCart(item.cartItemId))} aria-label="Remove item" data-testid="remove-item">
          <IonIcon icon={trashOutline} />
        </IonButton>
      </IonButtons>
    </IonItem>
  );
};

export default CartItemRow;