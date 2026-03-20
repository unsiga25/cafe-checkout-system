import React from 'react';
import { IonBadge } from '@ionic/react';
import { useAppSelector } from '../hooks/redux';
import { selectCartItemCount } from '../store/selectors';

const CartBadge: React.FC = () => {
  const count = useAppSelector(selectCartItemCount);
  if (count === 0) return null;
  return <IonBadge color="danger" data-testid="cart-badge">{count > 99 ? '99+' : count}</IonBadge>;
};

export default CartBadge;