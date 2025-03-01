
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, projectTitle, inviterEmail, projectId, role, collaboratorId } = await req.json()

    // Validate input
    if (!to || !projectTitle || !inviterEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Invitation request received for ${to} to join project ${projectTitle} as ${role}`)

    // For this implementation, we'll just log the invitation details
    // and return success - in a production app, you would integrate with
    // an email service like SendGrid, Mailgun, etc.
    
    // Create acceptance link - in a real app, this would go to your application
    const acceptUrl = `${req.headers.get('origin') || 'https://example.com'}/accept-invitation?id=${collaboratorId}&projectId=${projectId}`
    
    console.log(`Invitation would be sent to: ${to}`)
    console.log(`From: ${inviterEmail}`)
    console.log(`Project: ${projectTitle}`)
    console.log(`Role: ${role}`)
    console.log(`Accept URL: ${acceptUrl}`)

    // In production, you would send an actual email here
    // For now, we just simulate a successful email sending

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Invitation to ${to} was processed successfully. In a production environment, an email would be sent.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing invitation:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
