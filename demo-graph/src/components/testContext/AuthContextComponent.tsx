import React, { useContext } from "react";
import { useAuth } from "./Auth";

const AuthContextComponent = () => {
  const context = useAuth();

  if (!context) {
    throw new Error("ChildComponent must be used within a ThemeProvider");
  }

  const { username, password, updateUser } = context; 

  return (
    <div>
      <h1>Current User {username}</h1>
      <button onClick={updateUser}> UpdateUser</button>
    </div>
  );
};

export default AuthContextComponent;