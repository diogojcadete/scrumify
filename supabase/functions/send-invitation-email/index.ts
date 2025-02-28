
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
    const acceptUrl = `https://your-app-domain.com/accept-invitation?id=${collaboratorId}&projectId=${projectId}`;
    
    // Email content
    const message = {
      from: Deno.env.get('SMTP_FROM') || 'scrumify@example.com',
      to: to,
      subject: `Invitation to collaborate on ${projectTitle}`,
      html: `
        <h1>You've been invited to collaborate</h1>
        <p>${inviterEmail} has invited you to collaborate on the project "${projectTitle}" as a ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="${acceptUrl}">Accept Invitation</a></p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      `,
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
