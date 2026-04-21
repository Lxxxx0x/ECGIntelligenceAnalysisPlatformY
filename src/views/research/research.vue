<template>
    <div class="research-container">
        <div class="table-card">
            <!-- 搜索与筛选 -->
            <div class="filter-bar">
                <el-input v-model="searchForms.patientKeyword" placeholder="检索用户数据 (姓名/ID等)"
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
                <el-input v-model="searchForms.deptId" placeholder="病区ID" class="filter-item search-input-small"
                    clearable>
                </el-input>
                <el-date-picker v-model="searchForms.dateRange" type="datetimerange" range-separator="至"
                    start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss"
                    class="filter-item date-picker" clearable />

                <el-button type="primary" :icon="Search" class="query-btn" @click="handleQuery">查询</el-button>
                <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                <el-button type="success" :icon="Download" @click="handleExport"
                    :disabled="selectedRows.length === 0">导出选中记录
                    (自动脱敏)</el-button>
                <el-button type="warning" :icon="Download" @click="handleExportAll">导出全部记录</el-button>
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
                    <el-table-column label="性别" prop="genderText" width="80" align="center" />
                    <el-table-column label="年龄" prop="age" width="80" align="center" />
                    <el-table-column label="住院号" prop="inpatientNo" width="150" />
                    <el-table-column label="病历主要诊断 (EMR)" prop="mainEmrDiagnosis" min-width="250"
                        show-overflow-tooltip />
                    <el-table-column label="心电特征总结" prop="ecgFeatureSummary" min-width="250" show-overflow-tooltip />
                    <el-table-column label="收集时间" prop="collectionTime" width="180" />
                    <el-table-column label="病区" prop="deptName" width="150" />
                    <el-table-column label="数据状态" prop="isDataApprovedText" width="100" align="center" />
                    <el-table-column label="导出状态" prop="isExportedText" width="100" align="center" />
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
import { ref, onMounted } from 'vue';
import { Search, Refresh, Download, User, Document, DataLine } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiResearchDataPage, apiResearchDataExport, apiResearchDataExportAll } from '@/apis/research';


const searchForms = ref({
    patientKeyword: '',
    emrKeyword: '',
    ecgKeyword: '',
    deptId: '',
    dateRange: []
});

const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const selectedRows = ref([]);
const tableData = ref([]);

const downloadBlob = (blob, defaultFilename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

const handleReset = () => {
    searchForms.value = {
        patientKeyword: '',
        emrKeyword: '',
        ecgKeyword: '',
        deptId: '',
        dateRange: []
    };
    pageNum.value = 1;
    handleQuery();
};

const handleQuery = async () => {
    loading.value = true;
    try {
        const queryData = {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            patientKeyword: searchForms.value.patientKeyword,
            emrKeyword: searchForms.value.emrKeyword,
            ecgKeyword: searchForms.value.ecgKeyword,
            deptId: searchForms.value.deptId
        };
        if (searchForms.value.dateRange && searchForms.value.dateRange.length === 2) {
            queryData.startTime = searchForms.value.dateRange[0];
            queryData.endTime = searchForms.value.dateRange[1];
        }

        const res = await apiResearchDataPage(queryData);
        if (res.code === 0) {
            tableData.value = res.data.list;
            total.value = res.data.total;
        } else {
            ElMessage.error(res.message || '查询失败');
        }
    } catch (error) {
        console.log(error);

        ElMessage.error('网络或服务器异常');
    } finally {
        loading.value = false;
    }
};

const handleSelectionChange = (val) => {
    selectedRows.value = val;
};

const handleExport = () => {
    if (selectedRows.value.length === 0) return;
    ElMessageBox.confirm(
        `确定要导出已勾选的 ${selectedRows.value.length} 条科研记录吗？`,
        '科研数据导出确认',
        {
            confirmButtonText: '确定导出',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const researchIdList = selectedRows.value.map(row => row.researchId);
            const res = await apiResearchDataExport({ researchIdList });
            downloadBlob(res, `research-data-selected-${new Date().getTime()}.csv`);
            ElMessage.success('导出成功');
        } catch (error) {
            console.log(error);
            ElMessage.error('导出失败');
        }
    }).catch(() => { });
};

const handleExportAll = () => {
    ElMessageBox.confirm(
        `确定要导出全部科研数据吗？`,
        '全部科研数据导出确认',
        {
            confirmButtonText: '确定导出',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await apiResearchDataExportAll();
            downloadBlob(res, `research-data-all-${new Date().getTime()}.csv`);
            ElMessage.success('导出全部数据成功');
        } catch (error) {
            console.log(error);
            ElMessage.error('导出失败');
        }
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

onMounted(() => {
    handleQuery();
});
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
        width: 200px;
    }

    .search-input-small {
        width: 120px;
    }

    .date-picker {
        width: 360px;
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