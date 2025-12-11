import { AuthProvider } from "./context/authContext";
import Router from "./routes/router";

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
