<script setup>
import { ref, reactive } from 'vue';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({ name: "SystemUsers" });

const queryParams = reactive({
  userName: '',
  phone: '',
  status: ''
});

const mockData = [
  { id: 101, userName: 'admin', realName: '超级管理', dept: '信息科', role: '超级管理员', phone: '13800000000', status: '1', createTime: '2023-01-01 10:00:00' },
  { id: 102, userName: 'zhangzhuren', realName: '张主任', dept: '心内科', role: '科室主任', phone: '13812345678', status: '1', createTime: '2023-01-15 08:30:00' },
  { id: 103, userName: 'liydoctor', realName: '李医生', dept: '心内科', role: '心电医生', phone: '13987654321', status: '1', createTime: '2023-02-20 09:12:00' },
  { id: 104, userName: 'wangnurse', realName: '王护士', dept: '重症监护室(ICU)', role: '护士', phone: '13766665555', status: '1', createTime: '2023-03-05 14:00:00' },
  { id: 105, userName: 'zhaofei', realName: '赵飞', dept: '急诊科', role: '心电医生', phone: '13688889999', status: '0', createTime: '2023-04-10 16:45:00' },
];

const tableData = ref([...mockData]);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const form = reactive({
  id: undefined,
  userName: '',
  realName: '',
  dept: '',
  role: '',
  phone: '',
  status: '1'
});

const handleSearch = () => {
  let res = mockData;
  if (queryParams.userName) res = res.filter(item => item.userName.includes(queryParams.userName) || item.realName.includes(queryParams.userName));
  if (queryParams.phone) res = res.filter(item => item.phone.includes(queryParams.phone));
  if (queryParams.status) res = res.filter(item => item.status === queryParams.status);
  tableData.value = res;
};

const handleReset = () => {
  queryParams.userName = '';
  queryParams.phone = '';
  queryParams.status = '';
  handleSearch();
};

const handleAdd = () => {
  dialogTitle.value = '新增用户';
  Object.assign(form, { id: undefined, userName: '', realName: '', dept: '', role: '', phone: '', status: '1' });
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户';
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除用户 "${row.userName}" 吗？`, '警告', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const submitForm = () => {
  ElMessage.success(form.id ? '修改成功' : '新增成功');
  dialogVisible.value = false;
};

// 分页模拟
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(mockData.length);
</script>

<template>
  <div class="page-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="form-inline">
        <el-form-item label="用户账号">
          <el-input v-model="queryParams.userName" placeholder="账号或真实姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号码" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-btn">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" border stripe height="100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="userName" label="用户账号" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="dept" label="所属科室" width="150" />
        <el-table-column prop="role" label="角色身份" width="150" />
        <el-table-column prop="phone" label="手机号码" width="130" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="1"
              inactive-value="0"
              @change="ElMessage.success('状态修改成功')"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)" :disabled="row.userName==='admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户账号" required>
          <el-input v-model="form.userName" placeholder="请输入用户账号登录名" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="真实姓名" required>
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="归属科室">
          <el-select v-model="form.dept" placeholder="请选择科室" style="width: 100%;">
            <el-option label="心内科" value="心内科" />
            <el-option label="急诊科" value="急诊科" />
            <el-option label="呼吸科" value="呼吸科" />
            <el-option label="重症监护室(ICU)" value="重症监护室(ICU)" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色分配">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="科室主任" value="科室主任" />
            <el-option label="心电医生" value="心电医生" />
            <el-option label="护士" value="护士" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .search-wrapper {
    margin-bottom: 16px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .el-form-item { margin-bottom: 0; }
  }

  .table-wrapper {
    flex: 1;
    overflow: hidden;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
