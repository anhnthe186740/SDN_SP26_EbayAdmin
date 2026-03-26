import React, { useEffect, useState } from "react";
import { dashboardService } from "../services/api";
import { Switch, Select, Input } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"; // Thử đổi sang @hello-pangea/dnd nếu muốn mất warning

const widgetOptions = [
  { key: "totalUsers", label: "Tổng user", icon: "bi-people-fill", color: "text-primary" },
  { key: "totalProducts", label: "Tổng sản phẩm", icon: "bi-box-seam-fill", color: "text-success" },
  { key: "totalOrders", label: "Tổng đơn hàng", icon: "bi-cart-check-fill", color: "text-warning" },
  { key: "monthlyRevenue", label: "Doanh thu tháng/quý", icon: "bi-currency-dollar", color: "text-danger" },
  { key: "newUsers", label: "Số user mới", icon: "bi-person-plus-fill", color: "text-info" }
];

const chartTypes = [
  { label: "📊 Biểu đồ Cột (Bar)", value: "bar" },
  { label: "📈 Biểu đồ Đường (Line)", value: "line" },
  { label: "🥧 Biểu đồ Tròn (Pie)", value: "pie" }
];
const timeOptions = [
  { label: "Theo Ngày", value: "day" },
  { label: "Theo Tháng", value: "month" },
  { label: "Theo Quý", value: "quarter" }
];

