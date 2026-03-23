import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import { BrandsContext } from "../contexts/BrandsContext";

function SelectBrands() {
  const { brands, selectedBrands, handleSelectBrands } =
    useContext(BrandsContext);

  return (
    <div key="brand" className="d-flex flex-wrap">
      {brands.map((brand) => (
        <div key={`brand-${brand.id}`} className="m-2">
          <Form.Check 
            type="checkbox"
            id={brand.id}
            label={brand.name}
            checked={!!selectedBrands[brand.id]}
            onChange={(e) => handleSelectBrands(e.target.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default SelectBrands;
