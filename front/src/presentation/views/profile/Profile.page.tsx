import { useNavigate } from "react-router";

const Profile = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div>
            <h1>👤 Профиль пользователя</h1>
            <p>Роль: {user.role || "гость"}</p>
            <button onClick={() => navigate("/")}>Вернуться на главную</button>
        </div>
    );
};


export default Profile;
