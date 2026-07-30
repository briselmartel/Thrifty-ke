export const CATEGORIES = [
  { slug: 'clothing', label: 'Clothing & Fashion' },
  { slug: 'electronics', label: 'Electronics' },
  { slug: 'furniture', label: 'Furniture & Seats' },
  { slug: 'home', label: 'Home & Living' },
  { slug: 'kids', label: 'Kids & Baby' },
  { slug: 'beauty', label: 'Beauty & Personal Care' },
  { slug: 'accessories', label: 'Bags & Accessories' },
  { slug: 'other', label: 'Other Finds' },
]

// Seller types — clothing sellers get the extra "thrift store" option
export const SELLER_TYPES = [
  { value: 'individual', label: 'Individual declutterer', hint: 'Selling personal pre-loved items' },
  { value: 'shop', label: 'Shop / Business', hint: 'A registered shop selling multiple categories' },
  { value: 'thrift_store', label: 'Thrift store (Mitumba)', hint: 'A dedicated thrift/mitumba clothing store' },
]

export const CONDITIONS = [
  'Brand new',
  'Like new',
  'Good — light wear',
  'Fair — visible wear',
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
  branch: 'Not required � Equity accounts can be paid to nationwide',
  swift: 'Add SWIFT/BIC if receiving from outside Kenya',
}

