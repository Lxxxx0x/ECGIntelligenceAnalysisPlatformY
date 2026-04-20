import request from "@/utils/request";

// 设备列表数据
export function apiDevicePage(data) {
  return request({
    url: "/monitor/device/page",
    method: "post",
    data,
  });
}

// 设备查询字典
export function apiDeviceDicts() {
  return request({
    url: "/monitor/device/dicts",
    method: "get",
  });
}

// 新增设备
export function apiDeviceAdd(data) {
  return request({
    url: "/monitor/device",
    method: "post",
    data,
  });
}

// 删除设备
export function apiDeviceDelete(deviceId) {
  return request({
    url: '/monitor/device',
    method: "delete",
    params: { deviceId }
  });
}

// 设备详情
export function apiDeviceDetail(deviceId) {
  return request({
    url: `/monitor/device/detail`,
    method: "get",
    params: { deviceId }
  });
}
