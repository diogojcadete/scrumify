
// Re-export the supabase client
export { supabase } from './client';

// Re-export auth functions
export {
  signUp,
  signIn,
  signOut,
  getSession
} from './auth';

// Re-export project functions
export {
  createProjectInDB,
  getProjectsFromDB,
  getProjectsByCollaborator,
  updateProjectInDB,
  deleteProjectFromDB
} from './projects';

// Re-export sprint functions
export {
  createSprintInDB,
  getSprintsFromDB,
  updateSprintInDB,
  completeSprintInDB,
  deleteSprintFromDB
} from './sprints';

// Re-export collaborator functions
export {
  sendCollaboratorInvitation,
  getInvitationsForUser,
  updateInvitationStatus
} from './collaborators';
