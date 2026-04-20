import request from "@/utils/request";

// 患者查询字典数据
export function apigetSearchDicts() {
  return request({
    url: "/patient/dicts",
    method: "get",
  });
}

export function apiSearchDicts(data) {
  return request({
    url: "/patient/page", // 修改为实际的查询接口路径
    method: "post",
    data,
  });
}

// 心电数据查询字典
export function apiEcgDataDicts() {
  return request({
    url: "/ecg-data/dicts",
    method: "get",
  });
}