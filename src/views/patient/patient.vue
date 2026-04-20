<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { apiPatientsList, apiPatientsDetail } from '@/apis/patients'
import { apigetSearchDicts, apiSearchDicts } from '@/apis/search'

const searchQuery = ref('')
const selectedWard = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')

// Dropdown options
const wardOptions = ref([])
const levelOptions = ref([])
const statusOptions = ref([])

const getSearchOptions = async () => {
    try {
        const res = await apigetSearchDicts()
        if (res.code === 0 && res.data) {
            wardOptions.value = res.data.wardOptions || []
            levelOptions.value = res.data.riskLevelOptions || []
            statusOptions.value = res.data.patientStatusOptions || []
        }
    } catch (error) {
        console.error('Failed to fetch search dicts:', error)
    }
}

const stats = ref({
    total: 0,
    inpatient: 0,
    home: 0,
    highRisk: 0
})

const getPatientsStats = async () => {
    try {
        const res = await apiPatientsList()
        if (res.code === 0 && res.data) {
            stats.value = {
                total: res.data.totalPatient || 0,
                inpatient: res.data.inHospital || 0,
                home: res.data.homeFollow || 0,
                highRisk: res.data.highRisk || 0
            }
        }
    } catch (error) {
        console.error('Failed to fetch patient stats:', error)
    }
}

onMounted(() => {
    getSearchOptions()
    getPatientsStats()
    getPatientsList()
})

// Table Data (Mocked initially, now fetched from API)
const tableData = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getPatientsList = async () => {
    loading.value = true
    try {
        const res = await apiSearchDicts({
            keyword: searchQuery.value,
            ward: selectedWard.value,
            riskLevel: selectedLevel.value,
            patientStatus: selectedStatus.value,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        })
        if (res.code === 0 && res.data) {
            tableData.value = res.data.records || res.data.list || []
            total.value = res.data.total || 0
        }
    } catch (error) {
        console.error('Failed to fetch patient list:', error)
    } finally {
        loading.value = false
    }
}

const handleQuery = () => {
    pageNum.value = 1
    getPatientsList()
}

const handleSizeChange = (val) => {
    pageSize.value = val
    pageNum.value = 1
    getPatientsList()
}

const handleCurrentChange = (val) => {
    pageNum.value = val
    getPatientsList()
}

// Detail Dialog
const dialogVisible = ref(false)
const detailLoading = ref(false)
const patientDetail = ref({})

const handleDetail = async (row) => {
    dialogVisible.value = true
    detailLoading.value = true
    try {
        const res = await apiPatientsDetail(row.patientId)
        if (res.code === 0 && res.data) {
            patientDetail.value = res.data.basicInfo || res.data
        }
    } catch (error) {
        console.error('Failed to fetch patient detail:', error)
    } finally {
        detailLoading.value = false
    }
}

const getRiskLevelClass = (level) => {
    if (!level) return ''
    if (level.includes('高危') || level === '4') return 'risk-high'
    if (level.includes('中高危') || level === '3') return 'risk-mid-high'
    if (level.includes('中危') || level === '2') return 'risk-mid'
    return ''
}

const getStatusClass = (status) => {
    if (!status) return ''
    if (status.includes('住院')) return 'status-inpatient'
    if (status.includes('居家')) return 'status-home'
    return ''
}
</script>

