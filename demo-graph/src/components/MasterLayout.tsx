import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
const MasterLayout = () => {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
};

export default MasterLayout;