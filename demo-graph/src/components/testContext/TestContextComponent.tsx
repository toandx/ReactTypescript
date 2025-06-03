import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

const TestContextComponent = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("ChildComponent must be used within a ThemeProvider");
  }

  const { theme, toggleTheme } = context; 

  return (
    <div>
      <h1>Current theme: {theme}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

export default TestContextComponent;