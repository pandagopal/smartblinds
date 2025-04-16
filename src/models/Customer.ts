export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
  type: 'billing' | 'shipping' | 'installation';
}

export interface WindowMeasurement {
  id: string;
  name: string;
  room: string;
  width: number;
  height: number;
  depth?: number;
  mountType: 'inside' | 'outside';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInteraction {
  id: string;
  type: 'call' | 'email' | 'visit' | 'quote' | 'order' | 'installation' | 'service' | 'followup';
  date: Date;
  notes: string;
  employeeId: string;
  employeeName: string;
  result?: string;
  followUpDate?: Date;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone?: string;
  addresses: Address[];
  measurements?: WindowMeasurement[];
  source?: string;
  notes?: string;
  salesRepId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactDate?: Date;
  interactions?: CustomerInteraction[];
  isProspect: boolean;
  status: 'active' | 'inactive' | 'lead';
  tags?: string[];
  preferredContactMethod?: 'email' | 'phone' | 'text';
  preferredContactTime?: 'morning' | 'afternoon' | 'evening';
}

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    addresses: [
      {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        country: 'US',
        isDefault: true,
        type: 'installation'
      }
    ],
    measurements: [
      {
        id: 'm1',
        name: 'Living Room Window 1',
        room: 'Living Room',
        width: 36,
        height: 48,
        mountType: 'inside',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      },
      {
        id: 'm2',
        name: 'Master Bedroom Window',
        room: 'Master Bedroom',
        width: 42,
        height: 60,
        mountType: 'outside',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15')
      }
    ],
    source: 'Website',
    salesRepId: 'sr123',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-04-01'),
    lastContactDate: new Date('2023-04-01'),
    interactions: [
      {
        id: 'i1',
        type: 'call',
        date: new Date('2023-01-20'),
        notes: 'Discussed options for living room blinds',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Interested in cellular shades, scheduled in-home measurement'
      },
      {
        id: 'i2',
        type: 'visit',
        date: new Date('2023-01-25'),
        notes: 'Completed measurements for all windows',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Measurements recorded, discussed product options'
      },
      {
        id: 'i3',
        type: 'quote',
        date: new Date('2023-01-26'),
        notes: 'Sent quote for all windows',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        followUpDate: new Date('2023-02-02')
      },
      {
        id: 'i4',
        type: 'call',
        date: new Date('2023-02-02'),
        notes: 'Follow-up call about quote',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Customer still deciding, will call back next week'
      },
      {
        id: 'i5',
        type: 'call',
        date: new Date('2023-04-01'),
        notes: 'Customer called to proceed with order',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Order placed for living room and master bedroom windows'
      }
    ],
    isProspect: false,
    status: 'active',
    tags: ['repeat customer', 'premium'],
    preferredContactMethod: 'email',
    preferredContactTime: 'evening'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 987-6543',
    addresses: [
      {
        street: '456 Oak Avenue',
        city: 'Sometown',
        state: 'NY',
        zip: '10001',
        country: 'US',
        isDefault: true,
        type: 'installation'
      }
    ],
    source: 'Referral',
    salesRepId: 'sr456',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    lastContactDate: new Date('2023-03-10'),
    interactions: [
      {
        id: 'i6',
        type: 'call',
        date: new Date('2023-03-10'),
        notes: 'Initial call to discuss window treatment options',
        employeeId: 'sr456',
        employeeName: 'Michael Johnson',
        result: 'Interested in motorized roller shades'
      }
    ],
    isProspect: true,
    status: 'lead',
    preferredContactMethod: 'phone',
    preferredContactTime: 'afternoon'
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    phone: '(555) 555-5555',
    addresses: [
      {
        street: '789 Pine Street',
        city: 'Othertown',
        state: 'TX',
        zip: '75001',
        country: 'US',
        isDefault: true,
        type: 'installation'
      }
    ],
    source: 'Google Search',
    salesRepId: 'sr123',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-03-15'),
    lastContactDate: new Date('2023-03-15'),
    interactions: [
      {
        id: 'i7',
        type: 'email',
        date: new Date('2023-02-20'),
        notes: 'Customer inquired about shutters for sunroom',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Sent product information and pricing'
      },
      {
        id: 'i8',
        type: 'call',
        date: new Date('2023-03-01'),
        notes: 'Follow-up call to discuss options',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Scheduled in-home consultation'
      },
      {
        id: 'i9',
        type: 'visit',
        date: new Date('2023-03-15'),
        notes: 'Completed measurements for sunroom',
        employeeId: 'sr123',
        employeeName: 'Sarah Parker',
        result: 'Customer decided on plantation shutters',
        followUpDate: new Date('2023-03-22')
      }
    ],
    isProspect: false,
    status: 'active',
    tags: ['high-value'],
    preferredContactMethod: 'email'
  }
];

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  date: Date;
  expiryDate: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  totalAmount: number;
  discountAmount?: number;
  discountPercent?: number;
  salesRepId: string;
  salesRepName: string;
  notes?: string;
  items: QuoteItem[];
  signatures?: {
    customer?: {
      name: string;
      signature: string;
      date: Date;
    };
    salesRep?: {
      name: string;
      signature: string;
      date: Date;
    };
  };
  terms?: string;
  paymentTerms?: string;
  installationDate?: Date;
  installationNotes?: string;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  quantity: number;
  width: number;
  height: number;
  mountType: 'inside' | 'outside';
  color: string;
  fabric?: string;
  controlType?: string;
  controlPosition?: 'left' | 'right' | 'center';
  roomName?: string;
  unitPrice: number;
  totalPrice: number;
  discountedPrice?: number;
  options: {
    name: string;
    value: string;
    price: number;
  }[];
  notes?: string;
}

