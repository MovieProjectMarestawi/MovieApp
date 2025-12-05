import { useState, useEffect } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { GroupCard } from '../components/GroupCard';
import { JoinGroupModal } from '../components/JoinGroupModal';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { groupsAPI, moviesAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Ryhmä-objektin tiedot backendin palauttama muoto
interface Group {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  owner_email: string;
  member_count: number;
  movie_count?: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  is_owner?: boolean;
  first_movie_id?: number | null;
}

export function GroupsListPage() {
  // Hakukenttä + lista ryhmistä
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Valittu ryhmä liittymiselle
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Modaalin tilat
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Haetaan ryhmät backendistä kun sivu avataan
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const data = await groupsAPI.getAll(1, 100);
        const groupsData = data.groups || [];

        // Haetaan ryhmän ensimmäisen elokuvan kuva jos löytyy
        const groupsWithImages = await Promise.all(
          groupsData.map(async (group: Group) => {
            if (group.first_movie_id) {
              try {
                const movieData = await moviesAPI.getDetails(group.first_movie_id);
                return {
                  ...group,
                  imageUrl: movieData.poster_path || '',
                };
              } catch {
                return { ...group, imageUrl: '' };
              }
            }
            return { ...group, imageUrl: '' };
          })
        );

        setGroups(groupsWithImages);
      } catch {
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Suodatetaan ryhmät hakusanan perusteella
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Kun käyttäjä painaa ”Join”
  const handleJoinClick = (groupId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setShowJoinModal(true);
    }
  };

  // Lähetetään liittymispyyntö
  const handleConfirmJoin = async () => {
    if (selectedGroup) {
      try {
        await groupsAPI.requestToJoin(selectedGroup.id);
        toast.success(`Join request sent to ${selectedGroup.name}`);
        setShowJoinModal(false);
        setSelectedGroup(null);

        // Päivitetään lista liittymisen jälkeen
        const data = await groupsAPI.getAll(1, 100);
        const groupsData = data.groups || [];

        const groupsWithImages = await Promise.all(
          groupsData.map(async (group: Group) => {
            if (group.first_movie_id) {
              try {
                const movieData = await moviesAPI.getDetails(group.first_movie_id);
                return {
                  ...group,
                  imageUrl: movieData.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                    : '',
                };
              } catch {
                return { ...group, imageUrl: '' };
              }
            }
            return { ...group, imageUrl: '' };
          })
        );

        setGroups(groupsWithImages);
      } catch (error: any) {
        toast.error(error.message || 'Failed to send join request');
      }
    }
  };

  // Lasketaan ryhmien tilastoja
  const totalMembers = groups.reduce((sum, g) => sum + (Number(g.member_count) || 0), 0);
  const avgMembers = groups.length > 0 ? Math.round(totalMembers / groups.length) : 0;

  // Näytetään latausnäkymä kun data vielä haetaan
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Yläosa: otsikko + Create Group nappi */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-red-600" />
              <h1 className="text-white text-4xl">Movie Groups</h1>
            </div>

            {/* Näkyy vain kirjautuneelle */}
            {isLoggedIn && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            )}
          </div>
          <p className="text-zinc-400 text-lg">
            Join communities of movie fans
          </p>
        </div>

        {/* Hakukenttä ryhmille */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
        </div>

        {/* Yleistilastot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{groups.length}</div>
            <div className="text-zinc-400">Public Groups</div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{totalMembers}</div>
            <div className="text-zinc-400">Total Members</div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{avgMembers}</div>
            <div className="text-zinc-400">Avg Members/Group</div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">Active</div>
            <div className="text-zinc-400">Community Status</div>
          </div>
        </div>

        {/* Ryhmät listana */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl">All Public Groups</h2>
            <span className="text-zinc-400">
              {filteredGroups.length} groups
            </span>
          </div>

          {/* Jos löytyy ryhmiä */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={{
                    id: group.id,
                    name: group.name,
                    description: group.description || '',
                    owner: group.owner_email,
                    ownerId: group.owner_id,
                    members: group.member_count || 0,
                    movieCount: group.movie_count || 0,
                    imageUrl: (group as any).imageUrl || '',
                    isPublic: true,
                    membersList: [],
                    is_member: group.is_member || false,
                  } as any}
                  onJoinClick={handleJoinClick}
                />
              ))}
            </div>
          ) : (
            // Jos ei löytynyt tuloksia
            <div className="text-center py-20 bg-zinc-900 rounded-lg">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white text-2xl mb-2">No groups found</h3>
              <p className="text-zinc-400">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Alabanneri CTA oman ryhmän luomiseen */}
        <section className="mt-16 bg-gradient-to-r from-red-950 to-zinc-950 rounded-lg p-8 text-center">
          <h2 className="text-white text-2xl mb-4">Want to Create Your Own Group?</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Start your own movie community and meet people.
          </p>

          {isLoggedIn ? (
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          ) : (
            <p className="text-zinc-500 text-sm">Login to create a group</p>
          )}
        </section>
      </div>

      {/* Liittymisikkuna */}
      <JoinGroupModal
        group={selectedGroup ? {
          id: selectedGroup.id,
          name: selectedGroup.name,
          description: selectedGroup.description || '',
          owner: selectedGroup.owner_email,
          ownerId: selectedGroup.owner_id,
          members: selectedGroup.member_count || 0,
          imageUrl: '',
          isPublic: true,
          membersList: [],
        } : null}
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onConfirm={handleConfirmJoin}
      />

      {/* Luo uusi ryhmä modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          // Päivitetään ryhmälista luomisen jälkeen
          try {
            const data = await groupsAPI.getAll(1, 100);
            const groupsData = data.groups || [];

            const groupsWithImages = await Promise.all(
              groupsData.map(async (group: Group) => {
                if (group.first_movie_id) {
                  try {
                    const movieData = await moviesAPI.getDetails(group.first_movie_id);
                    return {
                      ...group,
                      imageUrl: movieData.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
                        : '',
                    };
                  } catch {
                    return { ...group, imageUrl: '' };
                  }
                }
                return { ...group, imageUrl: '' };
              })
            );

            setGroups(groupsWithImages);
          } catch {
            console.error('Failed to refresh groups');
          }
        }}
      />
    </div>
  );
}
