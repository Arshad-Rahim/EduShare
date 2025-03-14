import AuthForm from "../AuthForm";

// Example 1: Admin Login Page
export function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <AuthForm
        role="admin"
        showRegistration={false}
        onLogin={(data) => console.log("Admin login:", data)}
      />
    </div>
  );
}
