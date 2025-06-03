import React from "react";
import { ThemeProvider } from "../components/testContext/ThemeContext";
import TestContextComponent from "../components/testContext/TestContextComponent";
import { AuthProvider } from "../components/testContext/Auth";
import AuthContextComponent from "../components/testContext/AuthContextComponent";
function TestContext () {
    return (
        <React.Fragment>
            <p className="d-flex justify-content-center"> Test Context </p>
            <ThemeProvider>
                <TestContextComponent />
            </ThemeProvider>
            <AuthProvider>
                <AuthContextComponent />
            </AuthProvider>
        </React.Fragment>
    )
}

export default TestContext;