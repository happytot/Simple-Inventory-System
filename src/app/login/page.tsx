'use client'; 

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // Import useState

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Add state to hold the redirect URL
  const [redirectTo, setRedirectTo] = useState('');

  useEffect(() => {
    // As soon as the component mounts in the browser,
    // set the redirect URL using window.location.origin
    setRedirectTo(`${window.location.origin}/auth/callback`);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // If the user is signed in, redirect them to the home page
      if (session) {
        router.push('/');
        router.refresh(); 
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);
  
  // If the URL isn't set yet, don't render the Auth component
  if (!redirectTo) {
    return null; // Or show a loading spinner
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Inventory Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['github',]} 
          // Use the state variable for the redirect URL
          redirectTo={redirectTo} 
        />
      </div>
    </div>
  );
}