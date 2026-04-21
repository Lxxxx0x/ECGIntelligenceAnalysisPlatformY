import request from "@/utils/request";

// 科室管理
export function apiDepartmentPage(data) {
  return request({
    url: "/system/department/page",
    method: "post",
    data,
  });
}

// 新增科室
export function apiDepartmentAdd(data) {
  return request({
    url: "/system/department",
    method: "post",
    data,
  });
}

//编辑科室
export function apiDepartmentEdit(data) {
  return request({
    url: "/system/department",
    method: "put",
    data,
  });
}

// 删除科室
export function apiDepartmentDelete(deptId, force = false) {
  return request({
    url: "/system/department",
    method: "delete",
    params: { deptId, force },
  });
}

// 科室详情
export function apiDepartmentDetail(deptId) {
  return request({
    url: `/system/department/detail`,
    method: "get",
    params: { deptId },
  });
}

// 科室树
export function apiDepartmentTree(deptId) {
  return request({
    url: `/system/department/tree`,
    method: "get",
    params: { deptId },
  });
}
