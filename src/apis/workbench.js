import request from "@/utils/request";

// 设备列表数据
export function apiDevicePage(data) {
  return request({
    url: "/monitor/device/page",
    method: "post",
    data,
  });
}
