import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonIcon, IonImg, IonSelect, IonSelectOption, IonTextarea,
  IonText, IonSpinner,
} from '@ionic/react';
import { addOutline, removeOutline, cartOutline } from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addToCart } from '../store/cartSlice';
import { formatCurrency, formatOptionKey, getSizeAdjustedPrice } from '../utils';

const NUTRI_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  a: { bg: '#1D9E75', text: '#fff', label: 'A' },
  b: { bg: '#639922', text: '#fff', label: 'B' },
  c: { bg: '#BA7517', text: '#fff', label: 'C' },
  d: { bg: '#D85A30', text: '#fff', label: 'D' },
  e: { bg: '#A32D2D', text: '#fff', label: 'E' },
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const menuStatus = useAppSelector((s) => s.menu.status);
  const allItems = useAppSelector((s) => s.menu.items);
  const product = allItems.find((p) => String(p.id) === String(id));

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (product?.customizations) {
      const defaults = Object.fromEntries(
        Object.entries(product.customizations)
          .filter(([, vals]) => vals && vals.length > 0)
          .map(([key, vals]) => [key, vals![0]])
      );
      setSelectedOptions(defaults);
    }
  }, [product]);

  if (menuStatus === 'idle' || menuStatus === 'loading') {
    return (
      <>
        <IonHeader><IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/menu" /></IonButtons>
          <IonTitle>Loading…</IonTitle>
        </IonToolbar></IonHeader>
        <IonContent><div className="loading-container"><IonSpinner name="crescent" color="primary" /></div></IonContent>
      </>
    );
  }

  if (menuStatus === 'failed' || !product) {
    return (
      <>
        <IonHeader><IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/menu" /></IonButtons>
          <IonTitle>Not Found</IonTitle>
        </IonToolbar></IonHeader>
        <IonContent>
          <div className="empty-container">
            <IonText color="danger"><p>Product not found.</p></IonText>
            <IonButton onClick={() => history.push('/menu')}>Back to Menu</IonButton>
          </div>
        </IonContent>
      </>
    );
  }

  const effectivePrice = getSizeAdjustedPrice(product.price, selectedOptions['size']);
  const lineTotal = parseFloat((effectivePrice * quantity).toFixed(2));
  const customizationEntries = Object.entries(product.customizations ?? {}).filter(
    ([, values]) => values && values.length > 0
  );
  const nutri = NUTRI_COLOR[product.nutriScore?.toLowerCase()] ?? { bg: '#888', text: '#fff', label: product.nutriScore?.toUpperCase() };

  const handleAddToCart = () => {
    dispatch(addToCart({ product, selectedOptions, specialInstructions: instructions.trim(), quantity }));
    history.push('/cart');
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/menu" /></IonButtons>
          <IonTitle>{product.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="detail-content">
        <div className="dp-layout">

          {/* ── Left column — image ───────────────────────── */}
          <div className="dp-left">
            <div className="dp-img-wrap">
              <IonImg src={product.thumbnail} alt={product.title} className="dp-img" />
              <div className="dp-nutri" style={{ background: nutri.bg, color: nutri.text }}>
                Nutri-Score {nutri.label}
              </div>
            </div>

            {/* Allergens + ingredients below image on desktop */}
            <div className="dp-info-card">
              <p className="dp-info-label">Allergens</p>
              <p className="dp-info-value">{product.allergens}</p>
              {product.ingredients && product.ingredients !== 'Not listed' && (
                <>
                  <p className="dp-info-label" style={{ marginTop: 12 }}>Ingredients</p>
                  <p className="dp-info-value">{product.ingredients}</p>
                </>
              )}
            </div>
          </div>

          {/* ── Right column — details ────────────────────── */}
          <div className="dp-right">

            {/* Title + price */}
            <div className="dp-title-row">
              <div>
                <h1 className="dp-title">{product.title}</h1>
                <p className="dp-category">{product.category}</p>
              </div>
              <div className="dp-price">{formatCurrency(effectivePrice)}</div>
            </div>

            {product.description && (
              <p className="dp-desc">{product.description}</p>
            )}

            {/* Customizations */}
            {customizationEntries.length > 0 && (
              <div className="dp-section">
                <p className="dp-section-title">Customize</p>
                <div className="dp-options-grid">
                  {customizationEntries.map(([key, values]) => (
                    <div key={key} className="dp-option-row">
                      <label className="dp-option-label">{formatOptionKey(key)}</label>
                      <IonSelect
                        value={selectedOptions[key]}
                        onIonChange={(e) =>
                          setSelectedOptions((prev) => ({ ...prev, [key]: e.detail.value as string }))
                        }
                        interface="popover"
                        className="dp-select"
                        aria-label={formatOptionKey(key)}
                      >
                        {(values ?? []).map((option) => (
                          <IonSelectOption key={option} value={option}>
                            {option}
                            {key === 'size' && option === 'Small' ? ' (−20%)' : ''}
                            {key === 'size' && option === 'Large' ? ' (+25%)' : ''}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special instructions */}
            <div className="dp-section">
              <p className="dp-section-title">Special Instructions</p>
              <IonTextarea
                value={instructions}
                onIonInput={(e) => setInstructions(e.detail.value ?? '')}
                placeholder="E.g. extra hot, no foam, allergy notes…"
                rows={3}
                className="dp-textarea"
              />
            </div>

            {/* Quantity + Add to Cart */}
            <div className="dp-footer">
              <div className="dp-qty">
                <button
                  className="dp-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <IonIcon icon={removeOutline} />
                </button>
                <span className="dp-qty-val">{quantity}</span>
                <button
                  className="dp-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <IonIcon icon={addOutline} />
                </button>
              </div>

              <IonButton
                expand="block"
                onClick={handleAddToCart}
                className="dp-add-btn"
                data-testid="add-to-cart-detail"
              >
                <IonIcon slot="start" icon={cartOutline} />
                Add to Cart — {formatCurrency(lineTotal)}
              </IonButton>
            </div>

          </div>
        </div>
      </IonContent>
    </>
  );
};

export default ProductDetailPage;