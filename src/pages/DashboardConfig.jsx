import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Switch, Select, Card, Input, Space } from "antd";
import { BarChart, PieChart, LineChart } from "lucide-react"; // Tùy chọn icon
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const widgetOptions = [
  { key: "totalUsers", label: "Tổng user" },
  { key: "totalProducts", label: "Tổng sản phẩm" },
  { key: "totalOrders", label: "Tổng đơn hàng" },
  { key: "monthlyRevenue", label: "Doanh thu tháng/quý" },
  { key: "newUsers", label: "Số user mới" }
];

const chartTypes = ["bar", "line", "pie"];
const timeOptions = ["day", "month", "quarter"];

const DashboardConfig = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/dashboardConfigs?role=admin`).then((res) => {
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
    const url = process.env.REACT_APP_API_PATH;
    axios.put(`${url}/dashboardConfigs/${config.id}`, config).then(() => {
      alert("Cấu hình đã được lưu!");
    });
  };

  const resetDefault = () => {
    // Reload lại cấu hình mặc định từ server
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/dashboardConfigs?role=admin`).then((res) => {
      setConfig(res.data[0]);
    });
  };

  if (!config) return <div>Đang tải...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Cấu hình Dashboard</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="widgets">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {config.widgets.map((widget, index) => (
                <Draggable key={widget.type} draggableId={widget.type} index={index}>
                  {(provided) => (
                    <Card
                      className="mb-2 flex justify-between items-center"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span>{widgetOptions.find((w) => w.key === widget.type)?.label}</span>
                      <Switch checked={widget.enabled} onChange={() => toggleWidget(widget.type)} />
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button onClick={addChart} className="my-4">Thêm biểu đồ tuỳ chỉnh</Button>

      {config.customCharts.map((chart, i) => (
        <Card key={chart.id} className="mb-3">
          <h3 className="mb-3">Biểu đồ {i + 1}</h3>
          <Space direction="vertical">
            <Select
              value={chart.chartType}
              onChange={(value) => {
                const updatedCharts = [...config.customCharts];
                updatedCharts[i].chartType = value;
                setConfig({ ...config, customCharts: updatedCharts });
              }}
              options={chartTypes.map(type => ({ label: type, value: type }))}
            />
            <Input
              value={chart.source}
              onChange={(e) => {
                const updatedCharts = [...config.customCharts];
                updatedCharts[i].source = e.target.value;
                setConfig({ ...config, customCharts: updatedCharts });
              }}
              placeholder="Nhập nguồn dữ liệu"
            />
            <Select
              value={chart.timeConfig}
              onChange={(value) => {
                const updatedCharts = [...config.customCharts];
                updatedCharts[i].timeConfig = value;
                setConfig({ ...config, customCharts: updatedCharts });
              }}
              options={timeOptions.map(option => ({ label: option, value: option }))}
            />
          </Space>
        </Card>
      ))}

      <div className="mt-4">
        <Button type="primary" onClick={saveConfig}>Lưu Cấu Hình</Button>
        <Button onClick={resetDefault} className="ml-4">Đặt lại mặc định</Button>
      </div>
    </div>
  );
};

export default DashboardConfig;
