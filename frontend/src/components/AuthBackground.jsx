const AuthBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-25 dark:opacity-10 animate-pulse" style={{ animationDuration: '5s' }} />
    <div className="absolute top-1/3 -right-24 w-96 h-96 bg-violet-300 dark:bg-violet-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-8 animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
    <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-8 animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-200 dark:bg-sky-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 dark:opacity-5 animate-pulse" style={{ animationDuration: '6s', animationDelay: '0.5s' }} />
  </div>
);

export default AuthBackground;
