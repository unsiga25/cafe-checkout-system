import React from 'react';
import { IonIcon } from '@ionic/react';
import { arrowDownOutline, arrowUpOutline, searchOutline } from 'ionicons/icons';
import { SortField, SortOrder } from '../types';
import { setSearchQuery, setSortField } from '../store/menuSlice';
import { useAppDispatch } from '../hooks/redux';

interface Props {
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: 'Name', field: 'title' },
  { label: 'Price', field: 'price' },
  { label: 'Category', field: 'category' },
];

const SearchSortBar: React.FC<Props> = ({ searchQuery, sortField, sortOrder }) => {
  const dispatch = useAppDispatch();
  return (
    <div className="ssb-wrap">
      {/* Search */}
      <div className="ssb-search-row">
        <div className="ssb-search-box">
          <IonIcon icon={searchOutline} className="ssb-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search name, price, category…"
            className="ssb-input"
            data-testid="search-bar"
          />
          {searchQuery && (
            <button
              className="ssb-clear"
              onClick={() => dispatch(setSearchQuery(''))}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="ssb-sort-row">
        <span className="ssb-sort-label">Sort by</span>
        <div className="ssb-sort-pills">
          {SORT_OPTIONS.map(({ label, field }) => (
            <button
              key={field}
              className={`ssb-pill ${sortField === field ? 'ssb-pill-active' : ''}`}
              onClick={() => dispatch(setSortField(field))}
              data-testid={`sort-${field}`}
            >
              {label}
              {sortField === field && (
                <IonIcon
                  icon={sortOrder === 'asc' ? arrowUpOutline : arrowDownOutline}
                  className="ssb-sort-arrow"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSortBar;