import apiClient from './apiClient';
import { authService } from './authService';
import { logActivity, ActivityType } from './activityLogService';

// Team member roles
export enum TeamMemberRole {
  VENDOR_ADMIN = 'vendor-admin', // Full access to all vendor features
  FACTORY_MANAGER = 'factory-manager', // Can manage production, inventory, and orders
  CUSTOMER_SUPPORT = 'customer-support', // Can view orders and communicate with customers
  SALES_ASSOCIATE = 'sales-associate', // Can manage products and pricing
  VIEWER = 'viewer' // Read-only access to dashboards and reports
}

// Permission categories
export enum PermissionCategory {
  ORDERS = 'orders',
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  ANALYTICS = 'analytics',
  TEAM = 'team',
  SETTINGS = 'settings',
  CHAT = 'chat',
  BILLING = 'billing'
}

// Permission levels
export enum PermissionLevel {
  NONE = 'none', // No access
  VIEW = 'view', // Read-only access
  EDIT = 'edit', // Can make changes
  FULL = 'full'  // Full access including deletion and adding new items
}

// Permission interface
export interface Permission {
  category: PermissionCategory;
  level: PermissionLevel;
}

// Team member interface
export interface TeamMember {
  id: string;
  userId?: string;  // If user exists in system
  name: string;
  email: string;
  role: TeamMemberRole;
  permissions: Permission[];
  phone?: string;
  profileImage?: string;
  status: 'active' | 'invited' | 'disabled';
  lastLogin?: string;
  createdAt: string;
  invitedBy?: string;
  vendorId: string;  // The vendor they belong to
}

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<TeamMemberRole, Permission[]> = {
  [TeamMemberRole.VENDOR_ADMIN]: Object.values(PermissionCategory).map(category => ({
    category,
    level: PermissionLevel.FULL
  })),

  [TeamMemberRole.FACTORY_MANAGER]: [
    { category: PermissionCategory.ORDERS, level: PermissionLevel.EDIT },
    { category: PermissionCategory.INVENTORY, level: PermissionLevel.EDIT },
    { category: PermissionCategory.ANALYTICS, level: PermissionLevel.VIEW },
    { category: PermissionCategory.PRODUCTS, level: PermissionLevel.VIEW },
    { category: PermissionCategory.CHAT, level: PermissionLevel.EDIT }
  ],

  [TeamMemberRole.CUSTOMER_SUPPORT]: [
    { category: PermissionCategory.ORDERS, level: PermissionLevel.VIEW },
    { category: PermissionCategory.CHAT, level: PermissionLevel.EDIT },
    { category: PermissionCategory.PRODUCTS, level: PermissionLevel.VIEW }
  ],

  [TeamMemberRole.SALES_ASSOCIATE]: [
    { category: PermissionCategory.PRODUCTS, level: PermissionLevel.EDIT },
    { category: PermissionCategory.ORDERS, level: PermissionLevel.VIEW },
    { category: PermissionCategory.ANALYTICS, level: PermissionLevel.VIEW },
    { category: PermissionCategory.CHAT, level: PermissionLevel.EDIT }
  ],

  [TeamMemberRole.VIEWER]: Object.values(PermissionCategory).map(category => ({
    category,
    level: PermissionLevel.VIEW
  }))
};

/**
 * Get all team members for the current vendor
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify vendor status
  if (currentUser.role !== 'vendor' && currentUser.role !== 'admin') {
    throw new Error('Access denied: Vendor or Admin role required');
  }

  // Vendor ID will be the user ID for the vendor owner
  const vendorId = currentUser.id;

  return apiClient.get<TeamMember[]>(
    '/vendor/team-members',
    {},
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Include the current user as the vendor admin
      const teamMembers: TeamMember[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: TeamMemberRole.VENDOR_ADMIN,
          permissions: DEFAULT_PERMISSIONS[TeamMemberRole.VENDOR_ADMIN],
          status: 'active',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
          vendorId: vendorId,
          lastLogin: new Date().toISOString()
        }
      ];

      // Generate some mock team members
      const mockMembers = [
        {
          id: 'user-1001',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: TeamMemberRole.FACTORY_MANAGER,
          phone: '555-123-4567',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: 'user-1002',
          name: 'Michael Johnson',
          email: 'michael.johnson@example.com',
          role: TeamMemberRole.CUSTOMER_SUPPORT,
          status: 'active',
          lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
          id: 'user-1003',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          role: TeamMemberRole.SALES_ASSOCIATE,
          status: 'active',
          lastLogin: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
        },
        {
          id: 'user-1004',
          name: 'Robert Wilson',
          email: 'robert.wilson@example.com',
          role: TeamMemberRole.VIEWER,
          status: 'invited',
          invitedBy: currentUser.name
        }
      ];

      // Add the mock members with their default permissions
      mockMembers.forEach(member => {
        teamMembers.push({
          ...member,
          permissions: DEFAULT_PERMISSIONS[member.role],
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // Random date in the last 180 days
          vendorId: vendorId
        });
      });

      return teamMembers;
    }
  );
};

/**
 * Get a specific team member by ID
 */
export const getTeamMember = async (teamMemberId: string): Promise<TeamMember | null> => {
  const teamMembers = await getTeamMembers();
  return teamMembers.find(member => member.id === teamMemberId) || null;
};

/**
 * Invite a new team member
 */
