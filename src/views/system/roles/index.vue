<script setup>
import { ref, reactive } from 'vue';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({ name: "SystemRoles" });

const queryParams = reactive({
  roleName: '',
  status: ''
});

const mockData = [
  { id: 1, roleName: '超级管理员', roleKey: 'admin', order: 1, status: '1', createTime: '2023-01-01 00:00:00', remark: '系统超级管理员' },
  { id: 2, roleName: '科室主任', roleKey: 'director', order: 2, status: '1', createTime: '2023-01-05 09:30:00', remark: '管理本科室患者与医生' },
  { id: 3, roleName: '心电医生', roleKey: 'doctor', order: 3, status: '1', createTime: '2023-01-06 14:20:00', remark: '进行心电图诊断、复核' },
  { id: 4, roleName: '护士', roleKey: 'nurse', order: 4, status: '1', createTime: '2023-02-10 11:15:00', remark: '日常监护、设备管理' },
];

const tableData = ref([...mockData]);
const dialogVisible = ref(false);
const dialogTitle = ref('');

const form = reactive({
  id: undefined,
  roleName: '',
  roleKey: '',
  order: 1,
  status: '1',
  remark: ''
});

const handleSearch = () => {
  let res = mockData;
  if (queryParams.roleName) res = res.filter(item => item.roleName.includes(queryParams.roleName));
  if (queryParams.status) res = res.filter(item => item.status === queryParams.status);
  tableData.value = res;
};

const handleReset = () => {
  queryParams.roleName = '';
  queryParams.status = '';
  handleSearch();
};

const handleAdd = () => {
  dialogTitle.value = '新增角色';
  Object.assign(form, { id: undefined, roleName: '', roleKey: '', order: 1, status: '1', remark: '' });
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑角色';
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除角色 "${row.roleName}" 吗？`, '警告', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const submitForm = () => {
  ElMessage.success(form.id ? '修改成功' : '新增成功');
  dialogVisible.value = false;
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
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" border stripe height="100%">
        <el-table-column prop="id" label="角色编号" width="100" align="center" />
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleKey" label="权限字符" width="150" />
        <el-table-column prop="order" label="显示顺序" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === '1' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)" :disabled="row.roleKey==='admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" required>
          <el-input v-model="form.roleKey" placeholder="例如: admin / doctor" />
        </el-form-item>
        <el-form-item label="角色顺序">
          <el-input-number v-model="form.order" :min="1" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            :data="treeData"
            show-checkbox
            node-key="id"
            style="width: 100%; border: 1px solid var(--el-border-color); border-radius: 4px; padding: 10px;"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
}
</style>