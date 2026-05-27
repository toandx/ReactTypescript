import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
const NavBar = () => {
  return (
      <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          ToanDX
        </Navbar.Brand>

        {/* Toggle button */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible menu */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <NavDropdown title="Demo">
              <NavDropdown.Item href="/d3">
                D3
              </NavDropdown.Item>
              <NavDropdown.Item href="/axios">
                Axios
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/context">
                Context
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;