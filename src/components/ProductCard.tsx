import React, { useState } from 'react';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonChip, IonIcon, IonImg, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import { cartOutline, cafe, restaurant } from 'ionicons/icons';
import { DrinkSize, Product } from '../types';
import { SIZE_MULTIPLIERS, formatCurrency, getSizeAdjustedPrice } from '../utils';
import { addToCart } from '../store/cartSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props { product: Product; }
const SIZES: DrinkSize[] = ['Small', 'Medium', 'Large'];

const ProductCard: React.FC<Props> = ({ product }) => {
  const dispatch = useAppDispatch();
  const [selectedSize, setSelectedSize] = useState<DrinkSize>('Medium');
  const effectivePrice = product.isDrink
    ? getSizeAdjustedPrice(product.price, selectedSize)
    : product.price;

  return (
    <IonCard className="product-card">
      <IonImg src={product.thumbnail} alt={product.title} className="product-img" />
      <IonCardHeader>
        <IonChip color={product.isDrink ? 'tertiary' : 'success'} className="category-chip">
          <IonIcon icon={product.isDrink ? cafe : restaurant} />
          <IonLabel>{product.category}</IonLabel>
        </IonChip>
        <IonCardTitle className="product-title">{product.title}</IonCardTitle>
        <IonCardSubtitle className="product-price">{formatCurrency(effectivePrice)}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        {product.isDrink && (
          <div className="size-selector">
            <IonSelect
              aria-label="Size"
              value={selectedSize}
              onIonChange={(e) => setSelectedSize(e.detail.value as DrinkSize)}
              interface="popover"
              className="size-select"
            >
              {SIZES.map((size) => (
                <IonSelectOption key={size} value={size}>
                  {size} ({formatCurrency(getSizeAdjustedPrice(product.price, size))})
                  {SIZE_MULTIPLIERS[size] < 1 ? ' 🔽' : SIZE_MULTIPLIERS[size] > 1 ? ' 🔼' : ''}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
        )}
        <IonButton expand="block" onClick={() => dispatch(addToCart({ product, size: product.isDrink ? selectedSize : undefined }))} className="add-btn" data-testid="add-to-cart-btn">
          <IonIcon slot="start" icon={cartOutline} />
          Add to Cart
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductCard;