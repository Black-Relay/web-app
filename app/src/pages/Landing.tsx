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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
        padding: "2rem",
        zIndex: 1000,
      }}
    >
      <img
        src="/ahrbrlogo.png"
        alt="Black Relay Logo"
        style={{
          maxWidth: "400px",
          width: "100%",
          height: "auto",
        }}
      />
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Black Relay
      </h1>
      <p
        style={{
          textAlign: "center",
          maxWidth: "600px",
          opacity: 0.8,
        }}
      >
        Open source COP software built by voluteers from Arrowhead Research
      </p>
      <Button onClick={() => navigate("/login")}>Get Started</Button>
    </div>
  );
}
