import React, { useEffect, useState } from "react";
import axios from "axios";

const QueryHistory = ({ userId, update }) => { 
  const [history, setHistory] = useState([]);

  const fetchQueryHistory = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.get(`http://localhost:9000/query/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistory(response.data); 
    } catch (error) {
      console.error("Error fetching query history:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchQueryHistory();
    }
  }, [userId, update]); 

  return (
    <div style={{ overflowY: "scroll", height: "100%", padding: "10px", backgroundColor: "#f8f8f8" }}>
      <h3>Query History</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {history.map((query, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              backgroundColor: "#e6e6e6",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {query.query}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueryHistory;
