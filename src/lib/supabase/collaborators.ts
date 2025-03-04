
import { CollaboratorFormData } from '@/types';
import { supabase } from './client';

export async function sendCollaboratorInvitation(projectId: string, projectTitle: string, collaboratorData: CollaboratorFormData) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const inviterEmail = userData.user?.email || 'A team member';
    
    const { data: collaborator, error: dbError } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        email: collaboratorData.email,
        role: collaboratorData.role
      })
      .select()
      .maybeSingle();
    
    if (dbError) {
      console.error('Failed to store invitation:', dbError);
      return { success: false, error: dbError.message };
    }
    
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to: collaboratorData.email,
        projectTitle,
        inviterEmail,
        projectId,
        role: collaboratorData.role,
        collaboratorId: collaborator?.id
      }
    });
    
    if (error) {
      console.error('Failed to send invitation email:', error);
      if (collaborator?.id) {
        await supabase
          .from('collaborators')
          .delete()
          .eq('id', collaborator.id);
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

export async function getInvitationsForUser(email: string) {
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select(`
        id,
        email,
        role,
        status,
        created_at,
        projects (
          id,
          title,
          description
        )
      `)
      .eq('email', email)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching invitations:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in getInvitationsForUser:', error);
    return { data: null, error: 'Failed to fetch invitations' };
  }
}

export async function updateInvitationStatus(id: string, status: 'accepted' | 'rejected') {
  try {
    if (status === 'accepted') {
      const { data, error } = await supabase
        .from('collaborators')
        .update({ 
          status,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Error updating invitation:', error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, error: null, data };
    } else if (status === 'rejected') {
      // For rejected invitations, delete them completely from the database
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting invitation:', error);
        return { success: false, error: error.message, data: null };
      }
      
      return { success: true, error: null, data: null };
    }
    
    return { success: false, error: "Invalid status", data: null };
  } catch (error) {
    console.error('Error in updateInvitationStatus:', error);
    return { success: false, error: 'Failed to update invitation status', data: null };
  }
}
