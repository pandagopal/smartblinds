/**
 * Support Service
 *
 * This service manages customer support tickets and feedback
 */
import { authService } from './authService';
import apiClient from './apiClient';

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_CUSTOMER = 'waiting_for_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'support';
  message: string;
  attachments?: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }[];
  timestamp: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: SupportTicketMessage[];
  assignedTo?: string;
}

export interface ProductFeedback {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  text?: string;
  pros?: string[];
  cons?: string[];
  photos?: string[];
  createdAt: Date;
  helpfulVotes?: number;
  verifiedPurchase: boolean;
}

export enum FeedbackType {
  PRODUCT = 'product',
  WEBSITE = 'website',
  SHOPPING_EXPERIENCE = 'shopping_experience',
  CUSTOMER_SERVICE = 'customer_service',
  INSTALLATION = 'installation',
  OTHER = 'other'
}

export interface GeneralFeedback {
  id: string;
  userId: string;
  type: FeedbackType;
  rating: number;
  comment: string;
  contact?: boolean;
  createdAt: Date;
}

// Mock database for support tickets and feedback
const SUPPORT_TICKETS_DB: SupportTicket[] = [
  {
    id: 'ticket-001',
    userId: 'user1',
    subject: 'Missing parts in my order',
    description: 'I received my order yesterday but the mounting hardware is missing from the package.',
    status: SupportTicketStatus.IN_PROGRESS,
    priority: SupportTicketPriority.MEDIUM,
    category: 'Order Issues',
    relatedOrderId: 'order1',
    createdAt: new Date('2024-03-25T14:30:00'),
    updatedAt: new Date('2024-03-26T09:15:00'),
    messages: [
      {
        id: 'msg-001',
        ticketId: 'ticket-001',
        sender: 'customer',
        message: 'I received my order yesterday but the mounting hardware is missing from the package. Can you send me the missing parts?',
        timestamp: new Date('2024-03-25T14:30:00')
      },
      {
        id: 'msg-002',
        ticketId: 'ticket-001',
        sender: 'support',
        message: "I'm sorry to hear about the missing hardware. We'll ship the missing parts right away. Can you confirm your shipping address?",
        timestamp: new Date('2024-03-26T09:15:00')
      }
    ],
    assignedTo: 'support-agent-1'
  },
  {
    id: 'ticket-002',
    userId: 'user1',
    subject: 'How to install motorized blinds',
    description: 'I need help understanding how to install my new motorized blinds.',
    status: SupportTicketStatus.OPEN,
    priority: SupportTicketPriority.LOW,
    category: 'Installation Help',
    relatedProductId: 'product-5',
    createdAt: new Date('2024-04-02T11:20:00'),
    updatedAt: new Date('2024-04-02T11:20:00'),
    messages: [
      {
        id: 'msg-003',
        ticketId: 'ticket-002',
        sender: 'customer',
        message: "I just received my new motorized blinds and I'm having trouble understanding the installation instructions. Is there a video tutorial I can watch?",
        timestamp: new Date('2024-04-02T11:20:00')
      }
    ]
  }
];

const PRODUCT_FEEDBACK_DB: ProductFeedback[] = [
  {
    id: 'feedback-001',
    userId: 'user1',
    productId: 'product-1',
    rating: 4,
    title: 'Great blinds, easy installation',
    text: 'These cellular shades look great and were relatively easy to install. The insulation effect is noticeable.',
    pros: ['Energy efficient', 'Easy to install', 'Looks great'],
    cons: ['Slightly more expensive than expected'],
    createdAt: new Date('2024-03-10'),
    helpfulVotes: 5,
    verifiedPurchase: true
  }
];

const GENERAL_FEEDBACK_DB: GeneralFeedback[] = [
  {
    id: 'gen-feedback-001',
    userId: 'user1',
    type: FeedbackType.WEBSITE,
    rating: 4,
    comment: 'The website is easy to use but the checkout process could be streamlined.',
    contact: false,
    createdAt: new Date('2024-02-28')
  }
];

/**
 * Get all support tickets from the API for the current user
 */
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<SupportTicket[]>(
    `/support/tickets`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Return tickets from mock DB filtered by user ID
      return SUPPORT_TICKETS_DB
        .filter(ticket => ticket.userId === currentUser.id)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Sort by last updated
    }
  );
};

/**
 * Get a specific support ticket by ID from the API
 */
export const getSupportTicketById = async (ticketId: string): Promise<SupportTicket> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<SupportTicket>(
    `/support/tickets/${ticketId}`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      // Find ticket in mock DB
      const ticket = SUPPORT_TICKETS_DB.find(t => t.id === ticketId && t.userId === currentUser.id);

      if (!ticket) {
        throw new Error(`Support ticket with ID ${ticketId} not found`);
      }

      return ticket;
    }
  );
};

/**
 * Create a new support ticket via the API
 */
