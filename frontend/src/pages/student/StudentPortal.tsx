import AuthForm from "../AuthForm";

// Example 2: Student Portal (Login & Register)
export function StudentPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <AuthForm
        role="user"
        onLogin={(data) => console.log("Student login:", data)}
        onRegister={(data) => console.log("Student registration:", data)}
      />
    </div>
  );
}
