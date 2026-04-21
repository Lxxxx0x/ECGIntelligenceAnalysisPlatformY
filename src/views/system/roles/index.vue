<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiRolePage, apiRoleAdd, apiRoleEdit, apiRoleDelete } from '@/apis/system/roles';

defineOptions({ name: "SystemRoles" });

const queryParams = reactive({
  keyword: ''
});

const tableData = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: queryParams.keyword || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    const res = await apiRolePage(params);
    const data = res.data || res;
    tableData.value = data.records || data.rows || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取角色列表失败', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getList();
});

const dialogVisible = ref(false);
const dialogTitle = ref('');

const form = reactive({
  roleId: undefined,
  roleName: '',
  description: '',
  status: 1
});

const formRef = ref(null);

const rules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 256, message: '长度最多 256 个字符', trigger: 'blur' }
  ]
};

const handleSearch = () => {
  currentPage.value = 1;
  getList();
};

const handleReset = () => {
  queryParams.keyword = '';
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
  dialogTitle.value = '新增角色';
  Object.assign(form, { roleId: undefined, roleName: '', description: '', status: 1 });
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色';
  Object.assign(form, {
    roleId: row.roleId,
    roleName: row.roleName,
    description: row.description,
    status: row.status
  });
  if (formRef.value) formRef.value.clearValidate();
  dialogVisible.value = true;
};

const executeDelete = async (roleId, force = false) => {
  await apiRoleDelete(roleId, force);
  ElMessage.success('删除成功');
  getList();
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除角色 "${row.roleName}" 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await executeDelete(row.roleId);
      } catch (error) {
        if (error.message && error.message.includes('关联')) {
          ElMessageBox.confirm(`该角色已关联用户，是否强制删除？`, '强制删除确认', { type: 'error' })
            .then(() => executeDelete(row.roleId, true))
            .catch(() => { });
        } else {
          console.error('删除失败', error);
        }
      }
    })
    .catch(() => { });
};

const submitForm = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.roleId) {
          await apiRoleEdit(form);
          ElMessage.success('修改成功');
        } else {
          await apiRoleAdd(form);
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

// 权限树模拟 (简易展示)
const treeData = [
  { id: 1, label: '工作台', children: [{ id: 11, label: '数据分析' }] },
  { id: 2, label: '患者管理', children: [{ id: 21, label: '在管患者' }, { id: 22, label: '出组患者' }] },
  { id: 3, label: '心电管理', children: [{ id: 31, label: '异常指标预警' }, { id: 32, label: '测量管理' }] },
  { id: 4, label: '系统管理', children: [{ id: 41, label: '用户管理' }, { id: 42, label: '权限角色' }] },
];
</script>

<template>
  <div class="page-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="form-inline">
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.keyword" placeholder="请输入角色名称关键词" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-btn">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" v-loading="loading" border stripe height="100%">
        <el-table-column prop="roleId" label="角色编号" width="100" align="center" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="userCount" label="关联用户数" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.statusText || (row.status === 1 ? '启用' : '停用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)"
              :disabled="row.roleName === '超级管理员'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称 (1-32字符)" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="例如: 负责心电解读、报告编写 (最多256字符)" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree :data="treeData" show-checkbox node-key="id"
            style="width: 100%; border: 1px solid var(--el-border-color); border-radius: 4px; padding: 10px;" />
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

    .el-form-item {
      margin-bottom: 0;
    }
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