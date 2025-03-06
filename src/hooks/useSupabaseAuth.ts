
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (authUser: any) => {
      try {
        // First check if the user exists in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError) {
          // If user doesn't exist in the users table, create them
          if (userError.code === 'PGRST116') { // Code for "no rows returned"
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: authUser.email
              });
            
            if (insertError) {
              console.error("Error creating user record:", insertError);
              toast({
                title: "Error setting up user profile",
                description: insertError.message,
                variant: "destructive"
              });
              return null;
            }
            
            // Get the newly created user
            const { data: newUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single();
              
            return newUser;
          } else {
            console.error("Error fetching user data:", userError);
            return null;
          }
        }
        
        return userData;
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        return null;
      }
    };

    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const userData = await fetchUserData(data.user);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