const DashboardConfig = () => {
  const [config, setConfig] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dashboardService.getConfig({ role: "admin" }).then((res) => {
      setConfig(res.data[0]);
    });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(config.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setConfig({ ...config, widgets: items });
  };

  const toggleWidget = (key) => {
    const newWidgets = config.widgets.map((w) =>
      w.type === key ? { ...w, enabled: !w.enabled } : w
    );
    setConfig({ ...config, widgets: newWidgets });
  };

  const addChart = () => {
    const newChart = {
      id: `chart${Date.now()}`,
      chartType: "bar",
      source: "",
      field: "",
      timeConfig: "month"
    };
    setConfig({ ...config, customCharts: [...config.customCharts, newChart] });
  };

  const saveConfig = () => {
    setIsSaving(true);
    dashboardService.updateConfig(config.id, config).then(() => {
      setTimeout(() => {
        alert("Cấu hình Dashboard đã được lưu thành công!");
        setIsSaving(false);
      }, 500);
    });
  };

  const resetDefault = () => {
    if(window.confirm("Bạn có chắc muốn khôi phục giao diện mặc định không?")) {
      dashboardService.getConfig({ role: "admin" }).then((res) => {
        setConfig(res.data[0]);
      });
    }
  };

  if (!config) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  );

  return (
    <div className="py-4">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Cấu hình Dashboard</h2>
          <p className="text-muted small mb-0">Tùy chỉnh các widget và biểu đồ hiển thị trên trang chủ quản trị.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light border fw-bold shadow-sm" onClick={resetDefault}>
            <i className="bi bi-arrow-counterclockwise me-2"></i>Mặc định
          </button>
          <button className="btn btn-primary fw-bold shadow-sm" onClick={saveConfig} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : <><i className="bi bi-floppy-fill me-2"></i>Lưu Cấu Hình</>}
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* CỘT TRÁI: KÉO THẢ WIDGETS */}
        <div className="col-lg-5">
          <div className="premium-card p-4 h-100">
            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="bi bi-grid-1x2-fill text-primary me-2"></i> Bố cục Widgets
            </h5>
            <p className="text-muted small mb-4">Kéo thả để thay đổi vị trí. Bật/Tắt để ẩn hiện widget.</p>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="d-flex flex-column gap-3">
                    {config.widgets.map((widget, index) => {
                      const widgetInfo = widgetOptions.find((w) => w.key === widget.type);
                      return (
                        <Draggable key={widget.type} draggableId={widget.type} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`widget-item d-flex align-items-center justify-content-between p-3 rounded-3 border bg-white ${snapshot.isDragging ? 'shadow-lg border-primary' : 'shadow-sm'}`}
                              style={{ ...provided.draggableProps.style, transition: snapshot.isDragging ? 'none' : 'all 0.2s' }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                {/* Tay cầm kéo thả */}
                                <div {...provided.dragHandleProps} className="drag-handle text-muted" style={{ cursor: 'grab' }}>
                                  <i className="bi bi-grip-vertical fs-5"></i>
                                </div>
                                <div className={`fs-4 ${widgetInfo?.color || 'text-secondary'}`}>
                                  <i className={`bi ${widgetInfo?.icon || 'bi-layers'}`}></i>
                                </div>
                                <span className={`fw-bold ${widget.enabled ? 'text-dark' : 'text-muted text-decoration-line-through'}`}>
                                  {widgetInfo?.label || widget.type}
                                </span>
                              </div>
                              <Switch checked={widget.enabled} onChange={() => toggleWidget(widget.type)} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* CỘT PHẢI: CUSTOM CHARTS */}
        <div className="col-lg-7">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-bar-chart-fill text-primary me-2"></i> Biểu đồ Tùy chỉnh
              </h5>
              <button className="btn btn-sm btn-outline-primary fw-bold rounded-pill" onClick={addChart}>
                <i className="bi bi-plus-lg me-1"></i> Thêm biểu đồ
              </button>
            </div>

            {config.customCharts.length === 0 ? (
              <div className="text-center text-muted py-5 my-3 bg-light rounded-4 border border-dashed">
                <i className="bi bi-graph-up text-secondary fs-1 mb-2"></i>
                <h6>Chưa có biểu đồ nào</h6>
                <p className="small mb-0">Bấm thêm biểu đồ để tự do phân tích dữ liệu.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {config.customCharts.map((chart, i) => (
                  <div key={chart.id} className="chart-config-card p-3 rounded-4 border bg-light shadow-sm position-relative animation-fade-in">
                    <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary fs-6 border border-white">
                      {i + 1}
                    </span>
                    <button 
                      className="btn btn-sm text-danger position-absolute top-0 end-0 m-2 border-0 bg-transparent"
                      onClick={() => {
                        if(window.confirm("Xóa biểu đồ này?")) {
                          const newCharts = config.customCharts.filter(c => c.id !== chart.id);
                          setConfig({ ...config, customCharts: newCharts });
                        }
                      }}
                    >
                      <i className="bi bi-trash-fill fs-5"></i>
                    </button>

                    <div className="row g-3 mt-1">
                      <div className="col-md-4">
                        <label className="small fw-bold text-muted mb-1 text-uppercase">Loại biểu đồ</label>
                        <Select
                          className="w-100" size="large"
                          value={chart.chartType}
                          onChange={(value) => {
                            const updated = [...config.customCharts];
                            updated[i].chartType = value;
                            setConfig({ ...config, customCharts: updated });
                          }}
                          options={chartTypes}
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="small fw-bold text-muted mb-1 text-uppercase">Nguồn Dữ Liệu</label>
                        <Input
                          size="large" placeholder="VD: orders, users..." value={chart.source}
                          onChange={(e) => {
                            const updated = [...config.customCharts];
                            updated[i].source = e.target.value;
                            setConfig({ ...config, customCharts: updated });
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="small fw-bold text-muted mb-1 text-uppercase">Thời gian</label>
                        <Select
                          className="w-100" size="large"
                          value={chart.timeConfig}
                          onChange={(value) => {
                            const updated = [...config.customCharts];
                            updated[i].timeConfig = value;
                            setConfig({ ...config, customCharts: updated });
                          }}
                          options={timeOptions}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .premium-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.02);
        }
        .drag-handle:hover { color: #0d6efd !important; }
        .widget-item:hover { border-color: #dee2e6 !important; background-color: #f8fafc !important; }
        .border-dashed { border-style: dashed !important; border-width: 2px !important; }
        .animation-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default DashboardConfig;