import request from "@/utils/request";

// 设备列表数据
export function apiDevicePage(data) {
  return request({
    url: "/monitor/device/page",
    method: "post",
    data,
  });
}

// 统计数据
export function apiDashboardCoreMetrics(params) {
  return request({
    url: "/analysis/dashboard/core-metrics",
    method: "get",
    params,
  });
}

// 预警级别分布
export function apiWarningLevelDistribution(params) {
  return request({
    url: "/analysis/dashboard/warning-level-distribution",
    method: "get",
    params,
  });
}

// 预警类型和病区top排行
export function apiWarningTypeWardTop(params) {
  return request({
    url: "/analysis/dashboard/warning-type-ward-top",
    method: "get",
    params,
  });
}

// 近7日预警类型趋势
export function apiWarningTrend7d() {
  return request({
    url: "/analysis/dashboard/warning-trend-7d",
    method: "get",
  });
}

// 待处理预警列表
export function apiPendingWarningsPage(data) {
  return request({
    url: "/analysis/dashboard/pending-warnings/page",
    method: "post",
    data,
  });
}

// 最新心电记录分页列表
export function apiLatestEcgPage(data) {
  return request({
    url: "/analysis/dashboard/latest-ecg/page",
    method: "post",
    data,
  });
}

// 待处理预警详情
export function apiWarningDetail(alertId) {
  return request({
    url: `/analysis/dashboard/warnings/${alertId}/detail`,
    method: "get",
  });
}

// 纳入接口
export function apiIncludeWarning(warningId) {
  return request({
    url: "/api/analysis/dashboard/warnings/include",
    method: "post",
    data: {
      warningId,
    },
  });
}
