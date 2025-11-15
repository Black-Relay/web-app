import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/providers/UserProvider";
import { useEffect } from "react";

export function Landing() {
  const navigate = useNavigate();
  const { user } = useUserContext();

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (user.role === "user" || user.role === "admin") {
      navigate("/app/dashboard");
    }
  }, [user.role, navigate]);

  return (
    <div className="layout-main-content">
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        gap: '2rem'
      }}>
        <img 
          src="/ahrbrlogo.png" 
          alt="Black Relay Logo" 
          style={{
            maxWidth: '400px',
            width: '100%',
            height: 'auto'
          }}
        />
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Welcome to Black Relay
        </h1>
        <p style={{
          textAlign: 'center',
          maxWidth: '600px',
          opacity: 0.8
        }}>
          First Responder Crisis Management Platform
        </p>
        <Button onClick={() => navigate("/login")}>
          Get Started
        </Button>
      </main>
    </div>
  );
}
