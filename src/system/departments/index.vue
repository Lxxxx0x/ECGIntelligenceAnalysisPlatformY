<script setup>
import { ref, reactive } from 'vue';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({ name: "SystemDepartments" });

const queryParams = reactive({
  deptName: '',
  status: ''
});

const mockData = [
  { id: 1, deptName: '心内科', code: 'DEPT_CARDIO', head: '张主任', phone: '13812345678', status: '1', createTime: '2023-01-10 10:00:00', order: 1 },
  { id: 2, deptName: '急诊科', code: 'DEPT_EMERG', head: '李主任', phone: '13987654321', status: '1', createTime: '2023-01-12 14:30:00', order: 2 },
  { id: 3, deptName: '呼吸科', code: 'DEPT_RESP', head: '王主任', phone: '13766665555', status: '1', createTime: '2023-02-05 09:15:00', order: 3 },
  { id: 4, deptName: '重症监护室(ICU)', code: 'DEPT_ICU', head: '赵主任', phone: '13688889999', status: '0', createTime: '2023-03-20 16:45:00', order: 4 },
];

const tableData = ref([...mockData]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);

const form = reactive({
  id: undefined,
  deptName: '',
  code: '',
  head: '',
  phone: '',
  order: 1,
  status: '1'
});

const handleSearch = () => {
  let res = mockData;
  if (queryParams.deptName) {
    res = res.filter(item => item.deptName.includes(queryParams.deptName));
  }
  if (queryParams.status) {
    res = res.filter(item => item.status === queryParams.status);
  }
  tableData.value = res;
};

const handleReset = () => {
  queryParams.deptName = '';
  queryParams.status = '';
  handleSearch();
};

const handleAdd = () => {
  dialogTitle.value = '新增科室';
  Object.assign(form, { id: undefined, deptName: '', code: '', head: '', phone: '', order: 1, status: '1' });
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑科室';
  Object.assign(form, row);
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除科室 "${row.deptName}" 吗？`, '警告', { type: 'warning' }).then(() => {
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const submitForm = () => {
  ElMessage.success(form.id ? '修改成功' : '新增成功');
  dialogVisible.value = false;
};
</script>

<template>
  <div class="page-container">
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="form-inline">
        <el-form-item label="科室名称">
          <el-input v-model="queryParams.deptName" placeholder="请输入科室名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="科室状态">
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增科室</el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" border stripe height="100%" row-key="id">
        <el-table-column prop="order" label="排序" width="80" align="center" />
        <el-table-column prop="deptName" label="科室名称" min-width="150" />
        <el-table-column prop="code" label="科室编码" min-width="120" />
        <el-table-column prop="head" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'">
              {{ row.status === '1' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="科室名称" required>
          <el-input v-model="form.deptName" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="科室编码">
          <el-input v-model="form.code" placeholder="请输入科室编码" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.head" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="显示排序">
          <el-input-number v-model="form.order" :min="1" />
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
}
</style>