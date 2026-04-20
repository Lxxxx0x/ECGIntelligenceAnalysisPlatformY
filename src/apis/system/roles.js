import request from "@/utils/request";

// 角色列表
export function apiRolePage(data) {
  return request({
    url: "/system/role/page",
    method: "post",
    data,
  });
}

// 新增角色
export function apiRoleAdd(data) {
  return request({
    url: "/system/role",
    method: "post",
    data,
  });
}

// 编辑角色
export function apiRoleEdit(data) {
  return request({
    url: "/system/role",
    method: "put",
    data,
  });
}

// 删除角色
export function apiRoleDelete(roleId, force = false) {
  return request({
    url: "/system/role",
    method: "delete",
    params: { roleId, force },
  });
}
