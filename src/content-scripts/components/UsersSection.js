import React from "react";

const UsersSection = ({ users = [], style }) => {
  const picUrl = chrome.runtime.getURL("images/empty_profile_picture.png");

  return (
    <div className="section colored" style={style}>
      <ul className="users">
        {users.map((u) => (
          <li key={u.id}>
            <img src={picUrl} />
            {u.name || u.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersSection;
