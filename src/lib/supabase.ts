
import { createClient } from '@supabase/supabase-js';
import { CollaboratorFormData, ProjectFormData, SprintFormData } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btutiksghrrxrxqxwlnk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dXRpa3NnaHJyeHJ4cXh3bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NDk2ODUsImV4cCI6MjA1NjMyNTY4NX0.SSAGtVl0jMLM9v6isoC4oZOZ-Q92nLNZO2RMOUZeyaE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    }
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

// Project database functions
export async function createProjectInDB(projectData: ProjectFormData, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      owner_id: userId
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getProjectsFromDB() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  return { data, error };
}

export async function updateProjectInDB(id: string, projectData: ProjectFormData) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      title: projectData.title,
      description: projectData.description,
      end_goal: projectData.endGoal,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteProjectFromDB(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
    
  return { error };
}

// Sprint database functions
export async function createSprintInDB(sprintData: SprintFormData, projectId: string) {
  // Create a sprints table first if it doesn't exist
  const { data, error } = await supabase
    .from('sprints')
    .insert({
      title: sprintData.title,
      description: sprintData.description,
      project_id: projectId,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      is_completed: false
    })
    .select()
    .single();
    
  return { data, error };
}

export async function getSprintsFromDB(projectId?: string) {
  let query = supabase
    .from('sprints')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  
  const { data, error } = await query;
  return { data, error };
}

export async function updateSprintInDB(id: string, sprintData: SprintFormData) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      title: sprintData.title,
      description: sprintData.description,
      start_date: sprintData.startDate,
      end_date: sprintData.endDate,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function completeSprintInDB(id: string) {
  const { data, error } = await supabase
    .from('sprints')
    .update({
      is_completed: true,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
}

export async function deleteSprintFromDB(id: string) {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);
    
  return { error };
}

export async function sendCollaboratorInvitation(projectId: string, projectTitle: string, collaboratorData: CollaboratorFormData) {
  try {
    // Get current user's email for the invitation
    const { data: userData } = await supabase.auth.getUser();
    const inviterEmail = userData.user?.email || 'A team member';
    
    // Store invitation in the collaborators table
    const { data: collaborator, error: dbError } = await supabase
      .from('collaborators')
      .insert({
        project_id: projectId,
        email: collaboratorData.email,
        role: collaboratorData.role
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Failed to store invitation:', dbError);
      return { success: false, error: dbError.message };
    }
    
    // Send the actual email via Edge Function
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to: collaboratorData.email,
        projectTitle,
        inviterEmail,
        projectId,
        role: collaboratorData.role,
        collaboratorId: collaborator.id
      }
    });
    
    if (error) {
      console.error('Failed to send invitation email:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

// Create a Supabase Edge Function to send the email
export async function createSendInvitationEdgeFunction() {
  const functionDefinition = `
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
  import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }
    
    try {
      const { to, projectTitle, inviterEmail, projectId, role, collaboratorId } = await req.json();
      
      // Validate input
      if (!to || !projectTitle || !inviterEmail) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Configure email client
      // In production, you would use environment variables for these values
      const client = new SmtpClient();
      
      // Replace these with your actual SMTP settings - you would get these from Supabase secrets
      // For a real implementation, you would use SendGrid, Mailgun, or a similar service
      // This is just a placeholder for demonstration
      await client.connectTLS({
        hostname: Deno.env.get('SMTP_HOSTNAME') || 'smtp.example.com',
        port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
        username: Deno.env.get('SMTP_USERNAME') || 'your-username',
        password: Deno.env.get('SMTP_PASSWORD') || 'your-password',
      });
      
      // Create acceptance link - in a real app, this would go to your application
      const acceptUrl = \`https://your-app-domain.com/accept-invitation?id=\${collaboratorId}&projectId=\${projectId}\`;
      
      // Email content
      const message = {
        from: Deno.env.get('SMTP_FROM') || 'scrumify@example.com',
        to: to,
        subject: \`Invitation to collaborate on \${projectTitle}\`,
        html: \`
          <h1>You've been invited to collaborate</h1>
          <p>\${inviterEmail} has invited you to collaborate on the project "\${projectTitle}" as a \${role}.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="\${acceptUrl}">Accept Invitation</a></p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        \`,
      };
      
      // Send the email
      await client.send(message);
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      
    } catch (error) {
      console.error('Error sending invitation email:', error);
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  });
  `;
  
  // This function would normally be run during deployment, not at runtime
  // It's included here for reference only
  console.log('Edge function definition:', functionDefinition);
  
  return functionDefinition;
}
