import request from "@/utils/request";

// 患者列表数据
export function apiPatientsList() {
  return request({
    url: "/api/patient/detail",
    method: "get",
  });
}

