import React, { useState } from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function ProductVerticalCard({ product }) {
  // 1. Cấu hình ảnh dự phòng (Nếu ảnh thật bị lỗi, tự động hiện ảnh này)
  const fallbackImg = "https://placehold.co/400x300/f8f9fa/a3a8ad?text=No+Image";
  
  // 2. State quản lý URL ảnh. Ưu tiên lấy product.images[0], nếu không có thì lấy thumbnail, cuối cùng lấy fallback
  const [imgSrc, setImgSrc] = useState(
    (product.images && product.images.length > 0) 
      ? product.images[0] 
      : (product.thumbnail || fallbackImg)
  );

  // Lớp bảo vệ chống sập web
  if (!product) return null;

  return (
    <Card className="h-100 shadow-sm border-0 hover-elevate overflow-hidden" style={{ borderRadius: '16px' }}>
      
      {/* KHU VỰC HÌNH ẢNH */}
      <div className="position-relative bg-white d-flex align-items-center justify-content-center p-3" style={{ height: "220px" }}>
        <Card.Img
          variant="top"
          src={imgSrc}
          onError={() => setImgSrc(fallbackImg)} // TỰ ĐỘNG THAY ẢNH NẾU LINK CHẾT
          alt={product.title || "Product"}
          className="object-fit-contain w-100 h-100"
        />
        {/* Tem nhãn (Badge) góc trái */}
        <Badge bg="dark" className="position-absolute top-0 start-0 m-3 shadow-sm px-2 py-1">
          {product.brand || "Mới"}
        </Badge>
      </div>

      {/* KHU VỰC THÔNG TIN (Bỏ ListGroup cứng nhắc, dùng Flexbox) */}
      <Card.Body className="d-flex flex-column p-3 bg-light">
        <Card.Title className="fw-bold text-dark text-truncate mb-1" title={product.title} style={{ fontSize: '1.1rem' }}>
          {product.title || "Sản phẩm chưa có tên"}
        </Card.Title>
        
        <div className="text-primary fw-900 fs-4 mb-3">
          ${product.price?.toLocaleString() || 0}
        </div>

        <div className="small text-muted mb-4 flex-grow-1 d-flex flex-column gap-2">
          <div className="text-truncate" title={product.category}>
            <i className="bi bi-box-seam me-2 text-secondary"></i>
            {product.category || "Chưa phân loại"}
          </div>
          <div className="text-truncate" title={product.tags?.join(", ")}>
            <i className="bi bi-tags me-2 text-secondary"></i>
            {product.tags?.join(", ") || "Không có tag"}
          </div>
        </div>
        
        {/* NÚT BẤM CĂN ĐÁY */}
        <Link to={`/product/${product.id}`} className="mt-auto text-decoration-none">
          <Button variant="outline-primary" className="w-100 fw-bold rounded-pill shadow-sm" style={{ transition: 'all 0.3s' }}>
            <i className="bi bi-info-circle-fill me-2"></i> Xem chi tiết
          </Button>
        </Link>
      </Card.Body>

      {/* CSS Hiệu ứng Hover nhỏ (Có thể bỏ vào index.css) */}
      <style>{`
        .hover-elevate { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-elevate:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}</style>
    </Card>
  );
}

export default ProductVerticalCard;