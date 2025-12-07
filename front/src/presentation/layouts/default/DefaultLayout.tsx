
import Header from "../sections/default/header/Header";
import Menu from "../sections/default/menu/Menu";
import Footer from "../sections/default/footer/Footer";

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header />
            <Menu />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
};

export default DefaultLayout;
