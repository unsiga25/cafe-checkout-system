import React, { useState } from 'react';
import { IonIcon, IonImg, IonSelect, IonSelectOption } from '@ionic/react';
import { addOutline, removeOutline, trashOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import { CartItem as CartItemType } from '../types';
import { formatCurrency, formatOptionKey, getSizeAdjustedPrice } from '../utils';
import { removeFromCart, updateQuantity, updateItemOptions } from '../store/cartSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props { item: CartItemType; }

const SIZES = ['Small', 'Medium', 'Large'];

const CartItemRow: React.FC<Props> = ({ item }) => {
  const dispatch = useAppDispatch();
  const [editingSize, setEditingSize] = useState(false);
  const [pendingSize, setPendingSize] = useState(
    item.selectedOptions['size'] ?? 'Medium'
  );

  const handleSizeConfirm = () => {
    const updated = { ...item.selectedOptions, size: pendingSize };
    dispatch(updateItemOptions({ cartItemId: item.cartItemId, selectedOptions: updated }));
    setEditingSize(false);
  };

  const nonSizeOptions = Object.entries(item.selectedOptions).filter(([key]) => key !== 'size');

  return (
    <div className="ci-row">
      {/* Thumbnail */}
      <div className="ci-thumb">
        <IonImg src={item.product.thumbnail} alt={item.product.title} />
      </div>

      {/* Main content */}
      <div className="ci-body">
        <div className="ci-top">
          <p className="ci-title">{item.product.title}</p>
          <p className="ci-subtotal">{formatCurrency(item.unitPrice * item.quantity)}</p>
        </div>

        {/* Size row for drinks */}
        {item.product.isDrink && (
          <div className="ci-size-row">
            {editingSize ? (
              <div className="ci-size-edit">
                <IonSelect
                  value={pendingSize}
                  onIonChange={(e) => setPendingSize(e.detail.value as string)}
                  interface="popover"
                  aria-label="Size"
                  className="ci-size-select"
                >
                  {SIZES.map((s) => (
                    <IonSelectOption key={s} value={s}>
                      {s} — {formatCurrency(getSizeAdjustedPrice(item.product.price, s))}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                <button className="ci-size-action ci-size-confirm" onClick={handleSizeConfirm}>
                  <IonIcon icon={checkmarkOutline} />
                </button>
                <button
                  className="ci-size-action ci-size-cancel"
                  onClick={() => {
                    setPendingSize(item.selectedOptions['size'] ?? 'Medium');
                    setEditingSize(false);
                  }}
                >
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
            ) : (
              <button className="ci-size-badge" onClick={() => setEditingSize(true)}>
                {item.selectedOptions['size'] ?? 'Medium'} — {formatCurrency(item.unitPrice)}
                <span className="ci-size-edit-hint">✏️</span>
              </button>
            )}
          </div>
        )}

        {/* Other options */}
        {nonSizeOptions.length > 0 && (
          <div className="ci-options">
            {nonSizeOptions.map(([key, value]) => (
              <span key={key} className="ci-option-tag">
                {formatOptionKey(key)}: {value}
              </span>
            ))}
          </div>
        )}

        {item.specialInstructions && (
          <p className="ci-instructions">📝 {item.specialInstructions}</p>
        )}

        {/* Bottom row — price + qty controls */}
        <div className="ci-bottom">
          <p className="ci-unit-price">{formatCurrency(item.unitPrice)} each</p>
          <div className="ci-qty">
            <button
              className="ci-qty-btn"
              onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, delta: -1 }))}
              data-testid="decrease-qty"
            >
              <IonIcon icon={removeOutline} />
            </button>
            <span className="ci-qty-val" data-testid="qty-display">{item.quantity}</span>
            <button
              className="ci-qty-btn"
              onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, delta: 1 }))}
              data-testid="increase-qty"
            >
              <IonIcon icon={addOutline} />
            </button>
            <button
              className="ci-qty-btn ci-qty-delete"
              onClick={() => dispatch(removeFromCart(item.cartItemId))}
              data-testid="remove-item"
            >
              <IonIcon icon={trashOutline} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;