import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { groupsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  description?: string;
  member_count: number;
  is_member: boolean;
}

interface AddToGroupModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
}

export function AddToGroupModal({ open, onClose, movieId, movieTitle }: AddToGroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchUserGroups();
    }
  }, [open]);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const data = await groupsAPI.getAll(1, 1000);
      const userGroups = data.groups?.filter((g: any) => g.is_member) || [];
      setGroups(userGroups);
    } catch (error: any) {
      console.error('Failed to fetch groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async (groupId: number) => {
    try {
      setAdding(groupId);
      await groupsAPI.addMovie(groupId, movieId);
      toast.success(`Added "${movieTitle}" to group`);
      onClose();
      // Optionally navigate to the group
      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      console.error('Failed to add movie to group:', error);
      toast.error(error.message || 'Failed to add movie to group');
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add to Group</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a group to add "{movieTitle}" to
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-zinc-400 text-center py-8">Loading groups...</p>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">You're not a member of any groups yet</p>
              <Button
                onClick={() => {
                  onClose();
                  navigate('/groups');
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create a Group
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleAddToGroup(group.id)}
                  disabled={adding === group.id}
                  className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{group.name}</h3>
                      {group.description && (
                        <p className="text-zinc-400 text-sm line-clamp-1">{group.description}</p>
                      )}
                      <p className="text-zinc-500 text-xs mt-1">
                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    {adding === group.id ? (
                      <div className="text-zinc-400 text-sm">Adding...</div>
                    ) : (
                      <Plus className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

