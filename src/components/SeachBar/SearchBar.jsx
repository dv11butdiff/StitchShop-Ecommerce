import { useState, useEffect } from "react";
import "./searchbar.css";

const SearchBar = ({ setSearchTerm }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search..."
        onChange={handleChange}
      />
      <ion-icon name="search-outline" className="search-icon"></ion-icon>
    </div>
  );
};

export default SearchBar;