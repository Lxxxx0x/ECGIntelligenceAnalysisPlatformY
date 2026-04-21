import request from "@/utils/request";

// 科研数据列表
export function apiResearchDataPage(data) {
  return request({
    url: "/analysis/research-data/page",
    method: "get",
    params: data,
  });
}

// 科研数据脱敏导出
export function apiResearchDataExport(data) {
  return request({
    url: "/analysis/research-data/export/selected",
    method: "post",
    data,
    responseType: "blob", // 设置响应类型为 blob 以处理文件下载
  });
}

// 科研数据脱敏导出（全部）
export function apiResearchDataExportAll() {
  return request({
    url: "/analysis/research-data/export/all",
    method: "post",
    responseType: "blob", // 设置响应类型为 blob 以处理文件下载
  });
}
