import React, { useContext } from "react";
import { CategoriesContext } from "../contexts/CategoriesContext";

function SelectCategory() {
  const { categories, selectedCategory, setSelectedCategory } = useContext(CategoriesContext);

  return (
    <>
      <div key="All" className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="category"
          id="All"
          value="All"
          checked={selectedCategory === "All"}
          onChange={(e) => setSelectedCategory(e.target.value)}
        />
        <label className="form-check-label" htmlFor="All">
          All
        </label>
      </div>
      {categories.map((category, index) => (
        <div key={category.name + index} className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="category"
            id={category.name}
            value={category.name}
            checked={selectedCategory === category.name}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
          <label className="form-check-label" htmlFor={category.name}>
            {category.name}
          </label>
        </div>
      ))}
    </>
  );
}

export default SelectCategory;
