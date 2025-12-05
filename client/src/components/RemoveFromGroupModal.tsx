import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
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

interface RemoveFromGroupModalProps {
  open: boolean;
  onClose: () => void;
  movieId: number;
  movieTitle: string;
  groupsWithMovie: Group[];
}

export function RemoveFromGroupModal({ 
  open, 
  onClose, 
  movieId, 
  movieTitle,
  groupsWithMovie 
}: RemoveFromGroupModalProps) {
  const [removing, setRemoving] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleRemoveFromGroup = async (groupId: number) => {
    try {
      setRemoving(groupId); // näytetään removing nappi
      await groupsAPI.removeMovie(groupId, movieId); //API kustus poissa movies groupista
      toast.success(`Removed "${movieTitle}" from group`);
      onClose(); // sulkee modaalin
      
      navigate(`/groups/${groupId}`); 
    } catch (error: any) {
      console.error('Failed to remove movie from group:', error);
      toast.error(error.message || 'Failed to remove movie from group');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Remove from Group</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a group to remove "{movieTitle}" from
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {groupsWithMovie.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">This movie is not in any of your groups</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupsWithMovie.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleRemoveFromGroup(group.id)}
                  disabled={removing === group.id}
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
                    {removing === group.id ? (
                      <div className="text-zinc-400 text-sm">Removing...</div>
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
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
