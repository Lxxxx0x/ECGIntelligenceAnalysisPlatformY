<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh, Plus, Edit, Delete, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  apiDepartmentPage,
  apiDepartmentAdd,
  apiDepartmentEdit,
  apiDepartmentDelete,
  apiDepartmentDetail,
  apiDepartmentTree
} from '@/apis/system/department';

defineOptions({ name: "SystemDepartments" });

const queryParams = reactive({
  keyword: '',
  parentDeptId: '',
  status: ''
});

const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableData = ref([]);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);

const form = reactive({
  deptId: undefined,
  deptName: '',
  parentDeptId: '',
  deptLevel: 2,
  deptDirector: '',
  contactPhone: '',
  location: '',
  status: 1
});

const rules = reactive({
  deptName: [
    { required: true, message: '请输入科室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  deptLevel: [
    { required: true, message: '请输入科室层级', trigger: 'blur' }
  ],
  contactPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入对应的11位手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await apiDepartmentPage({
      ...queryParams,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    tableData.value = res.data?.records || res.records || [];
    total.value = res.data?.total || res.total || 0;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const deptTreeData = ref([]);
const getDeptTree = async () => {
  try {
    const res = await apiDepartmentTree();
    deptTreeData.value = res.data || [];
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getList();
  getDeptTree();
});

const handleSearch = () => {
  pageNum.value = 1;
  getList();
};

const handleReset = () => {
  queryParams.keyword = '';
  queryParams.parentDeptId = '';
  queryParams.status = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  getList();
};

const handleCurrentChange = (val) => {
  pageNum.value = val;
  getList();
};

const handleAdd = () => {
  dialogTitle.value = '新增科室';
  Object.assign(form, { deptId: undefined, deptName: '', parentDeptId: '', deptLevel: 2, deptDirector: '', contactPhone: '', location: '', status: 1 });
  dialogVisible.value = true;
  if (formRef.value) formRef.value.clearValidate();
};

const handleEdit = async (row) => {
  dialogTitle.value = '编辑科室';
  try {
    const res = await apiDepartmentDetail(row.deptId);
    const data = res.data.records || res || {};
    Object.assign(form, {
      deptId: data.deptId,
      deptName: data.deptName,
      parentDeptId: data.parentDeptId || '',
      deptLevel: data.deptLevel,
      deptDirector: data.deptDirector || '',
      contactPhone: data.contactPhone || '',
      location: data.location || '',
      status: data.status
    });
    dialogVisible.value = true;
    if (formRef.value) formRef.value.clearValidate();
  } catch (error) {
    console.log(error);
    ElMessage.error('获取详情失败');
  }
};

const detailVisible = ref(false);
const detailData = ref({});
const detailLoading = ref(false);
const handleView = async (row) => {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    const res = await apiDepartmentDetail(row.deptId);
    detailData.value = res.data || res || {};
  } catch (error) {
    console.log(error);
    ElMessage.error('获取详情失败');
  } finally {
    detailLoading.value = false;
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除科室 "${row.deptName}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    try {
      await apiDepartmentDelete(row.deptId, false);
      ElMessage.success('删除成功');
      getList();
      getDeptTree();
    } catch (error) {
      if (error && error.data && error.data.code === 400 && error.data.message && error.data.message.includes('绑定')) {
        ElMessageBox.confirm(`${error.data.message}，是否强制删除？`, '确认', { type: 'warning' }).then(async () => {
          await apiDepartmentDelete(row.deptId, true);
          ElMessage.success('强制删除成功');
          getList();
          getDeptTree();
        }).catch(() => { });
      } else {
        ElMessage.error('删除失败');
      }
    }
  }).catch(() => { });
};

const submitLoading = ref(false);
const submitForm = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const params = {
          deptName: form.deptName,
          parentDeptId: form.parentDeptId ? Number(form.parentDeptId) : null,
          deptLevel: form.deptLevel,
          deptDirector: form.deptDirector,
          contactPhone: form.contactPhone,
          location: form.location,
          status: form.status
        };

        if (form.deptId) {
          await apiDepartmentEdit({ deptId: form.deptId, ...params });
          ElMessage.success('修改成功');
        } else {
          await apiDepartmentAdd(params);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        getList();
        getDeptTree();
      } catch (error) {
        console.log(error);

        ElMessage.error(form.deptId ? '修改失败' : '新增失败');
      } finally {
        submitLoading.value = false;
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
          <el-input v-model="queryParams.keyword" placeholder="请输入科室名称关键词" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
      <el-table v-loading="loading" :data="tableData" border stripe height="100%" row-key="deptId">
        <el-table-column prop="deptId" label="科室ID" width="80" align="center" />
        <el-table-column prop="deptName" label="科室名称" min-width="150" />
        <el-table-column prop="parentDeptName" label="上级科室" min-width="150" />
        <el-table-column prop="deptLevelText" label="层级" width="100" align="center" />
        <el-table-column prop="deptDirector" label="负责人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        background layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="科室名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="上级科室" prop="parentDeptId">
          <el-tree-select v-model="form.parentDeptId" :data="deptTreeData"
            :props="{ label: 'deptName', value: 'deptId', children: 'children' }" placeholder="请选择上级科室" check-strictly
            clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="科室层级" prop="deptLevel">
          <el-input-number v-model="form.deptLevel" :min="1" />
        </el-form-item>
        <el-form-item label="负责人" prop="deptDirector">
          <el-input v-model="form.deptDirector" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入科室位置" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="科室详情" width="600px">
      <el-descriptions :column="2" border v-loading="detailLoading">
        <el-descriptions-item label="科室名称">{{ detailData.deptName }}</el-descriptions-item>
        <el-descriptions-item label="科室代码">{{ detailData.deptId }}</el-descriptions-item>
        <el-descriptions-item label="上级科室">{{ detailData.parentDeptName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="科室层级">{{ detailData.deptLevelText || detailData.deptLevel }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detailData.deptDirector || '无' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '无' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'info'">
            {{ detailData.statusText || (detailData.status === 1 ? '启用' : '禁用') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="位置">{{ detailData.location || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
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
}
</style>