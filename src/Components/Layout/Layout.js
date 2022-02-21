import { Outlet } from "react-router-dom"
import Footer from "../Footer"
import Navbar from "../Navbar"

const Layout = (props) => {
        return(
        <>
            <Navbar />
                <Outlet />
            <Footer />
        </>
    );
};

export default Layout;