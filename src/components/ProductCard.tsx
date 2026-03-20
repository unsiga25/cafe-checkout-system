import React from 'react';
import { IonIcon, IonImg } from '@ionic/react';
import { cafe, restaurant, cartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface Props { product: Product; }

const NUTRI_DOT: Record<string, string> = {
  a: '#1D9E75', b: '#639922', c: '#BA7517', d: '#D85A30', e: '#A32D2D',
};

const ProductCard: React.FC<Props> = ({ product }) => {
  const history = useHistory();

  return (
    <div
      className="pc-card"
      onClick={() => history.push(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="pc-img-wrap">
        <IonImg src={product.thumbnail} alt={product.title} className="pc-img" />
        <div className="pc-hover-overlay">
          <div className="pc-hover-pill">
            <IonIcon icon={cartOutline} />
            Customize & Order
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pc-body">
        {/* Category chip */}
        <div className="pc-chip-row">
          <span className={`pc-chip ${product.isDrink ? 'pc-chip-drink' : 'pc-chip-food'}`}>
            <IonIcon icon={product.isDrink ? cafe : restaurant} />
            {product.category}
          </span>
          {product.nutriScore && (
            <span
              className="pc-nutri-dot"
              style={{ background: NUTRI_DOT[product.nutriScore] ?? '#888' }}
              title={`Nutri-Score ${product.nutriScore.toUpperCase()}`}
            >
              {product.nutriScore.toUpperCase()}
            </span>
          )}
        </div>

        <p className="pc-title">{product.title}</p>
        <p className="pc-price">{formatCurrency(product.price)}</p>

        {product.description && (
          <p className="pc-desc">{product.description.slice(0, 65)}…</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;