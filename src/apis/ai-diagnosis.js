import request from "@/utils/request";

// 设备列表数据
export function apiAiDiagnosisOverview() {
  return request({
    url: "/analysis/ai-diagnosis/overview",
    method: "get",
  });
}

// ai诊断记录列表
export function apiAiDiagnosisPage(data) {
  return request({
    url: "/analysis/ai-diagnosis/page",
    method: "post",
    data,
  });
}

// 审核提交
export function apiAiDiagnosisAudit(data) {
  return request({
    url: "/analysis/ai-diagnosis/audit",
    method: "post",
    data,
  });
}

// ai诊断记录详情
export function apiAiDiagnosisDetail(diagnosisId) {
  return request({
    url: `/analysis/ai-diagnosis/${diagnosisId}`,
    method: "get",
  });
}

// ai引擎运行状态
export function apiAiDiagnosisEngineStatus() {
  return request({
    url: "/analysis/ai-diagnosis/dashboard/engine-status",
    method: "get",
  });
}

// 分析趋势
export function apiAiDiagnosisWarningTrend() {
  return request({
    url: "/analysis/ai-diagnosis/dashboard/warning-trend",
    method: "get",
  });
}

// 饼图
export function apiAiDiagnosisAbnormalTypeRatio() {
  return request({
    url: "/analysis/ai-diagnosis/dashboard/abnormal-type-ratio",
    method: "get",
  });
}
