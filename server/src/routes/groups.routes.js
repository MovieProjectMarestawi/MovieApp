import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import {
  createGroup,
  updateGroup,
  listGroups,
  getGroupDetails,
  requestToJoin,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  addMovieToGroup,
  getGroupMovies,
  removeMovieFromGroup,
  leaveGroup,
  deleteGroup,
  removeMemberFromGroup,
  getAllPendingRequests,
} from '../controllers/groups.controller.js';

const router = express.Router();

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', authenticateToken, createGroup);

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group
 * @access  Private (owner only)
 */
router.put('/:id', authenticateToken, updateGroup);

/**
 * @route   GET /api/groups
 * @desc    List all groups (shows is_member if authenticated)
 * @access  Public (optional auth)
 */
router.get('/', optionalAuth, listGroups);

/**
 * @route   GET /api/groups/notifications/requests
 * @desc    Get all pending join requests for groups owned by user
 * @access  Private
 */
router.get('/notifications/requests', authenticateToken, getAllPendingRequests);

/**
 * @route   GET /api/groups/:id
 * @desc    Get group details
 * @access  Public (content only visible to members)
 */
router.get('/:id', optionalAuth, getGroupDetails);

/**
 * @route   POST /api/groups/:id/join
 * @desc    Request to join group
 * @access  Private
 */
router.post('/:id/join', authenticateToken, requestToJoin);

/**
 * @route   GET /api/groups/:id/requests
 * @desc    Get join requests (owner only)
 * @access  Private (owner only)
 */
router.get('/:id/requests', authenticateToken, getJoinRequests);

/**
 * @route   POST /api/groups/:id/requests/:requestId/approve
 * @desc    Approve join request
 * @access  Private (owner only)
 */
router.post('/:id/requests/:requestId/approve', authenticateToken, approveJoinRequest);

/**
 * @route   POST /api/groups/:id/requests/:requestId/reject
 * @desc    Reject join request
 * @access  Private (owner only)
 */
router.post('/:id/requests/:requestId/reject', authenticateToken, rejectJoinRequest);

/**
 * @route   POST /api/groups/:id/movies
 * @desc    Add movie to group
 * @access  Private (member only)
 */
router.post('/:id/movies', authenticateToken, addMovieToGroup);

/**
 * @route   GET /api/groups/:id/movies
 * @desc    Get group movies
 * @access  Private (member only)
 */
router.get('/:id/movies', authenticateToken, getGroupMovies);

/**
 * @route   DELETE /api/groups/:id/movies/:movieId
 * @desc    Remove movie from group
 * @access  Private (member only)
 */
router.delete('/:id/movies/:movieId', authenticateToken, removeMovieFromGroup);

/**
 * @route   DELETE /api/groups/:id/leave
 * @desc    Leave group
 * @access  Private (member only, not owner)
 */
router.delete('/:id/leave', authenticateToken, leaveGroup);

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove member from group (owner only)
 * @access  Private (owner only)
 */
router.delete('/:id/members/:userId', authenticateToken, removeMemberFromGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group
 * @access  Private (owner only)
 */
router.delete('/:id', authenticateToken, deleteGroup);

export default router;
