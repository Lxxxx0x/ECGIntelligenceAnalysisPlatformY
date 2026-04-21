import request from "@/utils/request";

// 实时监护顶部数据
export function apiMonitorStatistics() {
  return request({
    url: "/monitor/statistics",
    method: "get",
  });
}

// 监控大屏患者
export function apiMonitorPatients() {
  return request({
    url: "/monitor/patients",
    method: "get",
  });
}

// 科室分布统计接口
export function apiWardDistribution() {
  return request({
    url: "/monitor/ward-distribution",
    method: "get",
  });
}

// 监控大屏患者详情接口
export function apiMonitorPatientDetail(patientId) {
  return request({
    url: "/monitor/detail",
    method: "get",
    params: {
      patientId,
    },
  });
}

// 加入重点监护

export function apiAddKeyMonitor(data) {
  return request({
    url: "/monitor/opt/addKey",
    method: "post",
    data,
  });
}

// 解除重点监护
export function apiCancelKeyMonitor(patientId) {
  return request({
    url: "/monitor/opt/cancelKey",
    method: "post",
    data: {
      patientId,
    },
  });
}

// 重点监护列表
export function apiKeyMonitorList() {
  return request({
    url: "/monitor/key/list",
    method: "get",
  });
}
