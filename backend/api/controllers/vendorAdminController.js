/**
 * Controller for vendor admin features
 */
const { pool } = require('../../config/db');
const ErrorResponse = require('../../utils/errorResponse');
const dbInit = require('../../utils/dbInit');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Import table modules
const activityLogs = require('../../tables/activityLogs');
const teamMembers = require('../../tables/teamMembers');
const vendorChats = require('../../tables/vendorChats');
const bulkUploads = require('../../tables/bulkUploads');

// Helper to get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;
};

/**
 * @desc    Get activity logs for a vendor
 * @route   GET /api/vendor/activity-logs
 * @access  Private/Vendor
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const {
      startDate,
      endDate,
      activityType,
      userId,
      entityId,
      entityType,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Create filters object
    const filters = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      activityTypes: activityType ? [activityType] : null,
      userId,
      entityId,
      entityType,
      search,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const client = await pool.connect();

    try {
      // Get filtered logs
      const { sql, params } = activityLogs.getFilteredLogsSQL(filters);
      params[0] = vendorId; // Ensure vendorId is first param

      const logResult = await client.query(sql, params);

      // Get total count for pagination
      const { sql: countSql, params: countParams } = activityLogs.getFilteredLogCountSQL(filters);
      countParams[0] = vendorId; // Ensure vendorId is first param

      const countResult = await client.query(countSql, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        count: totalCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: parseInt(page) * parseInt(limit) < totalCount
        },
        data: logResult.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get team members for a vendor
 * @route   GET /api/vendor/team
 * @access  Private/Vendor
 */
