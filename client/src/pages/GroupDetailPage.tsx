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

// Ryhmän tiedon rakenne (tyyppi)
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

  // Haetaan liittymispyynnöt vain omistajalle
  const fetchJoinRequests = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingRequests(true);
      const requests = await groupsAPI.getJoinRequests(Number(id));
      setJoinRequests(requests.requests || []);
    } catch {
      // Ei näytetä virhettä jos käyttäjä ei ole omistaja
    } finally {
      setLoadingRequests(false);
    }
  }, [id]);

  // Haetaan ryhmän tiedot backendistä
  const fetchGroup = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const groupData = await groupsAPI.getDetails(Number(id));
      setGroup(groupData);

      // Haetaan ryhmän elokuvat jos käyttäjä on jäsen
      if (groupData.is_member && groupData.content) {
        const moviePromises = groupData.content.map(async (item: any) => {
          try {
            const movieData = await moviesAPI.getDetails(item.movie_id);
            return convertTMDBToMovie(movieData);
          } catch {
            return null;
          }
        });

        const movies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);
        setGroupMovies(movies);

        // Ryhmän kuva otetaan ensimmäisen elokuvan posterista
        if (movies.length > 0 && movies[0].posterUrl) {
          setGroupImageUrl(`https://image.tmdb.org/t/p/w500${movies[0].posterUrl}`);
        } else {
          setGroupImageUrl(null);
        }
      }

      // Omistaja hakee myös liittymispyynnöt
      if (groupData.is_owner) {
        await fetchJoinRequests();
      }
    } catch {
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchJoinRequests]);

  // Haetaan ryhmä kun sivu avataan
  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Odotetaan authia ennen kuin tarkistetaan jäsenyys
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Jos käyttäjä ei ole kirjautunut login sivulle
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // Näytetään lataus
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Jos ryhmää ei löytynyt
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

  // Jos käyttäjä ei ole ryhmän jäsen
  if (!group.is_member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-white text-2xl mb-2">Members Only</h2>
          <p className="text-zinc-400 mb-6">
            Tämä ryhmä näkyy vain sen jäsenille.
          </p>

          {/* Toiminnot palaa tai pyydä liittymistä */}
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

  // Ryhmästä poistuminen
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

  // Hyväksytään liittymispyyntö
  const handleApproveRequest = async (requestId: number) => {
    try {
      await groupsAPI.approveRequest(Number(id), requestId);
      toast.success('Join request approved');
      await fetchJoinRequests();
      await fetchGroup();
    } catch {
      toast.error('Failed to approve request');
    }
  };

  // Hylätään liittymispyyntö
  const handleRejectRequest = async (requestId: number) => {
    try {
      await groupsAPI.rejectRequest(Number(id), requestId);
      toast.success('Join request rejected');
      await fetchJoinRequests();
    } catch {
      toast.error('Failed to reject request');
    }
  };

  // Poistetaan jäsen ryhmästä
  const handleRemoveMember = async () => {
    if (!memberToRemove || !id) return;

    try {
      await groupsAPI.removeMember(Number(id), memberToRemove.id);
      toast.success(`Removed ${memberToRemove.email}`);
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);
      await fetchGroup();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  // Ryhmän poistaminen kokonaan
  const handleDeleteGroup = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await groupsAPI.delete(Number(id));
      toast.success(`Group "${group?.name}" deleted`);
      navigate('/groups');
    } catch {
      toast.error('Failed to delete group');
      setDeleting(false);
    }
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black">

      {/* Ryhmän yläosan tiedot */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Takaisin ryhmälistaan */}
          <Link to="/groups">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Ryhmän kuva */}
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

            {/* Ryhmän tiedot */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-white text-3xl md:text-4xl">{group.name}</h1>

                {/* Omistajan toiminnot */}
                {group.is_owner && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      onClick={() => setShowDeleteGroupDialog(true)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-red-800 text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-zinc-300 mb-4">{group.description || 'No description'}</p>

              {/* Ryhmän perustiedot */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-zinc-400">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{group.member_count} members</span>
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

              {/* Poistu ryhmästä -painike */}
              <div className="flex gap-3">
                {!group.is_owner && (
                  <Button
                    onClick={() => setShowLeaveDialog(true)}
                    variant="outline"
                    className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-red-950 hover:text-red-400"
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

      {/* Sisältö: elokuvat, jäsenet, pyynnöt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Pääsisältö */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              {/* Tab valikko */}
              <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
                {/* Elokuvat valikko */}
                <TabsTrigger
                  value="movies"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400"
                >
                  <Film className="w-4 h-4 mr-2" />
                  Movies ({groupMovies.length})
                </TabsTrigger>

                {/* Jäsenet */}
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Members ({group.members?.length || 0})
                </TabsTrigger>

                {/* Liittymispyynnöt  vain omistajalle */}
                {group.is_owner && (
                  <TabsTrigger
                    value="requests"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-zinc-400"
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

              {/* Elokuvat-tab sisältö */}
              <TabsContent value="movies">
                {/* Otsikko + Lisää elokuva */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Film className="w-6 h-6 text-red-600" />
                    <h2 className="text-white text-2xl">Group's Movies</h2>
                  </div>

                  {/* Omistaja voi lisätä elokuvia */}
                  {group.is_owner && (
                    <Link to="/search">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Movie
                      </Button>
                    </Link>
                  )}
                </div>


                {/* Elokuvat gridinä */}
                {groupMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {groupMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        showRemoveButton={group.is_owner}
                        onRemove={async () => {
                          try {
                            await groupsAPI.removeMovie(Number(id), movie.id);
                            toast.success(`Removed "${movie.title}"`);
                            await fetchGroup();
                          } catch {
                            toast.error('Failed to remove movie');
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  // Ei vielä elokuvia
                  <div className="bg-zinc-900 rounded-lg p-8 text-center border border-zinc-800">
                    <Film className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-4">No movies added yet</p>

                    {group.is_owner && (
                      <Link to="/search">
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Movie
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Jäsenet tab sisältö */}
              <TabsContent value="members">
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                  <h3 className="text-white text-xl flex items-center gap-2 mb-6">
                    <Users className="w-5 h-5 text-red-600" />
                    Members ({group.members?.length || 0})
                  </h3>

                  {/* Jäsenlista */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {group.members && group.members.length > 0 ? (
                      group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">

                          {/* Jäsenen tiedot */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-12 h-12 border-2 border-zinc-700">
                              <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
                                <User className="w-6 h-6 text-zinc-400" />
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

                          {/* Omistaja voi poistaa jäseniä */}
                          {group.is_owner && member.role !== 'owner' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setMemberToRemove({ id: member.user_id, email: member.email });
                                setShowRemoveMemberDialog(true);
                              }}
                              className="bg-transparent border-red-800 text-red-400 hover:bg-red-950"
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      // Ei jäseniä
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">No members</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Liittymispyynnöt tab omistajalle */}
              {group.is_owner && (
                <TabsContent value="requests">
                  <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">

                    <h3 className="text-white text-xl flex items-center gap-2 mb-6">
                      <Bell className="w-5 h-5 text-red-600" />
                      Join Requests
                    </h3>

                    {/* Ladataan pyynnöt */}
                    {loadingRequests ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-400">Loading...</p>
                      </div>
                    ) : joinRequests.length > 0 ? (
                      // Lista pyynnöistä
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {joinRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">

                            {/* Pyynnön tiedot */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="w-12 h-12 border border-zinc-700">
                                <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
                                  <User className="w-6 h-6 text-zinc-400" />
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{request.user_email}</p>
                                <p className="text-zinc-500 text-xs mt-1">
                                  Requested {new Date(request.requested_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Hyväksy tai hylkää */}
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-transparent border-red-800 text-red-400 hover:bg-red-950"
                              >
                                <XIcon className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      // Ei odottavia pyyntöjä
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

          {/* Sivu   ryhmän statistiikka */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 sticky top-24">

              <h3 className="text-white text-xl mb-4">Group Stats</h3>

              <div className="space-y-6">

                <div>
                  <span className="text-zinc-400 text-sm">Total Members</span>
                  <div className="text-white text-2xl mt-1">{group.member_count}</div>
                </div>

                <div>
                  <span className="text-zinc-400 text-sm">Movies Added</span>
                  <div className="text-white text-2xl mt-1">{groupMovies.length}</div>
                </div>

                <div>
                  <span className="text-zinc-400 text-sm">Created</span>
                  <div className="text-white text-lg mt-1">
                    {new Date(group.created_at).toLocaleDateString()}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Poistu ryhmästä dialogi */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {group.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to leave this group?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleLeaveGroup} className="bg-red-600 hover:bg-red-700">
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Poista jäsen dialogi */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Remove member from group?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Poista koko ryhmä dialog */}
      <AlertDialog open={showDeleteGroupDialog} onOpenChange={setShowDeleteGroupDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Group'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editointi ikkuna */}
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

// Muunnetaan TMDBelokuva meidän Movietyyppiin
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
