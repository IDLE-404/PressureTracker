import { useNavigate } from "react-router";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>🔑 Пожалуйста, войдите</h1>
      <button onClick={() => navigate("/home")}>На главную</button>
    </div>
  );
};

Login.route = {
  path: "/login",
};

export default Login;