const getTeamMembers = async (req, res, next) => {
  try {
    const vendorId = req.user.id;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'team',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to view team members', 403));
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        teamMembers.getVendorTeamMembersSQL,
        [vendorId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a specific team member
 * @route   GET /api/vendor/team/:id
 * @access  Private/Vendor
 */
const getTeamMember = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const memberId = req.params.id;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'team',
      'view'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to view team members', 403));
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        teamMembers.getTeamMemberSQL,
        [memberId, vendorId]
      );

      if (result.rows.length === 0) {
        return next(new ErrorResponse('Team member not found', 404));
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Invite a new team member
 * @route   POST /api/vendor/team
 * @access  Private/Vendor
 */
const inviteTeamMember = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { name, email, role, phone, customPermissions } = req.body;

    if (!name || !email || !role) {
      return next(new ErrorResponse('Please provide name, email, and role', 400));
    }

    // Validate role
    const validRoles = Object.keys(teamMembers.defaultPermissions);
    if (!validRoles.includes(role)) {
      return next(new ErrorResponse(`Role must be one of: ${validRoles.join(', ')}`, 400));
    }

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'team',
      'edit'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to invite team members', 403));
    }

    const client = await pool.connect();

    try {
      // Check if user with this email already exists in this vendor's team
      const checkResult = await client.query(
        teamMembers.getTeamMemberByEmailSQL,
        [email, vendorId]
      );

      if (checkResult.rows.length > 0) {
        return next(new ErrorResponse('A team member with this email already exists', 400));
      }

      // Generate invitation token
      const inviteToken = crypto.randomBytes(32).toString('hex');

      // Set expiration time (7 days from now)
      const inviteTokenExpires = new Date();
      inviteTokenExpires.setDate(inviteTokenExpires.getDate() + 7);

      // Choose permissions
      const permissions = customPermissions || teamMembers.defaultPermissions[role];

      // Create team member
      const result = await client.query(
        teamMembers.createTeamMemberSQL,
        [
          null, // user_id (will be set when they accept invitation)
          vendorId,
          name,
          email,
          phone || null,
          role,
          JSON.stringify(permissions),
          'invited',
          req.user.name,
          inviteToken,
          inviteTokenExpires
        ]
      );

      const newTeamMember = result.rows[0];

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'USER_ADDED',
        `Invited ${name} (${email}) as a team member with ${role} role`,
        { role, email },
        newTeamMember.id,
        'team-member',
        getClientIp(req)
      );

      // In a real application, we would send an invitation email here
      // For now, we'll just log the invitation link
      console.log(`Invitation link (would be emailed): /vendor/team/accept-invitation?token=${inviteToken}`);

      res.status(201).json({
        success: true,
        data: newTeamMember,
        inviteLink: `/vendor/team/accept-invitation?token=${inviteToken}`
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a team member
 * @route   PUT /api/vendor/team/:id
 * @access  Private/Vendor
 */
const updateTeamMember = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const memberId = req.params.id;
    const { name, role, permissions, status, phone } = req.body;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'team',
      'edit'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to update team members', 403));
    }

    // Validate role if provided
    if (role) {
      const validRoles = Object.keys(teamMembers.defaultPermissions);
      if (!validRoles.includes(role)) {
        return next(new ErrorResponse(`Role must be one of: ${validRoles.join(', ')}`, 400));
      }
    }

    // Validate status if provided
    if (status && !['active', 'invited', 'disabled'].includes(status)) {
      return next(new ErrorResponse('Status must be active, invited, or disabled', 400));
    }

    const client = await pool.connect();

    try {
      // First get current state to determine what changed
      const currentResult = await client.query(
        teamMembers.getTeamMemberSQL,
        [memberId, vendorId]
      );

      if (currentResult.rows.length === 0) {
        return next(new ErrorResponse('Team member not found', 404));
      }

      const currentMember = currentResult.rows[0];

      // Prevent modification of vendor-admin role by other team members
      if (
        currentMember.role === 'vendor-admin' &&
        currentMember.user_id === vendorId &&
        req.user.id !== vendorId
      ) {
        return next(new ErrorResponse('Cannot modify the vendor admin account', 403));
      }

      // Apply updates
      const result = await client.query(
        teamMembers.updateTeamMemberSQL,
        [
          memberId,
          vendorId,
          name || null,
          role || null,
          permissions ? JSON.stringify(permissions) : null,
          status || null,
          phone || null
        ]
      );

      if (result.rows.length === 0) {
        return next(new ErrorResponse('Team member not found', 404));
      }

      const updatedMember = result.rows[0];

      // Log activity with details about what changed
      let activityDescription = `Updated team member ${currentMember.name}`;
      const changes = {};

      if (name && name !== currentMember.name) {
        changes.name = { from: currentMember.name, to: name };
        activityDescription = `Updated ${currentMember.name}'s profile`;
      }

      if (role && role !== currentMember.role) {
        changes.role = { from: currentMember.role, to: role };
        activityDescription = `Changed ${currentMember.name}'s role from ${currentMember.role} to ${role}`;
      }

      if (status && status !== currentMember.status) {
        changes.status = { from: currentMember.status, to: status };
        if (status === 'disabled') {
          activityDescription = `Disabled ${currentMember.name}'s account`;
        } else if (status === 'active' && currentMember.status === 'disabled') {
          activityDescription = `Reactivated ${currentMember.name}'s account`;
        }
      }

      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'PERMISSION_CHANGED',
        activityDescription,
        changes,
        memberId,
        'team-member',
        getClientIp(req)
      );

      res.json({
        success: true,
        data: updatedMember
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove a team member
 * @route   DELETE /api/vendor/team/:id
 * @access  Private/Vendor
 */
const removeTeamMember = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const memberId = req.params.id;

    // Check permission
    const hasPermission = await dbInit.checkPermission(
      req.user.id,
      'team',
      'full'
    );

    if (!hasPermission) {
      return next(new ErrorResponse('Not authorized to remove team members', 403));
    }

    const client = await pool.connect();

    try {
      // Get member details first for logging
      const memberResult = await client.query(
        teamMembers.getTeamMemberSQL,
        [memberId, vendorId]
      );

      if (memberResult.rows.length === 0) {
        return next(new ErrorResponse('Team member not found', 404));
      }

      const memberToRemove = memberResult.rows[0];

      // Prevent removal of vendor-admin (owner)
      if (
        memberToRemove.role === 'vendor-admin' &&
        memberToRemove.user_id === vendorId
      ) {
        return next(new ErrorResponse('Cannot remove the vendor owner account', 403));
      }

      // Delete the team member
      const result = await client.query(
        teamMembers.deleteTeamMemberSQL,
        [memberId, vendorId]
      );

      if (result.rows.length === 0) {
        return next(new ErrorResponse('Team member not found', 404));
      }

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'USER_REMOVED',
        `Removed ${memberToRemove.name} (${memberToRemove.email}) from the team`,
        {
          name: memberToRemove.name,
          email: memberToRemove.email,
          role: memberToRemove.role
        },
        memberId,
        'team-member',
        getClientIp(req)
      );

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get bulk upload template
 * @route   GET /api/vendor/bulk-uploads/template/:type
 * @access  Private/Vendor
 */
const getBulkUploadTemplate = async (req, res, next) => {
  try {
    const { type } = req.params;

    if (!type || !bulkUploads.expectedColumns[type]) {
      return next(new ErrorResponse(`Invalid upload type. Must be one of: ${Object.keys(bulkUploads.expectedColumns).join(', ')}`, 400));
    }

    // Create a temporary file path
    const tempDir = path.join(__dirname, '../../temp');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `${type}_template.csv`);

    // Get template columns
    const columns = bulkUploads.getTemplateColumns(type).map(col => ({
      id: col.name,
      title: `${col.name}${col.required ? ' *' : ''}`
    }));

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: columns
    });

    // Create example row with correct data types for each column
    const exampleRow = {};
    bulkUploads.getTemplateColumns(type).forEach(col => {
      if (col.type === 'string') {
        exampleRow[col.name] = `Example ${col.name}`;
      } else if (col.type === 'number') {
        exampleRow[col.name] = 123;
      } else if (col.type === 'boolean') {
        exampleRow[col.name] = true;
      }
    });

    // Write a single example row
    await csvWriter.writeRecords([exampleRow]);

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.csv`);

    // Stream the file
    fs.createReadStream(filePath).pipe(res);

    // Clean up the file after it's sent (in the background)
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting temporary file: ${err.message}`);
      });
    }, 1000);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Upload a bulk file (CSV/Excel)
 * @route   POST /api/vendor/bulk-uploads/:type
 * @access  Private/Vendor
 */
