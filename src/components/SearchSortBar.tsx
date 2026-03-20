import React from 'react';
import { IonButton, IonButtons, IonIcon, IonSearchbar, IonToolbar, IonLabel } from '@ionic/react';
import { arrowDownOutline, arrowUpOutline } from 'ionicons/icons';
import { SortField, SortOrder } from '../types';
import { setSearchQuery, setSortField } from '../store/menuSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props { searchQuery: string; sortField: SortField; sortOrder: SortOrder; }

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'Name', field: 'title' },
  { label: 'Price', field: 'price' },
  { label: 'Category', field: 'category' },
];

const SearchSortBar: React.FC<Props> = ({ searchQuery, sortField, sortOrder }) => {
  const dispatch = useAppDispatch();
  return (
    <div className="search-sort-bar">
      <IonSearchbar
        value={searchQuery}
        onIonInput={(e) => dispatch(setSearchQuery(e.detail.value ?? ''))}
        placeholder="Search name, price, category…"
        debounce={200}
        className="product-searchbar"
        data-testid="search-bar"
      />
      <IonToolbar className="sort-toolbar">
        <IonLabel className="sort-label">Sort:</IonLabel>
        <IonButtons slot="start" className="sort-buttons">
          {SORT_OPTIONS.map(({ label, field }) => (
            <IonButton key={field} fill={sortField === field ? 'solid' : 'outline'} color="primary" size="small" onClick={() => dispatch(setSortField(field))} data-testid={`sort-${field}`}>
              {label}
              {sortField === field && <IonIcon slot="end" icon={sortOrder === 'asc' ? arrowUpOutline : arrowDownOutline} />}
            </IonButton>
          ))}
        </IonButtons>
      </IonToolbar>
    </div>
  );
};

export default SearchSortBar;