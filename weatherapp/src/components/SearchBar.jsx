import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!value.trim()) return;
    onSearch(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="search">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Enter city (e.g., Victoria)"
      />
      <button type="submit">Search</button>
    </form>
  );
}
