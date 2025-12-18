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
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const data = await groupsAPI.getAll(1, 100);
        const groupsData = data.groups || [];
        
        // Fetch first movie poster for each group that has a movie
        const groupsWithImages = await Promise.all(
          groupsData.map(async (group: Group) => {
                if (group.first_movie_id) {
                  try {
                    const movieData = await moviesAPI.getDetails(group.first_movie_id);
                    return {
                      ...group,
                      imageUrl: movieData.poster_path || '',
                    };
                  } catch (error) {
                    // If movie fetch fails, use empty string (will show Film icon)
                    return { ...group, imageUrl: '' };
                  }
                }
            return { ...group, imageUrl: '' };
          })
        );
        
        setGroups(groupsWithImages);
      } catch (error: any) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const handleConfirmJoin = async (message?: string) => {
    if (selectedGroup) {
      try {
        await groupsAPI.requestToJoin(selectedGroup.id);
        toast.success(`Join request sent to ${selectedGroup.name}`);
        setShowJoinModal(false);
        setSelectedGroup(null);
        // Refresh groups list
        const data = await groupsAPI.getAll(1, 100);
        const groupsData = data.groups || [];
        
        // Fetch first movie poster for each group that has a movie
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
              } catch (error) {
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

  const totalMembers = groups.reduce((sum, g) => sum + (Number(g.member_count) || 0), 0);
  const avgMembers = groups.length > 0 ? Math.round(totalMembers / groups.length) : 0;

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-red-600" />
              <h1 className="text-white text-4xl">Movie Groups</h1>
            </div>
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
            Join communities of movie enthusiasts and connect with fellow fans
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-12"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{groups.length}</div>
            <div className="text-zinc-400">Public Groups</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="text-3xl text-white mb-2">{Number(totalMembers)}</div>
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

        {/* Groups Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl">All Public Groups</h2>
            <span className="text-zinc-400">
              {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
            </span>
          </div>

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
            <div className="text-center py-20 bg-zinc-900 rounded-lg">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white text-2xl mb-2">No groups found</h3>
              <p className="text-zinc-400">Try a different search term</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-red-950 to-zinc-950 rounded-lg p-8 text-center">
          <h2 className="text-white text-2xl mb-4">Want to Create Your Own Group?</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Start your own movie community and connect with people who share your passion for cinema.
            Organize watch parties, discuss films, and build lasting friendships.
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

      {/* Join Group Modal */}
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

      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          // Refresh groups list
          try {
            const data = await groupsAPI.getAll(1, 100);
            const groupsData = data.groups || [];
            
            // Fetch first movie poster for each group that has a movie
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
                  } catch (error) {
                    return { ...group, imageUrl: '' };
                  }
                }
                return { ...group, imageUrl: '' };
              })
            );
            
            setGroups(groupsWithImages);
          } catch (error) {
            console.error('Failed to refresh groups:', error);
          }
        }}
      />
    </div>
  );
}
