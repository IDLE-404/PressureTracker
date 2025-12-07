import { useNavigate } from "react-router";

const Product = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>🛍️ Магазин — Products Page</h1>
      <p>Здесь показаны товары для покупки.</p>
      <button onClick={() => navigate("/profile")}>Перейти в профиль</button>
    </div>
  );
};

Product.route = {
  path: "/product",
  auth: true,
  roles: ["user", "admin"],
};

export default Product;
