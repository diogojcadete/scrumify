
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { SignUp as ClerkSignUp, useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SignUp: React.FC = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-square">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h1 className="text-xl font-bold">Agile Sprint Manager</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Sign up to start managing your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClerkSignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              redirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-none border-0 p-0",
                  header: "hidden",
                  footer: {
                    margin: "mt-5 text-center"
                  },
                },
              }}
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t p-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Agile Sprint Manager. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignUp;
