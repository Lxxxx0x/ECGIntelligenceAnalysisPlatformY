import request from "@/utils/request";

// 质控管理
export function apiQualityControlPage(data) {
  return request({
    url: "/monitor/quality-control/page",
    method: "post",
    data,
  });
}

// 质控管理查询字典
export function apiQualityControlDicts() {
  return request({
    url: "/monitor/quality-control/dicts",
    method: "get",
  });
}

// 新增质控
export function apiQualityControlAdd(data) {
  return request({
    url: "/monitor/quality-control",
    method: "post",
    data,
  });
}

// 编辑质控
export function apiQualityControlEdit(data) {
  return request({
    url: "/monitor/quality-control",
    method: "put",
    data,
  });
}

// 删除质控
export function apiQualityControlDelete(qcId) {
  return request({
    url: "/monitor/quality-control",
    method: "delete",
    params: { qcId },
  });
}

// 质控详情
export function apiQualityControlDetail(qcId) {
  return request({
    url: `/monitor/quality-control/detail`,
    method: "get",
    params: { qcId },
  });
}

// 质控设备列表
export function apiQualityControlDeviceDicts() {
  return request({
    url: "/monitor/device/dicts",
    method: "get",
  });
}
