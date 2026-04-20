
import request from "@/utils/request";

// 诊断报告管理列表
export function apiDiagnosisReportsPage(params) {
  return request({
    url: "/analysis/diagnosis-report/page",
    method: "get",
    params
  });
}