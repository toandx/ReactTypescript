import { Outlet, Link } from "react-router-dom";

const MasterLayout = () => {
  return (
    <div className = "container-fluid">
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" href="/">Bootstrap</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/d3">D3</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/axios">Axios</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/context">Context</a>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default MasterLayout;