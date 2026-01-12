import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <header className="content-header">
                    {/* We can add a global clock here later, similar to inicio.py */}
                    <div className="breadcrumb">Workspace / Systems Engineering</div>
                </header>
                <section className="page-container">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default Layout;