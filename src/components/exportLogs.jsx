// src/components/exportLogs.jsx
export const exportLogsAsCSV = (logs) => {
  const headers = ["Hành động", "Người thực hiện", "Thời gian", "IP", "Cảnh báo"];
  const rows = logs.map(log =>
    [log.action, log.user, log.time, log.ip, log.level]
  );

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "logs.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportLogsAsJSON = (logs) => {
  const jsonContent = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "logs.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
