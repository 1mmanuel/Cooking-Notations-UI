import React from "react";

function RecipeInfoForm({ info, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...info, [name]: value });
  };

  return (
    <div className="recipe-info-form">
      <h2>DETAILS</h2>
      <label htmlFor="name">Recipe Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={info.name}
        onChange={handleChange}
      />

      <label htmlFor="author">Recipe By</label>
      <input
        type="text"
        id="author"
        name="author"
        value={info.author}
        onChange={handleChange}
      />

      <label htmlFor="cookTime">Total Time</label>
      <input
        type="text"
        id="cookTime"
        name="cookTime"
        value={info.cookTime}
        onChange={handleChange}
      />

      <label htmlFor="date">Date</label>
      <input
        type="date"
        id="date"
        name="date"
        value={info.date}
        onChange={handleChange}
      />
    </div>
  );
}

export default RecipeInfoForm;
