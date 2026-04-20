<template>
    <div class="research-container">
        <div class="table-card">
            <!-- 搜索与筛选 -->
            <div class="filter-bar">
                <el-input v-model="searchForms.userKeyword" placeholder="检索用户数据 (姓名/ID等)"
                    class="filter-item search-input" clearable>
                    <template #prefix><el-icon>
                            <User />
                        </el-icon></template>
                </el-input>
                <el-input v-model="searchForms.emrKeyword" placeholder="检索电子病历关键数据" class="filter-item search-input"
                    clearable>
                    <template #prefix><el-icon>
                            <Document />
                        </el-icon></template>
                </el-input>
                <el-input v-model="searchForms.ecgKeyword" placeholder="检索心电特征及关键数据" class="filter-item search-input"
                    clearable>
                    <template #prefix><el-icon>
                            <DataLine />
                        </el-icon></template>
                </el-input>

                <el-button type="primary" :icon="Search" class="query-btn" @click="handleQuery">查询</el-button>
                <el-button type="success" :icon="Download" @click="handleExport"
                    :disabled="selectedRows.length === 0">导出选中记录
                    (自动脱敏)</el-button>
            </div>

            <div class="alert-info">
                <el-alert title="导出说明：选中的临床科研数据将在服务端执行实时脱敏（隐藏患者真实姓名、联系方式及证件号码），以符合科研伦理规范。" type="info" show-icon
                    :closable="false" />
            </div>

            <!-- 表格 -->
            <div class="table-content mt-3">
                <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%"
                    @selection-change="handleSelectionChange"
                    :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }">
                    <el-table-column type="selection" width="55" align="center" />
                    <el-table-column label="患者姓名" prop="patientName" width="120" />
                    <el-table-column label="性别" prop="gender" width="80" align="center" />
                    <el-table-column label="年龄" prop="age" width="80" align="center" />
                    <el-table-column label="患者ID/住院号" prop="patientId" width="150" />
                    <el-table-column label="病历主要诊断 (EMR)" prop="emrSummary" min-width="250" show-overflow-tooltip />
                    <el-table-column label="心电特征总结" prop="ecgSummary" min-width="250" show-overflow-tooltip />
                    <el-table-column label="时间" prop="lastVisitTime" width="180" />
                    <el-table-column label="病区/科室" prop="ward" width="150" />
                </el-table>
            </div>

            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search, Download, User, Document, DataLine } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchForms = ref({
    userKeyword: '',
    emrKeyword: '',
    ecgKeyword: ''
});

const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(120);

const selectedRows = ref([]);

// 前端模拟数据展示
const tableData = ref([
    { id: 1, patientName: '张三', gender: '男', age: 45, patientId: 'IP20261101', lastVisitTime: '2026-04-10 09:30:00', emrSummary: '高血压3级，伴并发症; 冠心病', ecgSummary: 'ST段压低，T波倒置，窦性心律', ward: '心血管内 科一区' },
    { id: 2, patientName: '李四', gender: '女', age: 62, patientId: 'IP20261122', lastVisitTime: '2026-04-09 14:20:00', emrSummary: '二型糖尿病，心律失常', ecgSummary: '频发室性早搏，完全性右束支传导阻滞', ward: '老年病科' },
    { id: 3, patientName: '王明', gender: '男', age: 38, patientId: 'IP20261135', lastVisitTime: '2026-04-12 11:15:00', emrSummary: '急性心肌梗死恢复期', ecgSummary: '前壁心肌梗死演变期，Q波异常', ward: '冠心病监护病区' },
    { id: 4, patientName: '赵六', gender: '女', age: 71, patientId: 'IP20261150', lastVisitTime: '2026-04-11 16:05:00', emrSummary: '慢性心力衰竭，持续性房颤', ecgSummary: '心房颤动，伴心室率过快', ward: '心血管内 科二区' },
    { id: 5, patientName: '钱七', gender: '男', age: 55, patientId: 'IP20261188', lastVisitTime: '2026-04-10 08:00:00', emrSummary: '高脂血症', ecgSummary: '窦性心动过缓', ward: '心电康复病区' }
]);

const handleQuery = () => {
    loading.value = true;
    setTimeout(() => {
        // 模拟接口请求延时
        ElMessage.success('科研数据检索成功 (模拟)');
        loading.value = false;
    }, 400);
};

const handleSelectionChange = (val) => {
    selectedRows.value = val;
};

const handleExport = () => {
    if (selectedRows.value.length === 0) return;
    ElMessageBox.confirm(
        `确定要导出已勾选的 ${selectedRows.value.length} 条科研记录吗？下载的数据将自动按照系统规则进行敏感隔离与脱敏处理。`,
        '科研数据导出确认',
        {
            confirmButtonText: '确定导出脱敏数据',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        ElMessage({
            type: 'success',
            message: '导出指派成功，正在为您生成脱敏数据文件...',
        });
    }).catch(() => { });
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    handleQuery();
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    handleQuery();
};
</script>

<style lang="scss" scoped>
.research-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.table-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex: 1;
    display: flex;
    flex-direction: column;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 12px;

    .search-input {
        width: 250px;
    }

    .query-btn {
        margin-left: auto;
    }
}

.alert-info {
    margin-bottom: 12px;
}

.mt-3 {
    margin-top: 12px;
}

.table-content {
    flex: 1;
    overflow: hidden;
    margin-bottom: 20px;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
}
</style>