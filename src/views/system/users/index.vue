<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiUserPage, apiUserDicts, apiUserAdd, apiUserEdit, apiUserDelete } from '@/apis/system/users';

defineOptions({ name: "SystemUsers" });

const queryParams = reactive({
  keyword: '',
  roleId: '',
  deptId: '',
  status: ''
});

const dicts = reactive({
  roleOptions: [],
  departmentOptions: [],
  statusOptions: []
});

const fetchDicts = async () => {
  try {
    const res = await apiUserDicts();
    const data = res.data || res;
    if (data) {
      dicts.roleOptions = data.roleOptions || [];
      dicts.departmentOptions = data.departmentOptions || [];
      dicts.statusOptions = data.statusOptions || [];
    }
  } catch (error) {
    console.error('获取字典失败', error);
  }
};

const tableData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: queryParams.keyword || undefined,
      roleId: queryParams.roleId ? Number(queryParams.roleId) : undefined,
      deptId: queryParams.deptId ? Number(queryParams.deptId) : undefined,
      status: queryParams.status || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    const res = await apiUserPage(params);
    const data = res.data || res;
    tableData.value = data.records || data.rows || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取用户列表失败', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchDicts();
  getList();
});

const form = reactive({
  userId: undefined,
  userName: '',
  realName: '',
  password: '',
  deptId: '',
  roleId: '',
  phone: '',
  status: 1
});

const formRef = ref(null);

const rules = {
  userName: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字、下划线', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

const handleSearch = () => {
  currentPage.value = 1;
  getList();
};

const handleReset = () => {
  queryParams.keyword = '';
  queryParams.roleId = '';
  queryParams.deptId = '';
  queryParams.status = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  getList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  getList();
};

const handleAdd = () => {
  dialogTitle.value = '新增用户';
  Object.assign(form, { userId: undefined, userName: '', realName: '', password: '', deptId: '', roleId: '', phone: '', status: 1 });
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑用户';
  Object.assign(form, {
    userId: row.userId,
    userName: row.userName,
    realName: row.realName,
    password: '',
    deptId: row.deptId,
    roleId: row.roleId,
    phone: row.phone,
    status: row.status
  });
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除用户 "${row.userName}" 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await apiUserDelete(row.userId);
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        console.error('删除失败', error);
      }
    })
    .catch(() => { });
};

const submitForm = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.userId) {
          await apiUserEdit(form);
          ElMessage.success('修改成功');
        } else {
          await apiUserAdd(form);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getList();
      } catch (error) {
        console.error('提交失败', error);
      }
    }
  });
};
</script>

<template>
  <div class="page-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="form-inline">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="账号或真实姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryParams.roleId" placeholder="全部角色" clearable style="width: 150px">
            <el-option v-for="item in dicts.roleOptions" :key="item.value" :label="item.label" :value="item.value === '' ? '' : Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="queryParams.deptId" placeholder="全部科室" clearable style="width: 150px">
            <el-option v-for="item in dicts.departmentOptions" :key="item.value" :label="item.label" :value="item.value === '' ? '' : Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option v-for="item in dicts.statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-table v-loading="loading" :data="tableData" border stripe height="100%">
        <el-table-column prop="userId" label="用户ID" width="80" align="center" />
        <el-table-column prop="userName" label="用户账号" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="deptName" label="所属科室" min-width="150" />
        <el-table-column prop="roleName" label="角色身份" min-width="150" />
        <el-table-column prop="phone" label="手机号码" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="170" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.statusText || (row.status === 1 ? '启用' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" min-width="160" align="center" />
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
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户账号登录名 (3-32位字符)" :disabled="!!form.userId" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.userId">
          <el-input v-model="form.password" type="password" placeholder="请输入密码 (不传默认123456)" />
        </el-form-item>
        <el-form-item label="归属科室" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择科室" style="width: 100%;">
            <el-option v-for="item in dicts.departmentOptions.filter(opt => opt.value !== '')" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色分配" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%;">
            <el-option v-for="item in dicts.roleOptions.filter(opt => opt.value !== '')" :key="item.value" :label="item.label" :value="Number(item.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="item in dicts.statusOptions.filter(opt => opt.value !== '')" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
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
