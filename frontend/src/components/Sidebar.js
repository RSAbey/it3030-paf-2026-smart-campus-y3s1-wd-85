import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{ width: "200px", background: "#f4f4f4", padding: "10px" }}>
      <h3>Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/bookings">Bookings</Link></li>
        <li><Link to="/tickets">Tickets</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;