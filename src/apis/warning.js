
import request from "@/utils/request";

// 预警列表
export function apiWarningPageList(data) {
  return request({
    url: "/warning/page",
    method: "post",
    data
  });
}

// 预警详情
export function apiWarningDetail(alertId) {
  return request({
    url: `/warning/detail`,
    method: "get",
    params: { alertId }
  });
}

// 预警全局统计
export function apiWarningStatistics() {
  return request({
    url: "/warning/statistics",
    method: "get"
  });
}

// 预警处理按钮
export function apiWarningHandle(alertId, handleRemark) {
  return request({
    url: "/warning/handle",
    method: "post",
    data: { alertId, handleRemark }
  });
}
