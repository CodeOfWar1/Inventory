import AuthContext from "./AuthContext";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

function ProtectedWrapper(props) {
  const auth = useContext(AuthContext);
  // console.log("====================================");
  // console.log(auth);
  // console.log("====================================");

  if (auth.loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-sm text-gray-600">Loading session...</div>
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
}
export default ProtectedWrapper;
