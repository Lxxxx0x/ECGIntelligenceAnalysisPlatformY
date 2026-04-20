import request from "@/utils/request";

// 用户管理
export function apiUserPage(data) {
  return request({
    url: "/system/user/page",
    method: "post",
    data,
  });
}

// 筛选字典接口
export function apiUserDicts() {
  return request({
    url: "/system/user/dicts",
    method: "get",
  });
}

// 新增用户
export function apiUserAdd(data) {
  return request({
    url: "/system/user",
    method: "post",
    data,
  });
}

// 编辑用户
export function apiUserEdit(data) {
  return request({
    url: "/system/user",
    method: "put",
    data,
  });
}

// 删除用户
export function apiUserDelete(userId) {
  return request({
    url: "/system/user",
    method: "delete",
    params: { userId },
  });
}
