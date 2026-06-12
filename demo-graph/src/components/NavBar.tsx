import Container from 'react-bootstrap/Container';
import { Nav,Navbar,NavDropdown, Button } from 'react-bootstrap';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
const NavBar = () => {
  const userContext = useContext(UserContext);
  const logout = () => {
    localStorage.setItem("jwt", '');
    userContext?.setUser('');
  };
  return (
      <Navbar bg="light" variant="light" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand href="/">ToanDX</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible menu */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
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
          <Nav className="ms-auto align-items-center">
            {userContext?.user ? (
              <>
                <Navbar.Text className="me-3">
                  Hello {userContext?.user}
                </Navbar.Text>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;