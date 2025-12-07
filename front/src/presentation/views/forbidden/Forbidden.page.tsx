import { useNavigate } from "react-router";

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>🚫 Доступ запрещён</h1>
            <button onClick={() => navigate("/home")}>На главную</button>
        </div>
    );
};

Forbidden.route = {
    path: "/403",
};

export default Forbidden;
