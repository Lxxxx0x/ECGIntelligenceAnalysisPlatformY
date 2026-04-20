
import request from "@/utils/request";

// 诊断报告管理列表
export function apiDiagnosisReportsPage(data) {
  return request({
    url: "/analysis/diagnosis-report/page",
    method: "post",
    data
  });
}

// 诊断报告详情
export function apiDiagnosisReportDetail(reportId) {
  return request({
    url: `/analysis/diagnosis-report/${reportId}`,
    method: "get"
  });
}

// 诊断报告PDF下载
export function apiDiagnosisReportDownload(reportId) {
  return request({
    url: `/analysis/diagnosis-report/${reportId}/pdf`,
    method: "get",
    responseType: "blob" // 重要：告诉axios返回的是二进制数据
  });
}


// 诊断报告字典数据
export function apiDiagnosisReportsDicts() {
  return request({
    url: "/analysis/diagnosis-report/dicts",
    method: "get"
  });
}