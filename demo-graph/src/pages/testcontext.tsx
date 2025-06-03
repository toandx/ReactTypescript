import React from "react";
import { ThemeProvider } from "../components/testContext/ThemeContext";
import TestContextComponent from "../components/testContext/TestContextComponent";
function TestContext () {
    return (
        <React.Fragment>
            <p className="d-flex justify-content-center"> Test Context </p>
            <ThemeProvider>
                <TestContextComponent />
            </ThemeProvider>
        </React.Fragment>
    )
}

export default TestContext;