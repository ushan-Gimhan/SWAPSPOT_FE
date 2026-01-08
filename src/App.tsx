import { AuthProvider } from "./context/authContext";
import Router from "./routes/router";
import { Provider } from "react-redux";
import { store } from "./store/";

export default function App() {
  return (
    <Provider store={store}>       {/* Redux */}
      <AuthProvider>               {/* Context */}
        <Router />
      </AuthProvider>
    </Provider>
  );
}

