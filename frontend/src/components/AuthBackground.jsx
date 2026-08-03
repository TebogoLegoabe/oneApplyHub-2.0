const AuthBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-200 dark:bg-brand-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-25 dark:opacity-10" />
    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-200 dark:bg-gold-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 dark:opacity-[0.06]" />
  </div>
);

export default AuthBackground;
