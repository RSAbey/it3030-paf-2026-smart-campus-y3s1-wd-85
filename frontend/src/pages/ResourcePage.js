import { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";
import api from "../services/api";

function ResourcePage({ role = "admin" }) {
    const [resources, setResources] = useState([]);
    const Layout = role === "student" ? StudentLayout : AdminLayout;

    useEffect(() => {
        api.get('/resources')
            .then((res) => setResources(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <Layout>
            <div>
                <h1>Resources</h1>
                {resources.map((r) => (
                    <p key={r.id}>{r.name}</p>
                ))}
            </div>
        </Layout>
    );
}

export default ResourcePage;