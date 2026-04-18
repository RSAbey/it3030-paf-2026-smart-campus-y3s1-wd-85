import {use, useEffect, useState} from "react"; // eslint-disable-next-line no-unused-vars
import api from "../services/api"; // eslint-disable-next-line no-unused-vars

// eslint-disable-next-line no-unused-vars
function ResourcePage() {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        api.get('/resources')
            .then((res) => setResources(res.data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1>Resources</h1>
            {resources.map((r) => (
                <p key={r.id}>{r.name}</p>
            ))}
        </div>
    );
}

export default ResourcePage;