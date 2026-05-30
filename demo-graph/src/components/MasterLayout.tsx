import { Outlet, Link } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import NavBar from "./NavBar";
const MasterLayout = () => {
  return (
    <div className = "container-fluid">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default MasterLayout;