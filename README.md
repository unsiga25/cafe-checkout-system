# ☕ Brew & Bite Café — Checkout System

A mobile-friendly café checkout app built with **React + TypeScript**, **Redux Toolkit**, and **Ionic Framework**. Customers browse a live menu, customize their orders, manage a cart, and complete checkout with a generated receipt.

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run
```bash
# 1. Clone or unzip the project
cd cafe-checkout

# 2. Create your .env file in the project root
echo "VITE_API_URL=https://[your-id].mockapi.io" > .env

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
# → Opens at http://localhost:5173
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |

## Design Decisions

### State Shape

The Redux store is split into two independent slices:

**`menu` slice**
```
items: Product[]        — all products fetched and deduplicated from MockAPI
status                  — idle | loading | succeeded | failed
error: string | null    — shown in the retry UI
searchQuery: string     — fuzzy search input (debounced 200ms)
sortField               — title | price | category
sortOrder               — asc | desc, toggled on repeated clicks
```

**`cart` slice**
```
items: CartItem[]       — active cart entries with full customization data
receipt: Receipt | null — set on checkout, cleared when user dismisses modal
```

Splitting them keeps each reducer focused and independently testable. Menu and cart have completely different lifecycles — the menu persists for the session while the cart empties on checkout.

### Cart Item Identity

Each `CartItem` has a `cartItemId` built from the product ID plus all selected options, sorted and joined:
```
cartItemId = productId + "__" + sorted("key:value" pairs)

e.g. "1__milk:Oat|size:Large|temperature:Iced"
```

This means:
- Same product + same options → quantity increments (one row)
- Same product + different size → two separate entries
- Same product + different milk → two separate entries

This matches real café POS behaviour and is handled entirely inside `cartSlice` with no component logic.

### Component Structure
```
components/
├── ProductCard.tsx       — tappable card with hover overlay, navigates to detail page
├── CartItemRow.tsx       — cart row with inline size editing for drinks
├── ReceiptModal.tsx      — post-checkout receipt with timestamp
├── SearchSortBar.tsx     — native input + pill sort buttons
└── CartBadge.tsx         — live item count on the tab bar

pages/
├── MenuPage.tsx          — product tile grid
├── ProductDetailPage.tsx — dynamic customization dropdowns + add to cart
└── CartPage.tsx          — two-column layout: item list + order summary card
```

All components are **presentational + dispatch only** — no component owns async logic. State flows: `user action → dispatch → slice reducer → selector → re-render`.

### Dynamic Customizations

Each product in MockAPI has a `customizations` field:
```json
{
  "size": ["Small", "Medium", "Large"],
  "milk": ["Whole", "Oat", "Soy"],
  "sugar": ["0%", "25%", "50%", "100%"]
}
```

`ProductDetailPage` iterates `Object.entries(product.customizations)` dynamically — there are no hardcoded option types anywhere. Adding a new key to a product in MockAPI (e.g. `"roast": ["Light", "Dark"]`) automatically renders a new dropdown with zero code changes.

The `size` key is the only special case: it drives the price multiplier via `getSizeAdjustedPrice` (Small 0.8×, Medium 1.0×, Large 1.25×).

### Fuzzy Search

Search is a multi-token substring match across `title + price + category + ingredients`:
- Query is split on whitespace into tokens
- All tokens must appear in the searchable string (AND logic)
- Case-insensitive
- No external library

Trade-off: does not handle typos. Acceptable for a café menu where names are short and predictable.

### Ionic Integration

- **Navigation** — `IonReactRouter` + `IonTabs` + `IonRouterOutlet` (bottom tab bar)
- **Components** — `IonCard`, `IonModal`, `IonSelect`, `IonTextarea`, `IonRefresher`, `IonSpinner`
- **Theming** — CSS custom properties in `src/theme/variables.css` override all Ionic color tokens with a warm espresso-brown palette
- **SearchSortBar** uses a plain `<input>` instead of `IonSearchbar` to avoid Ionic event timing issues with debounced Redux dispatches

---

## Known Limitations

**Data & API**
- No persistence — cart and receipt live in memory only; refreshing the page clears the cart
- MockAPI free tier is rate-limited to 100 requests/day
- `isDrink` classification is based on category name substring matching — unusual category names may be misclassified
- Prices are stored as floats; edge cases are mitigated by `.toFixed(2)` but not eliminated entirely

**Functionality**
- No payment integration — checkout generates a receipt but does not process a real payment
- No user authentication — single-session, single-user demo with no login or order history
- No inventory management — items can always be added regardless of stock
- No offline support — requires internet connection to load the menu
- Cart is not persisted to `localStorage` — closing the tab loses the cart

**UI & UX**
- Hover overlays on product cards are desktop-only; touch devices have no hover state
- No dark mode — the warm cream theme is light-only
- The receipt modal does not support printing or PDF export

**Testing**
- Ionic components are mocked with plain HTML elements — tests do not cover Ionic-specific behaviour such as `IonSelect` popover interactions
- No end-to-end (E2E) tests — Playwright or Cypress coverage is not included
- The async thunk is not tested against a mock server

---

## Test Coverage

| File | Type | Tests | What's covered |
|---|---|---|---|
| `utils.test.ts` | Unit | 54 | `fuzzyMatch`, `filterProducts`, `deduplicateProducts`, `getSizeAdjustedPrice`, `calcSubtotal`, `calcServiceCharge`, `formatCurrency`, `formatOptionKey`, `isDrinkCategory` |
| `cartSlice.test.ts` | Unit / Redux | 22 | `addToCart`, `removeFromCart`, `updateQuantity`, `updateItemOptions`, `checkout`, `clearReceipt` |
| `components.test.tsx` | Component + Integration | 24 | `CartItemRow` render + interactions, `ReceiptModal` render + dismiss, cart integration flow |

**Total: 100 tests.** Run with `npm test`.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build tool | Vite 5 |
| State | Redux Toolkit + React Redux |
| UI library | Ionic Framework v7 |
| Routing | Ionic React Router + React Router v5 |
| Testing | Vitest + React Testing Library |
| API | MockAPI.io (REST) |