const uploadBulkFile = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { type } = req.params;

    if (!type || !bulkUploads.expectedColumns[type]) {
      return next(new ErrorResponse(`Invalid upload type. Must be one of: ${Object.keys(bulkUploads.expectedColumns).join(', ')}`, 400));
    }

    // Check if file is provided
    if (!req.files || !req.files.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return next(new ErrorResponse('File size cannot exceed 10MB', 400));
    }

    // Validate file type
    if (!file.mimetype.includes('csv') &&
        !file.mimetype.includes('excel') &&
        !file.mimetype.includes('spreadsheet')) {
      return next(new ErrorResponse('File must be CSV or Excel', 400));
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads/bulk');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExt = path.extname(file.name);
    const filename = `${vendorId}_${type}_${timestamp}${fileExt}`;
    const filepath = path.join(uploadsDir, filename);

    // Save the file
    await file.mv(filepath);

    const client = await pool.connect();

    try {
      // Create bulk upload record
      const result = await client.query(
        bulkUploads.createBulkUploadSQL,
        [
          vendorId,
          req.user.id,
          file.name,
          filepath,
          file.size,
          file.mimetype,
          'pending',
          type
        ]
      );

      const bulkUpload = result.rows[0];

      // Log activity
      await dbInit.logActivity(
        req.user.id,
        vendorId,
        'BULK_UPLOAD',
        `Uploaded ${type} bulk file: ${file.name}`,
        {
          filename: file.name,
          filesize: file.size,
          uploadType: type
        },
        bulkUpload.id,
        'bulk-upload',
        getClientIp(req)
      );

      // In a real application, we would now process the file asynchronously
      // For now, we'll just respond with success

      res.status(201).json({
        success: true,
        data: bulkUpload,
        message: `File uploaded successfully and will be processed shortly`
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get bulk uploads for a vendor
 * @route   GET /api/vendor/bulk-uploads
 * @access  Private/Vendor
 */
const getBulkUploads = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const client = await pool.connect();

    try {
      const result = await client.query(
        bulkUploads.getVendorBulkUploadsSQL,
        [
          vendorId,
          parseInt(limit),
          (parseInt(page) - 1) * parseInt(limit)
        ]
      );

      // Get total count for pagination
      const countResult = await client.query(
        'SELECT COUNT(*) FROM blinds.bulk_uploads WHERE vendor_id = $1',
        [vendorId]
      );

      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        count: totalCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: parseInt(page) * parseInt(limit) < totalCount
        },
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  // Activity Logs
  getActivityLogs,

  // Team Access
  getTeamMembers,
  getTeamMember,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,

  // Bulk Uploads
  getBulkUploadTemplate,
  uploadBulkFile,
  getBulkUploads
};
