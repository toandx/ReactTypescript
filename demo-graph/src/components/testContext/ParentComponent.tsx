import AuthContextComponent from "./AuthContextComponent";

const ParentComponent = () => {
  return (
    <div>
      <h1>Pass data without props</h1>
      <AuthContextComponent />
    </div>
  );
};

export default ParentComponent;