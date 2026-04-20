import request from "@/utils/request";

// 患者统计数据
export function apiPatientsList() {
  return request({
    url: "/patient/statistics",
    method: "get",
  });
}

// 患者列表数据
export function apiPatientsPage(data) {
  return request({
    url: "/patient/page",
    method: "post",
    data,
  });
}

// 患者详情数据
export function apiPatientsDetail(patientId) {
  return request({
    url: "/patient/detail",
    method: "get",
    params: { patientId }
  });
}