<template>
    <div class="patient-container">
        <el-card shadow="never" class="main-card">
            <div class="filter-bar">
                <div class="filter-group">
                    <!-- Input with appended button inside -->
                    <el-input v-model="searchQuery" placeholder="搜索患者姓名/住院号" class="search-input" clearable>
                        <template #append>
                            <el-button type="primary" class="append-search-btn">
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>

                    <el-select v-model="selectedWard" placeholder="全部病区" clearable class="filter-select">
                        <el-option v-for="item in wardOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-select v-model="selectedLevel" placeholder="全部等级" clearable class="filter-select">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-select v-model="selectedStatus" placeholder="全部状态" clearable class="filter-select">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </div>

                <div class="action-group">
                    <el-button type="primary" class="query-btn" @click="handleQuery">
                        <el-icon class="mr-1">
                            <Search />
                        </el-icon>
                        查询
                    </el-button>
                </div>
            </div>

            <!-- Stats row -->
            <div class="stats-row">
                <div class="stat-item">
                    <span class="stat-label">总患者数</span>
                    <span class="stat-value text-black">{{ stats.total }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">住院患者</span>
                    <span class="stat-value text-blue">{{ stats.inpatient }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">居家随访</span>
                    <span class="stat-value text-green">{{ stats.home }}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">高危患者</span>
                    <span class="stat-value text-red">{{ stats.highRisk }}</span>
                </div>
            </div>

            <div class="table-content">
                <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="patientName" label="患者姓名" width="100" />
                    <el-table-column prop="genderText" label="性别" width="60" />
                    <el-table-column prop="age" label="年龄" width="70">
                        <template #default="scope">
                            {{ scope.row.age }}岁
                        </template>
                    </el-table-column>
                    <el-table-column prop="inpatientNo" label="住院号" width="120" />
                    <el-table-column prop="wardName" label="病区" min-width="130" show-overflow-tooltip />
                    <el-table-column prop="bedNo" label="床号" width="70" />
                    <el-table-column prop="primaryDiagnosis" label="诊断" min-width="160" show-overflow-tooltip />
                    <el-table-column prop="riskLevelText" label="风险等级" width="100" align="center">
                        <template #default="scope">
                            <span class="custom-tag" :class="getRiskLevelClass(scope.row.riskLevelText)">
                                {{ scope.row.riskLevelText }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="patientStatusText" label="状态" width="100" align="center">
                        <template #default="scope">
                            <span class="custom-tag" :class="getStatusClass(scope.row.patientStatusText)">
                                {{ scope.row.patientStatusText }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ecgCount" label="心电次数" width="90" align="center" />
                    <el-table-column prop="latestEcgTime" label="最近心电时间" width="180" align="center">
                        <template #default="scope">
                            {{ scope.row.latestEcgTime ? scope.row.latestEcgTime.replace('T', ' ') : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center" fixed="right">
                        <template #default="scope">
                            <el-button link type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>

            <!-- Detail Dialog -->
            <el-dialog v-model="dialogVisible" title="患者详情" width="700px" destroy-on-close>
                <div v-loading="detailLoading" class="detail-content">
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="患者姓名">{{ patientDetail.patientName || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="性别">{{ patientDetail.genderText || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="年龄">{{ patientDetail.age ? patientDetail.age + '岁' : '-'
                            }}</el-descriptions-item>
                        <el-descriptions-item label="出生日期">{{ patientDetail.birthDate ?
                            patientDetail.birthDate.substring(0, 10) :
                            '-' }}</el-descriptions-item>
                        <el-descriptions-item label="身份证号">{{ patientDetail.idCard || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="联系电话">{{ patientDetail.phone || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="住院号">{{ patientDetail.inpatientNo || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="病区">{{ patientDetail.wardName || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="床号">{{ patientDetail.bedNo || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="状态">{{ patientDetail.patientStatusText || '-'
                            }}</el-descriptions-item>
                        <el-descriptions-item label="风险等级">{{ patientDetail.riskLevelText || '-'
                            }}</el-descriptions-item>
                        <el-descriptions-item label="设备号">{{ patientDetail.deviceId || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="入院时间">{{ patientDetail.admissionTime ?
                            patientDetail.admissionTime.replace('T',
                                ' ') : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="出院时间">{{ patientDetail.dischargeTime ?
                            patientDetail.dischargeTime.replace('T',
                                ' ') : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="心电次数">{{ patientDetail.ecgCount ?? '-' }}</el-descriptions-item>
                        <el-descriptions-item label="最近心电时间">{{ patientDetail.latestEcgTime ?
                            patientDetail.latestEcgTime.replace('T', ' ') : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="主要诊断" :span="2">{{ patientDetail.primaryDiagnosis || '-'
                            }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
.patient-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.main-card {
    flex: 1;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
        padding: 20px;
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
    }
}

.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;

    .filter-group {
        display: flex;
        align-items: center;
        gap: 16px;

        .search-input {
            width: 260px;

            :deep(.el-input-group__append) {
                background-color: var(--el-color-primary);
                color: white;
                border-color: var(--el-color-primary);
                padding: 0 16px;
            }
        }

        .filter-select {
            width: 140px;
        }
    }

    .action-group {
        .query-btn {
            width: 100px;
            letter-spacing: 2px;
        }
    }
}

.stats-row {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 24px;
    padding-left: 4px;

    .stat-item {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .stat-label {
            font-size: 14px;
            color: #737373;
        }

        .stat-value {
            font-size: 20px;
            font-weight: 500;
            line-height: 1;

            &.text-black {
                color: #333;
            }

            &.text-blue {
                color: #3b82f6;
            }

            &.text-green {
                color: #6db92b;
            }

            &.text-red {
                color: #ef4444;
            }
        }
    }
}

.table-content {
    flex: 1;
    overflow: hidden;
    margin-bottom: 20px;

    :deep(.el-table) {
        th.el-table__cell {
            font-weight: 600;
            color: #333;
            background-color: #fcfcfc;
        }

        .el-table__row {
            td {
                border-bottom: 1px solid #f1f5f9;
            }
        }
    }
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
}

/* Custom Tag Styles */
.custom-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 20px;
    border: 1px solid transparent;
}

.detail-content {
    min-height: 200px;
    padding: 10px 0;
}

/* Risk Levels */
.risk-high {
    background-color: #fef2f2;
    color: #ef4444;
    border-color: #fca5a5;
}

.risk-mid-high {
    background-color: #fff7ed;
    color: #f97316;
    border-color: #fdba74;
}

.risk-mid {
    background-color: #fefce8;
    color: #eab308;
    border-color: #fde047;
}

/* Statuses */
.status-inpatient {
    background-color: #eff6ff;
    color: #3b82f6;
    border-color: #bfdbfe;
}

.status-home {
    background-color: #f0fdf4;
    color: #22c55e;
    border-color: #bbf7d0;
}

.mr-1 {
    margin-right: 4px;
}
</style>
