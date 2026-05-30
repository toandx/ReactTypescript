import { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import config from "../../config";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
        console.log(username, password);
        // Make POST request and expect a plain string response
        const response = await axios.post(config.url+'/auth/login', {
            username: username,
            password: password
        });

        const token = response.data.accessToken;
        localStorage.setItem("jwt", token);
        console.log("Login success "+token);
        navigate('/');
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login fail '+error);
    }
  };

  return (
    <Container style={{ maxWidth: "400px", marginTop: "100px" }}>
      <h2 className="mb-3">Login</h2>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleLogin}>
        Login
      </Button>
    </Container>
  );
}

export default Login;