export const inviteTeamMember = async (
  email: string,
  name: string,
  role: TeamMemberRole,
  customPermissions?: Permission[]
): Promise<TeamMember> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify vendor status
  if (currentUser.role !== 'vendor') {
    throw new Error('Access denied: Vendor role required');
  }

  // Check if the current user has permission to manage team
  const currentUserTeamMember = await getTeamMember(currentUser.id);
  const hasTeamManagementPermission = currentUserTeamMember?.permissions.some(
    permission => permission.category === PermissionCategory.TEAM &&
    [PermissionLevel.EDIT, PermissionLevel.FULL].includes(permission.level)
  );

  if (!hasTeamManagementPermission) {
    throw new Error('Access denied: You do not have permission to manage team members');
  }

  return apiClient.post<TeamMember>(
    '/vendor/team-members',
    {
      email,
      name,
      role,
      customPermissions
    },
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 600));

      const newMember: TeamMember = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        permissions: customPermissions || DEFAULT_PERMISSIONS[role],
        status: 'invited',
        createdAt: new Date().toISOString(),
        invitedBy: currentUser.name,
        vendorId: currentUser.id
      };

      // Log the activity
      await logActivity(
        ActivityType.USER_ADDED,
        `Invited ${name} (${email}) as a team member with ${role} role`,
        { role, email },
        newMember.id,
        'team-member'
      );

      return newMember;
    }
  );
};

/**
 * Update a team member's role and permissions
 */
export const updateTeamMember = async (
  teamMemberId: string,
  updates: {
    name?: string;
    role?: TeamMemberRole;
    permissions?: Permission[];
    status?: 'active' | 'disabled';
  }
): Promise<TeamMember> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify vendor status
  if (currentUser.role !== 'vendor') {
    throw new Error('Access denied: Vendor role required');
  }

  // Check if the current user has permission to manage team
  const currentUserTeamMember = await getTeamMember(currentUser.id);
  const hasTeamManagementPermission = currentUserTeamMember?.permissions.some(
    permission => permission.category === PermissionCategory.TEAM &&
    [PermissionLevel.EDIT, PermissionLevel.FULL].includes(permission.level)
  );

  if (!hasTeamManagementPermission) {
    throw new Error('Access denied: You do not have permission to manage team members');
  }

  return apiClient.put<TeamMember>(
    `/vendor/team-members/${teamMemberId}`,
    updates,
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 400));

      // Get the current state of the team member
      const teamMember = await getTeamMember(teamMemberId);
      if (!teamMember) {
        throw new Error(`Team member with ID ${teamMemberId} not found`);
      }

      // Create the updated team member
      const updatedMember: TeamMember = {
        ...teamMember,
        ...updates
      };

      // Log the activity
      let activityDescription = 'Updated team member';
      if (updates.role && updates.role !== teamMember.role) {
        activityDescription = `Changed ${teamMember.name}'s role from ${teamMember.role} to ${updates.role}`;
      } else if (updates.status && updates.status !== teamMember.status) {
        activityDescription = `${updates.status === 'active' ? 'Activated' : 'Disabled'} ${teamMember.name}'s account`;
      } else if (updates.permissions) {
        activityDescription = `Updated ${teamMember.name}'s permissions`;
      }

      await logActivity(
        ActivityType.PERMISSION_CHANGED,
        activityDescription,
        {
          previousRole: teamMember.role,
          newRole: updates.role,
          previousStatus: teamMember.status,
          newStatus: updates.status
        },
        teamMemberId,
        'team-member'
      );

      return updatedMember;
    }
  );
};

/**
 * Remove a team member
 */
export const removeTeamMember = async (teamMemberId: string): Promise<{ success: boolean }> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Verify vendor status
  if (currentUser.role !== 'vendor') {
    throw new Error('Access denied: Vendor role required');
  }

  // Check if the current user has permission to manage team
  const currentUserTeamMember = await getTeamMember(currentUser.id);
  const hasTeamManagementPermission = currentUserTeamMember?.permissions.some(
    permission => permission.category === PermissionCategory.TEAM &&
    permission.level === PermissionLevel.FULL
  );

  if (!hasTeamManagementPermission) {
    throw new Error('Access denied: You do not have permission to remove team members');
  }

  // Cannot remove yourself
  if (teamMemberId === currentUser.id) {
    throw new Error('You cannot remove your own account');
  }

  return apiClient.delete<{ success: boolean }>(
    `/vendor/team-members/${teamMemberId}`,
    {},
    async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the team member to be removed (for logging purposes)
      const teamMember = await getTeamMember(teamMemberId);
      if (!teamMember) {
        throw new Error(`Team member with ID ${teamMemberId} not found`);
      }

      // Log the activity
      await logActivity(
        ActivityType.USER_REMOVED,
        `Removed ${teamMember.name} (${teamMember.email}) from the team`,
        { role: teamMember.role, email: teamMember.email },
        teamMemberId,
        'team-member'
      );

      return { success: true };
    }
  );
};

/**
 * Check if the current user has a specific permission
 */
export const hasPermission = async (
  category: PermissionCategory,
  requiredLevel: PermissionLevel
): Promise<boolean> => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return false;
  }

  // Admin role has all permissions
  if (currentUser.role === 'admin') {
    return true;
  }

  // For vendors, check team member permissions
  if (currentUser.role === 'vendor') {
    try {
      const teamMember = await getTeamMember(currentUser.id);
      if (!teamMember) {
        return false;
      }

      const permission = teamMember.permissions.find(p => p.category === category);
      if (!permission) {
        return false;
      }

      // Check if the user's permission level is sufficient
      const levels = [PermissionLevel.NONE, PermissionLevel.VIEW, PermissionLevel.EDIT, PermissionLevel.FULL];
      const userLevelIndex = levels.indexOf(permission.level);
      const requiredLevelIndex = levels.indexOf(requiredLevel);

      return userLevelIndex >= requiredLevelIndex;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  return false;
};
