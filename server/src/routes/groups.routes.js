import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";
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
} from "../controllers/groups.controller.js";

const router = express.Router();

// Luo uuden ryhmän
router.post("/", authenticateToken, createGroup);

// Päivitä ryhmää
router.put("/:id", authenticateToken, updateGroup);

// Listaa ryhmät (näyttää myös is_member jos kirjautunut)
router.get("/", optionalAuth, listGroups);

// Kaikki omien ryhmien odottavat liittymispyynnöt
router.get("/notifications/requests", authenticateToken, getAllPendingRequests);

// Hae ryhmän tiedot
router.get("/:id", optionalAuth, getGroupDetails);

// Lähetä liittymispyyntö ryhmään
router.post("/:id/join", authenticateToken, requestToJoin);

// Hae ryhmän liittymispyynnöt vain omistaja
router.get("/:id/requests", authenticateToken, getJoinRequests);

// Hyväksy liittymispyyntö
router.post("/:id/requests/:requestId/approve", authenticateToken, approveJoinRequest);

// Hylkää liittymispyyntö
router.post("/:id/requests/:requestId/reject", authenticateToken, rejectJoinRequest);

// Lisää elokuva ryhmään
router.post("/:id/movies", authenticateToken, addMovieToGroup);

// Hae ryhmän elokuvat
router.get("/:id/movies", authenticateToken, getGroupMovies);

// Poista elokuva ryhmästä
router.delete("/:id/movies/:movieId", authenticateToken, removeMovieFromGroup);

// Poistu ryhmästä
router.delete("/:id/leave", authenticateToken, leaveGroup);

// Poista jäsen ryhmästä vain omistaja
router.delete("/:id/members/:userId", authenticateToken, removeMemberFromGroup);

// Poista koko ryhmä vain omistaja
router.delete("/:id", authenticateToken, deleteGroup);

export default router;
