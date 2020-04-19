import React from "react";

const UsersSection = ({ users = [], style }) => {
  return (
    <div className="section" style={style}>
      <ul className="users">
        {users.map((u) => (
          <li key={u.id}>{u.name || u.id}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersSection;
