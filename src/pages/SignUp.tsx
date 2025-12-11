import React from "react";

interface SignUpProps {
  setView: (view: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setView }) => {
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your registration logic here (e.g., Firebase/API)
    console.log("User registered");
    setView("market"); // Redirect to app on success
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-gray-500 text-sm mt-2">Join TradeHub today</p>
        </div>

        <form className="space-y-5" onSubmit={handleSignUp}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 pt-4">
          <span className="text-gray-600">Already have an account? </span>
          <button 
            onClick={() => setView("LogIn")} 
            className="text-indigo-600 font-medium hover:underline"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;