export const createSupportTicket = async (ticket: {
  subject: string;
  description: string;
  category: string;
  relatedOrderId?: string;
  relatedProductId?: string;
}): Promise<SupportTicket> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<SupportTicket>(
    `/support/tickets`,
    ticket,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay

      // Create new ticket
      const now = new Date();
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        userId: currentUser.id,
        subject: ticket.subject,
        description: ticket.description,
        status: SupportTicketStatus.OPEN,
        priority: SupportTicketPriority.MEDIUM,
        category: ticket.category,
        relatedOrderId: ticket.relatedOrderId,
        relatedProductId: ticket.relatedProductId,
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `msg-${Date.now()}`,
            ticketId: `ticket-${Date.now()}`,
            sender: 'customer',
            message: ticket.description,
            timestamp: now
          }
        ]
      };

      // Add to mock DB
      SUPPORT_TICKETS_DB.push(newTicket);

      return newTicket;
    }
  );
};

/**
 * Reply to a support ticket via the API
 */
export const replySupportTicket = async (ticketId: string, message: string, attachments?: File[]): Promise<SupportTicketMessage> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Handle attachments with different API call if present
  if (attachments && attachments.length > 0) {
    return apiClient.uploadFile<SupportTicketMessage>(
      `/support/tickets/${ticketId}/reply`,
      attachments,
      { message },
      async () => mockReplySupportTicket(currentUser.id, ticketId, message, attachments)
    );
  }

  // No attachments, use standard post
  return apiClient.post<SupportTicketMessage>(
    `/support/tickets/${ticketId}/reply`,
    { message },
    async () => mockReplySupportTicket(currentUser.id, ticketId, message)
  );
};

// Helper for mock reply implementation
const mockReplySupportTicket = async (
  userId: string,
  ticketId: string,
  message: string,
  attachments?: File[]
): Promise<SupportTicketMessage> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Find ticket in mock DB
  const ticketIndex = SUPPORT_TICKETS_DB.findIndex(t => t.id === ticketId && t.userId === userId);

  if (ticketIndex === -1) {
    throw new Error(`Support ticket with ID ${ticketId} not found`);
  }

  // Create new message
  const newMessage: SupportTicketMessage = {
    id: `msg-${Date.now()}`,
    ticketId,
    sender: 'customer',
    message,
    timestamp: new Date()
  };

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    newMessage.attachments = attachments.map(file => ({
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    }));
  }

  // Add message to ticket
  SUPPORT_TICKETS_DB[ticketIndex].messages.push(newMessage);

  // Update ticket status
  SUPPORT_TICKETS_DB[ticketIndex].status = SupportTicketStatus.WAITING_FOR_CUSTOMER;
  SUPPORT_TICKETS_DB[ticketIndex].updatedAt = new Date();

  return newMessage;
};

/**
 * Close a support ticket via the API
 */
export const closeSupportTicket = async (ticketId: string): Promise<SupportTicket> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<SupportTicket>(
    `/support/tickets/${ticketId}/close`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Find ticket in mock DB
      const ticketIndex = SUPPORT_TICKETS_DB.findIndex(t => t.id === ticketId && t.userId === currentUser.id);

      if (ticketIndex === -1) {
        throw new Error(`Support ticket with ID ${ticketId} not found`);
      }

      // Close ticket
      SUPPORT_TICKETS_DB[ticketIndex].status = SupportTicketStatus.CLOSED;
      SUPPORT_TICKETS_DB[ticketIndex].updatedAt = new Date();

      return SUPPORT_TICKETS_DB[ticketIndex];
    }
  );
};

/**
 * Get all product feedback from the API for the current user
 */
export const getUserProductFeedback = async (): Promise<ProductFeedback[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.get<ProductFeedback[]>(
    `/feedback/products/user`,
    {},
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay

      // Return feedback from mock DB filtered by user ID
      return PRODUCT_FEEDBACK_DB
        .filter(feedback => feedback.userId === currentUser.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  );
};

/**
 * Submit product feedback via the API
 */
export const submitProductFeedback = async (feedback: Omit<ProductFeedback, 'id' | 'userId' | 'createdAt' | 'helpfulVotes'>): Promise<ProductFeedback> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<ProductFeedback>(
    `/feedback/products`,
    feedback,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay

      // Create new feedback
      const newFeedback: ProductFeedback = {
        id: `feedback-${Date.now()}`,
        userId: currentUser.id,
        createdAt: new Date(),
        helpfulVotes: 0,
        ...feedback
      };

      // Add to mock DB
      PRODUCT_FEEDBACK_DB.push(newFeedback);

      return newFeedback;
    }
  );
};

/**
 * Submit general website feedback via the API
 */
export const submitGeneralFeedback = async (feedback: Omit<GeneralFeedback, 'id' | 'userId' | 'createdAt'>): Promise<GeneralFeedback> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  return apiClient.post<GeneralFeedback>(
    `/feedback/general`,
    feedback,
    async () => {
      // Mock fallback implementation
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Create new feedback
      const newFeedback: GeneralFeedback = {
        id: `gen-feedback-${Date.now()}`,
        userId: currentUser.id,
        createdAt: new Date(),
        ...feedback
      };

      // Add to mock DB
      GENERAL_FEEDBACK_DB.push(newFeedback);

      return newFeedback;
    }
  );
};
