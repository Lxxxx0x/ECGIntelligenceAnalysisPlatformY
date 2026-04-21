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
