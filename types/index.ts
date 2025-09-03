export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PendingInvite {
  email: string;
  code: string;
  expiry: number;
  invitedBy: string;
}

export interface Space {
  id: string;
  name: string;
  code?: string;
  codeExpiry?: number;
  members: User[];
  pendingInvites?: PendingInvite[];
  createdAt: number;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  shop?: string;
  categoryId: string;
  categoryName?: string;
  roomId?: string;
  addedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  isPriority?: boolean;
  priorityLevel?: number;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Proposal {
  id: string;
  itemId: string;
  item: Item;
  proposedBy: string;
  proposedTo: string;
  status: 'pending' | 'accepted' | 'rejected' | 'later';
  createdAt: number;
  respondedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  roomId?: string;
  itemCount: number;
  icon?: string;
}

export interface Room {
  id: string;
  name: string;
  budget?: number;
  spent?: number;
  color: string;
  icon?: string;
}

export interface Notification {
  id: string;
  type: 'proposal' | 'response' | 'joined' | 'priority' | 'info' | 'error';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}