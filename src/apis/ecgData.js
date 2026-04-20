import request from "@/utils/request";

// 心电列表数据
export function apiEcgDataList(data) {
  return request({
    url: "/ecg-data/page",
    method: "post",
    data,
  });
}

// 心电详情数据
export function apiEcgDataDetail(ecgId) {
  return request({
    url: `/ecg-data/${ecgId}`,
    method: "get",
  });
}