export const SAMPLE_QUOTES: Quote[] = [
  {
    id: 'q1',
    customerId: '1',
    customerName: 'John Smith',
    date: new Date('2023-01-26'),
    expiryDate: new Date('2023-02-26'),
    status: 'accepted',
    totalAmount: 1250.00,
    discountAmount: 125.00,
    discountPercent: 10,
    salesRepId: 'sr123',
    salesRepName: 'Sarah Parker',
    notes: 'Customer prefers installation in the morning',
    items: [
      {
        id: 'qi1',
        productId: 'p1',
        productName: 'Energy-Efficient Cellular Shades',
        productType: 'Cellular Shades',
        quantity: 1,
        width: 36,
        height: 48,
        mountType: 'inside',
        color: 'Cloud White',
        controlType: 'Cordless',
        roomName: 'Living Room',
        unitPrice: 425.00,
        totalPrice: 425.00,
        options: [
          {
            name: 'Cordless Lift',
            value: 'Yes',
            price: 50.00
          },
          {
            name: 'Top Down/Bottom Up',
            value: 'Yes',
            price: 75.00
          }
        ],
        notes: 'Position on north-facing wall'
      },
      {
        id: 'qi2',
        productId: 'p2',
        productName: 'Premium Day/Night Cellular Shades',
        productType: 'Cellular Shades',
        quantity: 1,
        width: 42,
        height: 60,
        mountType: 'outside',
        color: 'Alabaster',
        controlType: 'Motorized',
        controlPosition: 'right',
        roomName: 'Master Bedroom',
        unitPrice: 825.00,
        totalPrice: 825.00,
        options: [
          {
            name: 'Motorization',
            value: 'WiFi Smart Control',
            price: 200.00
          }
        ]
      }
    ],
    signatures: {
      customer: {
        name: 'John Smith',
        signature: 'John Smith',
        date: new Date('2023-02-01')
      },
      salesRep: {
        name: 'Sarah Parker',
        signature: 'Sarah Parker',
        date: new Date('2023-01-26')
      }
    },
    terms: 'Standard terms and conditions apply. All sales are final once measurements are confirmed.',
    paymentTerms: '50% deposit required to confirm order. Balance due upon installation.',
    installationDate: new Date('2023-03-15')
  },
  {
    id: 'q2',
    customerId: '3',
    customerName: 'Robert Johnson',
    date: new Date('2023-03-16'),
    expiryDate: new Date('2023-04-16'),
    status: 'sent',
    totalAmount: 3200.00,
    discountAmount: 320.00,
    discountPercent: 10,
    salesRepId: 'sr123',
    salesRepName: 'Sarah Parker',
    notes: 'Customer is comparing options with competitor',
    items: [
      {
        id: 'qi3',
        productId: 'p3',
        productName: 'Plantation Shutters - Premium',
        productType: 'Shutters',
        quantity: 3,
        width: 48,
        height: 72,
        mountType: 'inside',
        color: 'Designer White',
        roomName: 'Sunroom',
        unitPrice: 950.00,
        totalPrice: 2850.00,
        options: [
          {
            name: 'Hidden Tilt Rod',
            value: 'Yes',
            price: 75.00
          },
          {
            name: 'Divider Rail',
            value: 'Yes',
            price: 45.00
          }
        ]
      },
      {
        id: 'qi4',
        productId: 'p4',
        productName: 'Valance',
        productType: 'Accessories',
        quantity: 1,
        width: 144,
        height: 10,
        mountType: 'outside',
        color: 'Designer White',
        roomName: 'Sunroom',
        unitPrice: 350.00,
        totalPrice: 350.00,
        options: []
      }
    ],
    terms: 'Standard terms and conditions apply. All sales are final once measurements are confirmed.',
    paymentTerms: '50% deposit required to confirm order. Balance due upon installation.'
  }
];

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  salesRepId: string;
  salesRepName: string;
  type: 'initial consultation' | 'measurement' | 'quote presentation' | 'installation' | 'service' | 'follow-up';
  date: Date;
  startTime: string; // '13:30'
  endTime: string; // '15:00'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  address: Address;
  notes?: string;
  reminderSent: boolean;
  confirmationSent: boolean;
  priority: 'low' | 'medium' | 'high';
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    customerId: '2',
    customerName: 'Jane Doe',
    salesRepId: 'sr456',
    salesRepName: 'Michael Johnson',
    type: 'initial consultation',
    date: new Date('2023-04-15'),
    startTime: '10:00',
    endTime: '11:30',
    status: 'scheduled',
    address: {
      street: '456 Oak Avenue',
      city: 'Sometown',
      state: 'NY',
      zip: '10001',
      country: 'US',
      type: 'installation'
    },
    notes: 'Customer interested in motorized blinds for the entire house. Bring samples of premium fabrics.',
    reminderSent: true,
    confirmationSent: true,
    priority: 'high'
  },
  {
    id: 'a2',
    customerId: '3',
    customerName: 'Robert Johnson',
    salesRepId: 'sr123',
    salesRepName: 'Sarah Parker',
    type: 'measurement',
    date: new Date('2023-03-28'),
    startTime: '14:00',
    endTime: '15:30',
    status: 'completed',
    address: {
      street: '789 Pine Street',
      city: 'Othertown',
      state: 'TX',
      zip: '75001',
      country: 'US',
      type: 'installation'
    },
    notes: 'Need to measure sunroom and discuss shutter options.',
    reminderSent: true,
    confirmationSent: true,
    priority: 'medium',
    outcome: 'All measurements completed. Customer decided on plantation shutters.',
    followUpRequired: true,
    followUpDate: new Date('2023-04-04')
  },
  {
    id: 'a3',
    customerId: '1',
    customerName: 'John Smith',
    salesRepId: 'sr123',
    salesRepName: 'Sarah Parker',
    type: 'installation',
    date: new Date('2023-04-20'),
    startTime: '09:00',
    endTime: '12:00',
    status: 'scheduled',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '90210',
      country: 'US',
      type: 'installation'
    },
    notes: 'Installation of cellular shades in living room and master bedroom.',
    reminderSent: false,
    confirmationSent: false,
    priority: 'medium'
  }
];

// Helper functions for managing customers, quotes, and appointments
export const customerService = {
  getCustomerById: (id: string): Customer | undefined => {
    return SAMPLE_CUSTOMERS.find(customer => customer.id === id);
  },

  searchCustomers: (query: string): Customer[] => {
    if (!query) return SAMPLE_CUSTOMERS;

    const lowerQuery = query.toLowerCase();
    return SAMPLE_CUSTOMERS.filter(customer =>
      customer.firstName.toLowerCase().includes(lowerQuery) ||
      customer.lastName.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(query)
    );
  },

  getCustomerQuotes: (customerId: string): Quote[] => {
    return SAMPLE_QUOTES.filter(quote => quote.customerId === customerId);
  },

  getCustomerAppointments: (customerId: string): Appointment[] => {
    return SAMPLE_APPOINTMENTS.filter(appointment => appointment.customerId === customerId);
  }
};
