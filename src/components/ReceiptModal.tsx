import React from 'react';
import {
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonItem, IonLabel, IonList, IonNote, IonFooter, IonButtons,
} from '@ionic/react';
import { checkmarkCircleOutline, closeOutline, printOutline } from 'ionicons/icons';
import { Receipt } from '../types';
import { formatCurrency } from '../utils';
import { clearReceipt } from '../store/cartSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props { receipt: Receipt; }

const ReceiptModal: React.FC<Props> = ({ receipt }) => {
  const dispatch = useAppDispatch();
  const formattedTime = new Date(receipt.timestamp).toLocaleString();

  return (
    <IonModal isOpen={true} className="receipt-modal" data-testid="receipt-modal">
      <IonHeader>
        <IonToolbar color="success">
          <IonTitle>
            <IonIcon icon={checkmarkCircleOutline} className="receipt-icon" /> Order Complete!
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => dispatch(clearReceipt())} aria-label="Close receipt">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="receipt-content">
        <div className="receipt-paper">
          <div className="receipt-header">
            <h2 className="cafe-name">☕ Brew & Bite Café</h2>
            <p className="receipt-time">{formattedTime}</p>
            <div className="receipt-divider" />
          </div>
          <IonList lines="none" className="receipt-list">
            {receipt.items.map((item) => (
              <IonItem key={item.cartItemId} className="receipt-row">
                <IonLabel>
                  <span className="receipt-item-name">{item.product.title}</span>
                  {item.size && <span className="receipt-size"> ({item.size})</span>}
                  <span className="receipt-qty"> ×{item.quantity}</span>
                </IonLabel>
                <IonNote slot="end" className="receipt-item-total">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </IonNote>
              </IonItem>
            ))}
          </IonList>
          <div className="receipt-divider" />
          <div className="receipt-totals">
            <div className="receipt-row-total">
              <span>Subtotal</span>
              <span data-testid="receipt-subtotal">{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="receipt-row-total">
              <span>Service Charge (10%)</span>
              <span data-testid="receipt-service">{formatCurrency(receipt.serviceCharge)}</span>
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row-total receipt-grand-total">
              <span>Total</span>
              <span data-testid="receipt-total">{formatCurrency(receipt.total)}</span>
            </div>
          </div>
          <div className="receipt-footer"><p>Thank you for your order! 🙏</p></div>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" color="medium" onClick={() => dispatch(clearReceipt())} className="close-receipt-btn" data-testid="close-receipt-btn">
            <IonIcon slot="start" icon={printOutline} />
            Done
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ReceiptModal;