import AuthForm from "../AuthForm";

// Example 3: Tutor Portal (Login & Register)
export function TutorPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <AuthForm
        role="tutor"
        onLogin={(data) => console.log("Tutor login:", data)}
        onRegister={(data) => console.log("Tutor registration:", data)}
      />
    </div>
  );
}



