import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GrupoGPS, CreateGrupoGPS, UpdateGrupoGPS } from '@/types/gps';
import { toast } from 'sonner';

export function useGroups() {
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ['grupos-gps'],
    queryFn: async (): Promise<GrupoGPS[]> => {
      const { data, error } = await supabase
        .from('grupos_gps')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as GrupoGPS[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (newGroup: CreateGrupoGPS) => {
      const { data, error } = await supabase
        .from('grupos_gps')
        .insert(newGroup)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-gps'] });
      toast.success('Grupo criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar grupo: ' + error.message);
    },
  });

  const updateGroup = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateGrupoGPS & { id: string }) => {
      const { data, error } = await supabase
        .from('grupos_gps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-gps'] });
      toast.success('Grupo atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar grupo: ' + error.message);
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grupos_gps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-gps'] });
      queryClient.invalidateQueries({ queryKey: ['pontos-gps'] });
      toast.success('Grupo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir grupo: ' + error.message);
    },
  });

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
