import { Link } from "react-router-dom";

export function SignUp() {
  return (
    <div>
      create an account here
      <Link to="/login">Already have an account? Login here</Link>
    </div>
  );
}
