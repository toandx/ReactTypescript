import React, {useState} from 'react';
import axios from 'axios';
const LOGIN_URL = 'http://localhost:8083/auth/login';
interface LoginResponse {
  accessToken: string;
  tokenType: string;
}
function TestAxios () {
    const [jwt, setJwt] = useState('Demo JWT');
    const handleLogin = async (usernameValue : string, passwordValue: string) => {
      try {
        // Make POST request and expect a plain string response
        const response = await axios.post<LoginResponse>(LOGIN_URL, {
          username: usernameValue,
          password: passwordValue
        });

        const {accessToken, tokenType} = response.data; // The string returned from backend
        setJwt(accessToken);
      } catch (error) {
        console.error('Login failed:', error);
      }
    };
    return (
        <div className="container-fluid vh-100 vw-100"> {/* height = 100% view height */}
            <p> Response jwt: {jwt}</p>
            <button onClick={() => handleLogin('toandx','123')}>Login</button>
        </div>
    )
}

export default TestAxios;