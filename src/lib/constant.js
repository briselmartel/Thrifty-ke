// These must match the id column in the categories table exactly -
// listings.category is a foreign key into that table, not free text.
export const CATEGORIES = [
  { slug: 'fashion', label: 'Fashion' },
  { slug: 'electronics', label: 'Electronics' },
  { slug: 'phones', label: 'Phones & Refurb' },
  { slug: 'furniture', label: 'Furniture' },
  { slug: 'baby', label: 'Baby & Kids' },
  { slug: 'books', label: 'Books' },
  { slug: 'thrift', label: 'Thrift Finds' },
  { slug: 'sports', label: 'Sports' },
  { slug: 'bulk', label: 'Bulk / Wholesale' },
  { slug: 'art', label: 'Interior Design & Decor' },
]

// Seller types - clothing sellers get the extra "thrift store" option
export const SELLER_TYPES = [
  { value: 'individual', label: 'Individual declutterer', hint: 'Selling personal pre-loved items' },
  { value: 'shop', label: 'Shop / Business', hint: 'A registered shop selling multiple categories' },
  { value: 'thrift_store', label: 'Thrift store (Mitumba)', hint: 'A dedicated thrift/mitumba clothing store' },
]

export const CONDITIONS = [
  'Brand new',
  'Like new',
  'Good - light wear',
  'Fair - visible wear',
]

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_SUBMITTED: 'payment_submitted',
  ESCROW_HELD: 'escrow_held',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  RELEASED: 'released',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
}

export const CONTACT = {
  phone: '0799 505 257',
  phoneHref: 'tel:+254799505257',
  email: 'kaixaden6@gmail.com',
}

export const BANK_DETAILS = {
  bankName: 'Equity Bank',
  accountName: 'Stacey Wangoi',
  accountNumber: '0840182941357',
  branch: 'Not required - Equity accounts can be paid to nationwide',
  swift: 'Add SWIFT/BIC if receiving from outside Kenya',
}

export const POCHI_DETAILS = {
  name: 'Stacey Wangoi',
  phone: '0799 505 257',
}