import React from "react";
import { Pagination } from "react-bootstrap";

function PaginationSection({ currentPage, totalPages, handlePageChange }) {
  return (
    <div>
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </div>
  );
}

export default PaginationSection;
