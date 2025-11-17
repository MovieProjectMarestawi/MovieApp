import { query } from '../config/database.js';
import { validateRequiredFields } from '../utils/validation.js';

/**
 * Create a new group
 * POST /api/groups
 * Requires authentication
 */
export const createGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['name']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Validate name length
    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Group name must be 255 characters or less',
      });
    }

    // Validate description length
    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 1000 characters or less',
      });
    }

    // Create group
    const groupResult = await query(
      `INSERT INTO groups (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, owner_id, created_at, updated_at`,
      [name.trim(), description?.trim() || null, userId]
    );

    const group = groupResult.rows[0];

    // Add owner as member with 'owner' role
    await query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [group.id, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update group
 * PUT /api/groups/:id
 * Requires authentication (owner only)
 */
export const updateGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if group exists and user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can update the group',
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required',
        });
      }
      if (name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Group name must be 255 characters or less',
        });
      }
    }

    // Validate description if provided
    if (description !== undefined && description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 1000 characters or less',
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name.trim());
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description?.trim() || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(parseInt(id));

    const result = await query(
      `UPDATE groups SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, owner_id, created_at, updated_at`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: {
        group: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all groups
 * GET /api/groups
 * Public endpoint (shows is_member if authenticated)
 */
export const listGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.userId;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get groups with owner info and member count
    let queryText;
    let queryParams;

    if (userId) {
      // If user is authenticated, include is_member status
      queryText = `
        SELECT 
          g.id, g.name, g.description, g.owner_id, g.created_at, g.updated_at,
          u.email as owner_email,
          COUNT(DISTINCT gm.user_id) as member_count,
          COUNT(DISTINCT gc.movie_id) as movie_count,
          CASE WHEN EXISTS (
            SELECT 1 FROM group_members gm2 
            WHERE gm2.group_id = g.id AND gm2.user_id = $3
          ) THEN true ELSE false END as is_member,
          (SELECT gc2.movie_id FROM group_content gc2 WHERE gc2.group_id = g.id ORDER BY gc2.added_at ASC LIMIT 1) as first_movie_id
        FROM groups g
        LEFT JOIN users u ON g.owner_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id
        LEFT JOIN group_content gc ON g.id = gc.group_id
        GROUP BY g.id, u.email
        ORDER BY g.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limitNum, offset, userId];
    } else {
      // If not authenticated, don't include is_member
      queryText = `
        SELECT 
          g.id, g.name, g.description, g.owner_id, g.created_at, g.updated_at,
          u.email as owner_email,
          COUNT(DISTINCT gm.user_id) as member_count,
          COUNT(DISTINCT gc.movie_id) as movie_count,
          false as is_member,
          (SELECT gc2.movie_id FROM group_content gc2 WHERE gc2.group_id = g.id ORDER BY gc2.added_at ASC LIMIT 1) as first_movie_id
        FROM groups g
        LEFT JOIN users u ON g.owner_id = u.id
        LEFT JOIN group_members gm ON g.id = gm.group_id
        LEFT JOIN group_content gc ON g.id = gc.group_id
        GROUP BY g.id, u.email
        ORDER BY g.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limitNum, offset];
    }

    const result = await query(queryText, queryParams);

    // Convert member_count and movie_count to number
    const groups = result.rows.map((row) => ({
      ...row,
      member_count: parseInt(row.member_count) || 0,
      movie_count: parseInt(row.movie_count) || 0,
    }));

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM groups');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group details
 * GET /api/groups/:id
 * Public endpoint (content only visible to members)
 */
export const getGroupDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Get group info
    const groupResult = await query(
      `SELECT 
        g.id, g.name, g.description, g.owner_id, g.created_at, g.updated_at,
        u.email as owner_email
       FROM groups g
       LEFT JOIN users u ON g.owner_id = u.id
       WHERE g.id = $1`,
      [parseInt(id)]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    const group = groupResult.rows[0];

    // Get member count
    const memberCountResult = await query(
      'SELECT COUNT(*) FROM group_members WHERE group_id = $1',
      [parseInt(id)]
    );
    group.member_count = parseInt(memberCountResult.rows[0].count);

    // Get members
    const membersResult = await query(
      `SELECT gm.id, gm.user_id, gm.role, gm.joined_at, u.email
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [parseInt(id)]
    );
    group.members = membersResult.rows;

    // Check if user is member or owner
    let isMember = false;
    let isOwner = false;

    if (userId) {
      const memberCheck = await query(
        'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
        [parseInt(id), userId]
      );
      if (memberCheck.rows.length > 0) {
        isMember = true;
        isOwner = memberCheck.rows[0].role === 'owner';
      }
    }

    group.is_member = isMember;
    group.is_owner = isOwner;

    // Get content only if user is member
    if (isMember) {
      const contentResult = await query(
        `SELECT gc.id, gc.movie_id, gc.added_at, gc.added_by, u.email as added_by_email
         FROM group_content gc
         LEFT JOIN users u ON gc.added_by = u.id
         WHERE gc.group_id = $1
         ORDER BY gc.added_at DESC`,
        [parseInt(id)]
      );
      group.content = contentResult.rows;
    } else {
      group.content = null;
    }

    res.json({
      success: true,
      data: {
        group,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request to join group
 * POST /api/groups/:id/join
 * Requires authentication
 */
export const requestToJoin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if group exists
    const groupResult = await query('SELECT id, owner_id FROM groups WHERE id = $1', [
      parseInt(id),
    ]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if already a member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You are already a member of this group',
      });
    }

    // Check if already has a pending request
    const requestCheck = await query(
      'SELECT id FROM join_requests WHERE group_id = $1 AND user_id = $2 AND status = $3',
      [parseInt(id), userId, 'pending']
    );

    if (requestCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending join request for this group',
      });
    }

    // Create join request
    const result = await query(
      `INSERT INTO join_requests (group_id, user_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, group_id, user_id, status, requested_at`,
      [parseInt(id), userId]
    );

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: {
        join_request: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get join requests (owner only)
 * GET /api/groups/:id/requests
 * Requires authentication (owner only)
 */
export const getJoinRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can view join requests',
      });
    }

    // Get pending requests
    const result = await query(
      `SELECT jr.id, jr.group_id, jr.user_id, jr.status, jr.requested_at, u.email as user_email
       FROM join_requests jr
       JOIN users u ON jr.user_id = u.id
       WHERE jr.group_id = $1 AND jr.status = 'pending'
       ORDER BY jr.requested_at ASC`,
      [parseInt(id)]
    );

    res.json({
      success: true,
      data: {
        requests: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve join request
 * POST /api/groups/:id/requests/:requestId/approve
 * Requires authentication (owner only)
 */
export const approveJoinRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, requestId } = req.params;

    // Validate IDs
    if (!id || isNaN(id) || !requestId || isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or request ID',
      });
    }

    // Check if user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can approve requests',
      });
    }

    // Get request
    const requestResult = await query(
      'SELECT id, user_id, status FROM join_requests WHERE id = $1 AND group_id = $2',
      [parseInt(requestId), parseInt(id)]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found',
      });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed',
      });
    }

    // Update request status
    await query(
      `UPDATE join_requests 
       SET status = 'approved', responded_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [parseInt(requestId)]
    );

    // Add user to group members
    await query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [parseInt(id), request.user_id]
    );

    res.json({
      success: true,
      message: 'Join request approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject join request
 * POST /api/groups/:id/requests/:requestId/reject
 * Requires authentication (owner only)
 */
export const rejectJoinRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, requestId } = req.params;

    // Validate IDs
    if (!id || isNaN(id) || !requestId || isNaN(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or request ID',
      });
    }

    // Check if user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can reject requests',
      });
    }

    // Get request
    const requestResult = await query(
      'SELECT id, status FROM join_requests WHERE id = $1 AND group_id = $2',
      [parseInt(requestId), parseInt(id)]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found',
      });
    }

    if (requestResult.rows[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed',
      });
    }

    // Update request status
    await query(
      `UPDATE join_requests 
       SET status = 'rejected', responded_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [parseInt(requestId)]
    );

    res.json({
      success: true,
      message: 'Join request rejected successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add movie to group
 * POST /api/groups/:id/movies
 * Requires authentication (owner only)
 */
export const addMovieToGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { movie_id } = req.body;

    // Validate required fields
    const requiredValidation = validateRequiredFields(req.body, ['movie_id']);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: requiredValidation.message,
      });
    }

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Validate movie ID
    if (!movie_id || isNaN(movie_id) || parseInt(movie_id) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie_id. Must be a positive number (TMDb movie ID).',
      });
    }

    // Check if user is owner of the group
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can add movies to this group',
      });
    }

    // Check if movie already in group
    const existing = await query(
      'SELECT id FROM group_content WHERE group_id = $1 AND movie_id = $2',
      [parseInt(id), parseInt(movie_id)]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Movie is already in this group',
      });
    }

    // Add movie to group
    const result = await query(
      `INSERT INTO group_content (group_id, movie_id, added_by)
       VALUES ($1, $2, $3)
       RETURNING id, group_id, movie_id, added_by, added_at`,
      [parseInt(id), parseInt(movie_id), userId]
    );

    res.status(201).json({
      success: true,
      message: 'Movie added to group successfully',
      data: {
        content: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group movies
 * GET /api/groups/:id/movies
 * Requires authentication (member only)
 */
export const getGroupMovies = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if user is member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of this group to view movies',
      });
    }

    // Get movies
    const result = await query(
      `SELECT gc.id, gc.movie_id, gc.added_at, gc.added_by, u.email as added_by_email
       FROM group_content gc
       LEFT JOIN users u ON gc.added_by = u.id
       WHERE gc.group_id = $1
       ORDER BY gc.added_at DESC`,
      [parseInt(id)]
    );

    res.json({
      success: true,
      data: {
        movies: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove movie from group
 * DELETE /api/groups/:id/movies/:movieId
 * Requires authentication (owner only)
 */
export const removeMovieFromGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id, movieId } = req.params;

    // Validate IDs
    if (!id || isNaN(id) || !movieId || isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or movie ID',
      });
    }

    // Check if user is owner of the group
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can remove movies from this group',
      });
    }

    // Check if movie exists in group
    const existing = await query(
      'SELECT id FROM group_content WHERE group_id = $1 AND movie_id = $2',
      [parseInt(id), parseInt(movieId)]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in group',
      });
    }

    // Remove movie
    await query('DELETE FROM group_content WHERE group_id = $1 AND movie_id = $2', [
      parseInt(id),
      parseInt(movieId),
    ]);

    res.json({
      success: true,
      message: 'Movie removed from group successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave group
 * DELETE /api/groups/:id/leave
 * Requires authentication (member only, not owner)
 */
export const leaveGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if user is member
    const memberCheck = await query(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [parseInt(id), userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this group',
      });
    }

    // Check if user is owner
    if (memberCheck.rows[0].role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Group owner cannot leave the group. Delete the group instead.',
      });
    }

    // Remove from group
    await query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [
      parseInt(id),
      userId,
    ]);

    res.json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete group
 * DELETE /api/groups/:id
 * Requires authentication (owner only)
 */
export const deleteGroup = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate group ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    // Check if group exists and user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can delete the group',
      });
    }

    // Delete group (CASCADE will handle related data)
    await query('DELETE FROM groups WHERE id = $1', [parseInt(id)]);

    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove member from group (owner only)
 * DELETE /api/groups/:id/members/:userId
 * Requires authentication (owner only)
 */
export const removeMemberFromGroup = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const { id, userId } = req.params;

    // Validate group ID and user ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const memberUserId = parseInt(userId);

    // Check if group exists and user is owner
    const groupResult = await query('SELECT owner_id FROM groups WHERE id = $1', [parseInt(id)]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (groupResult.rows[0].owner_id !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can remove members from this group',
      });
    }

    // Check if trying to remove owner
    if (memberUserId === ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Group owner cannot remove themselves. Delete the group instead.',
      });
    }

    // Check if user is a member
    const memberCheck = await query(
      'SELECT id, role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [parseInt(id), memberUserId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this group',
      });
    }

    // Remove member from group
    await query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [
      parseInt(id),
      memberUserId,
    ]);

    res.json({
      success: true,
      message: 'Member removed from group successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pending join requests for groups owned by user
 * GET /api/groups/notifications/requests
 * Requires authentication
 */
export const getAllPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get all pending join requests for groups owned by user
    const result = await query(
      `SELECT 
        jr.id, 
        jr.group_id, 
        jr.user_id, 
        jr.status, 
        jr.requested_at,
        u.email as user_email,
        g.name as group_name
       FROM join_requests jr
       JOIN users u ON jr.user_id = u.id
       JOIN groups g ON jr.group_id = g.id
       WHERE g.owner_id = $1 AND jr.status = 'pending'
       ORDER BY jr.requested_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        requests: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

