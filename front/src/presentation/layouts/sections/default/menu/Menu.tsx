import styles from "./style/Style.module.css";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Menu = () => {
  return (
    <nav className={styles.menu}>
      <button onClick={() => scrollToSection("add-section")}>Новое измерение</button>
      <button onClick={() => scrollToSection("history-section")}>История</button>
      <button onClick={() => scrollToSection("stats-section")}>Статистика</button>
    </nav>
  );
};

export default Menu;
