import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import { SearchContext } from "../contexts/SearchContext";

function SearchBar() {
  const { search, setSearch } = useContext(SearchContext);
  
  return (
    <>
      <Form>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </Form.Group>
      </Form>
    </>
  );
}

export default SearchBar;
