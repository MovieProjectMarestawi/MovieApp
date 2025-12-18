import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Users, Crown, Calendar, ArrowLeft, LogOut, Film, UserPlus, Check, X as XIcon, Bell, Edit, Plus, Search, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { MovieCard } from '../components/MovieCard';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EditGroupModal } from '../components/EditGroupModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { toast } from 'sonner';
import { groupsAPI, moviesAPI } from '../services/api';
import { Movie } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface Group {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  owner_email: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  is_member: boolean;
  is_owner: boolean;
  members?: Array<{
    id: number;
    user_id: number;
    role: string;
    joined_at: string;
    email: string;
  }>;
  content?: Array<{
    id: number;
    movie_id: number;
    added_at: string;
    added_by: number;
    added_by_email: string;
  }>;
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupMovies, setGroupMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; email: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [joinRequests, setJoinRequests] = useState<Array<{
    id: number;
    user_id: number;
    user_email: string;
    status: string;
    requested_at: string;
  }>>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [groupImageUrl, setGroupImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('movies');

  const fetchJoinRequests = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingRequests(true);
      const requests = await groupsAPI.getJoinRequests(Number(id));
      setJoinRequests(requests.requests || []);
    } catch (error: any) {
      console.error('Failed to fetch join requests:', error);
      // Don't show error if user is not owner (403)
      if (error.message && !error.message.includes('owner')) {
        toast.error('Failed to load join requests');
      }
    } finally {
      setLoadingRequests(false);
    }
  }, [id]);

  const fetchGroup = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const groupData = await groupsAPI.getDetails(Number(id));
      setGroup(groupData);

      // If user is member, fetch group movies
      if (groupData.is_member && groupData.content) {
        const moviePromises = groupData.content.map(async (item: any) => {
          try {
            const movieData = await moviesAPI.getDetails(item.movie_id);
            return convertTMDBToMovie(movieData);
          } catch (error) {
            console.error(`Failed to fetch movie ${item.movie_id}:`, error);
            return null;
          }
        });

        const movies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);
        setGroupMovies(movies);

        // Set group image from first movie's poster
        if (movies.length > 0 && movies[0].posterUrl) {
          setGroupImageUrl(`https://image.tmdb.org/t/p/w500${movies[0].posterUrl}`);
        } else {
          setGroupImageUrl(null);
        }
      } else {
        setGroupImageUrl(null);
      }

      // If user is owner, fetch join requests
      if (groupData.is_owner) {
        await fetchJoinRequests();
      }
    } catch (error: any) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchJoinRequests]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Wait for auth to finish loading before checking login status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Group not found</h2>
          <Link to="/groups">
            <Button className="bg-red-600 hover:bg-red-700">Back to Groups</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!group.is_member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-white text-2xl mb-2">Members Only</h2>
          <p className="text-zinc-400 mb-6">
            This group is only visible to its members. Join the group to access its content.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/groups">
              <Button variant="outline" className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900">
                Browse Groups
              </Button>
            </Link>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  await groupsAPI.requestToJoin(Number(id));
                  toast.success('Join request sent!');
                  navigate('/groups');
                } catch (error: any) {
                  toast.error(error.message || 'Failed to send join request');
                }
              }}
            >
              Request to Join
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleLeaveGroup = async () => {
    try {
      await groupsAPI.leave(Number(id));
      toast.success(`Left ${group.name}`);
      setShowLeaveDialog(false);
      navigate('/groups');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave group');
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await groupsAPI.approveRequest(Number(id), requestId);
      toast.success('Join request approved');
      await fetchJoinRequests();
      await fetchGroup(); // Refresh group to update member count
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await groupsAPI.rejectRequest(Number(id), requestId);
      toast.success('Join request rejected');
      await fetchJoinRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !id) return;
    try {
      await groupsAPI.removeMember(Number(id), memberToRemove.id);
      toast.success(`Removed ${memberToRemove.email} from group`);
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);
      await fetchGroup(); // Refresh group to update member count
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleDeleteGroup = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await groupsAPI.delete(Number(id));
      toast.success(`Group "${group?.name}" deleted successfully`);
      navigate('/groups');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
      setDeleting(false);
    }
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/groups">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Group Image */}
            <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
              {groupImageUrl ? (
                <ImageWithFallback
                  src={groupImageUrl}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Film className="w-16 h-16 text-zinc-500" />
              )}
            </div>

            {/* Group Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-white text-3xl md:text-4xl">{group.name}</h1>
                {group.is_owner && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setShowDeleteGroupDialog(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-zinc-300 mb-4">{group.description || 'No description'}</p>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{Number(group.member_count) || 0} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Owner: {group.owner_email.split('@')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {!group.is_owner && (
                  <Button
                    onClick={() => setShowLeaveDialog(true)}
                    variant="outline"
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-red-950 hover:text-red-400 hover:border-red-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
                <TabsTrigger
                  value="movies"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400 cursor-pointer"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Movies ({groupMovies.length})
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400 cursor-pointer"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Members ({group.members?.length || 0})
                </TabsTrigger>
                {group.is_owner && (
                  <TabsTrigger
                    value="requests"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Join Requests
                    {joinRequests.length > 0 && (
                      <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {joinRequests.length}
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Movies Tab */}
              <TabsContent value="movies" className="mt-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Film className="w-6 h-6 text-red-600" />
                    <h2 className="text-white text-2xl">Group's Movies</h2>
                  </div>
                  {group.is_owner && (
                    <Link to="/search" className="cursor-pointer">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Movie
                      </Button>
                    </Link>
                  )}
                </div>
                {groupMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {groupMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        showRemoveButton={group.is_owner}
                        onRemove={async () => {
                          if (!id) return;
                          try {
                            await groupsAPI.removeMovie(Number(id), movie.id);
                            toast.success(`Removed "${movie.title}" from group`);
                            // Refresh group data
                            await fetchGroup();
                          } catch (error: any) {
                            console.error('Failed to remove movie:', error);
                            toast.error(error.message || 'Failed to remove movie from group');
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900 rounded-lg p-8 text-center border border-zinc-800">
                    <Film className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-4">No movies added to this group yet</p>
                    {group.is_owner && (
                      <Link to="/search" className="cursor-pointer">
                        <Button className="bg-red-600 hover:bg-red-700 cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Movie
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-0">
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white text-xl flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" />
                      Members ({group.members?.length || 0})
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {group.members && group.members.length > 0 ? (
                      group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between gap-3 p-3 bg-zinc-800 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-12 h-12 border-2 border-zinc-700">
                              <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
                                <User className="w-6 h-6 text-zinc-400" />
                                <span className="sr-only">{getInitials(member.email)}</span>
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{member.email}</p>
                              {member.role === 'owner' && (
                                <p className="text-zinc-500 text-sm flex items-center gap-1 mt-1">
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                  Owner
                                </p>
                              )}
                              <p className="text-zinc-500 text-xs mt-1">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {group.is_owner && member.role !== 'owner' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMemberToRemove({ id: member.user_id, email: member.email });
                                setShowRemoveMemberDialog(true);
                              }}
                              className="bg-transparent border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300 cursor-pointer"
                              title="Remove member"
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No members</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Join Requests Tab (Owner Only) */}
              {group.is_owner && (
                <TabsContent value="requests" className="mt-0">
                  <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white text-xl flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600" />
                        Join Requests
                        {joinRequests.length > 0 && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                            {joinRequests.length}
                          </span>
                        )}
                      </h3>
                    </div>
                    {loadingRequests ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-400">Loading requests...</p>
                      </div>
                    ) : joinRequests.length > 0 ? (
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {joinRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="w-12 h-12 border border-zinc-700">
                                <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
                                  <User className="w-6 h-6 text-zinc-400" />
                                  <span className="sr-only">{getInitials(request.user_email)}</span>
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{request.user_email}</p>
                                <p className="text-zinc-500 text-xs mt-1">
                                  Requested {new Date(request.requested_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white border-none"
                                title="Approve"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRejectRequest(request.id)}
                                variant="outline"
                                className="bg-transparent border-red-800 text-red-400 hover:bg-red-950"
                                title="Reject"
                              >
                                <XIcon className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No pending requests</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Group Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 sticky top-24">
              <h3 className="text-white text-xl mb-4">Group Stats</h3>
              <div className="space-y-6">
                <div>
                  <span className="text-zinc-400 text-sm">Total Members</span>
                  <div className="text-white text-2xl font-semibold mt-1">{Number(group.member_count) || 0}</div>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm">Movies Added</span>
                  <div className="text-white text-2xl font-semibold mt-1">{groupMovies.length}</div>
                </div>
                <div>
                  <span className="text-zinc-400 text-sm">Created</span>
                  <div className="text-white text-lg mt-1">{new Date(group.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {group.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to leave this group? You'll need to request to join again if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to remove {memberToRemove?.email} from {group.name}? They will need to request to join again if they want to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 cursor-pointer"
              onClick={() => {
                setShowRemoveMemberDialog(false);
                setMemberToRemove(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog open={showDeleteGroupDialog} onOpenChange={setShowDeleteGroupDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{group?.name}"? This action cannot be undone. All members will be removed and all movies will be deleted from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 cursor-pointer"
              onClick={() => setShowDeleteGroupDialog(false)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Group Modal */}
      <EditGroupModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        group={group ? { id: group.id, name: group.name, description: group.description } : null}
        onSuccess={async () => {
          await fetchGroup();
        }}
      />
    </div>
  );
}

// Helper function to convert TMDb movie to our Movie type
function convertTMDBToMovie(tmdbMovie: any): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    posterUrl: tmdbMovie.poster_path || '',
    rating: tmdbMovie.vote_average,
    year: new Date(tmdbMovie.release_date).getFullYear() || 0,
    genre: tmdbMovie.genres?.map((g: any) => g.name) || [],
    duration: tmdbMovie.runtime || 0,
    description: tmdbMovie.overview,
    director: '',
    cast: [],
    inCinemas: false,
    releaseDate: tmdbMovie.release_date,
  };
}
