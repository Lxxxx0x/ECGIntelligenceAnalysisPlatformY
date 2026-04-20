<script setup>
import { ref, onMounted } from 'vue'
import { Search, Bell, Clock, View, Check } from '@element-plus/icons-vue'
import { apiWarningPageList, apiWarningDetail, apiWarningStatistics, apiWarningHandle } from '@/apis/warning'
import { ElMessage, ElMessageBox } from 'element-plus'

// Filters
const searchQuery = ref('')
const selectedWard = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')
const dateRange = ref([])

// Options
const levelOptions = [
    { label: '高危', value: '3' },
    { label: '中危', value: '2' },
    { label: '低危', value: '1' },
]

const statusOptions = [
    { label: '待确认', value: '0' },
    { label: '待处理', value: '1' },
    { label: '处理中', value: '2' },
    { label: '已处理', value: '3' },
    { label: '已忽略', value: '4' },
]

const stats = ref({
    highRiskCount: 0,
    pendingHandleCount: 0
})

const fetchStatistics = async () => {
    try {
        const res = await apiWarningStatistics()
        if (res.code === 0 && res.data) {
            stats.value = res.data
        }
    } catch (error) {
        console.error('获取预警统计失败:', error)
    }
}

// Table Data
const tableData = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(15)
const total = ref(0)

const fetchWarnings = async () => {
    loading.value = true
    try {
        let startTime = undefined
        let endTime = undefined
        if (dateRange.value && dateRange.value.length === 2) {
            startTime = dateRange.value[0] + ' 00:00:00'
            endTime = dateRange.value[1] + ' 23:59:59'
        }

        const res = await apiWarningPageList({
            keyword: searchQuery.value || undefined,
            ward: selectedWard.value || undefined,
            alertLevel: selectedLevel.value || undefined,
            alertStatus: selectedStatus.value || undefined,
            startTime,
            endTime,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        })

        if (res.code === 0 && res.data) {
            tableData.value = res.data.records || []
            total.value = res.data.total || 0
        }
    } catch (error) {
        console.error('获取预警列表失败:', error)
    } finally {
        loading.value = false
    }
}

// Dialog State
const dialogVisible = ref(false)
const currentDetail = ref(null)

const handleQuery = () => {
    pageNum.value = 1
    fetchWarnings()
}

const handleSizeChange = (val) => {
    pageSize.value = val
    pageNum.value = 1
    fetchWarnings()
}

const handleCurrentChange = (val) => {
    pageNum.value = val
    fetchWarnings()
}

const showDetail = async (row) => {
    try {
        const res = await apiWarningDetail(row.alertId)
        if (res.code === 0 && res.data) {
            currentDetail.value = res.data
            dialogVisible.value = true
        } else {
            ElMessage.error(res.message || '获取预警详情失败')
        }
    } catch (error) {
        console.error('获取预警详情失败:', error)
        ElMessage.error('获取预警详情失败')
    }
}

const processWarning = async () => {
    if (!currentDetail.value) return;
    try {
        const { value } = await ElMessageBox.prompt('请输入处理备注', '处理预警', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入处理备注（可为空）',
            inputErrorMessage: '备注内容不能超过200字符',
            inputPattern: /^.{0,200}$/
        });

        const res = await apiWarningHandle(currentDetail.value.alertId, value || '');

        if (res.code === 0) {
            ElMessage.success('处理成功');
            dialogVisible.value = false;
            fetchWarnings(); // Refresh the list
            fetchStatistics(); // Update top stats
        } else {
            ElMessage.error(res.message || '处理失败');
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('处理预警错误:', error);
            ElMessage.error('处理失败，请重试');
        }
    }
}

// Helpers for tag styles
const getRiskLevelClass = (level) => {
    if (level === '高危' || level == 3) return 'level-high'
    if (level === '中危' || level == 2) return 'level-mid'
    if (level === '低危' || level == 1) return 'level-low'
    return ''
}

const getStatusClass = (status) => {
    if (status === '待确认' || status == 0) return 'status-confirm'
    if (status === '待处理' || status == 1) return 'status-pending'
    if (status === '处理中' || status == 2) return 'status-processing'
    if (status === '已处理' || status == 3) return 'status-handled'
    if (status === '已忽略' || status == 4) return 'status-handled' // Using same for now
    return ''
}

onMounted(() => {
    fetchWarnings()
    fetchStatistics()
})
</script>

<template>
    <div class="warning-container">
        <el-card shadow="never" class="main-card">
            <div class="filter-bar">
                <div class="filter-group">
                    <el-input v-model="searchQuery" placeholder="搜索患者姓名/住院号" class="search-input" clearable
                        @keyup.enter="handleQuery" @clear="handleQuery">
                        <template #append>
                            <el-button type="primary" class="append-search-btn" @click="handleQuery">
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>

                    <el-input v-model="selectedWard" placeholder="病区筛选" style="width: 140px;" clearable
                        @keyup.enter="handleQuery" @clear="handleQuery" />

                    <el-select v-model="selectedLevel" placeholder="全部级别" clearable class="filter-select"
                        @change="handleQuery">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-select v-model="selectedStatus" placeholder="全部状态" clearable class="filter-select"
                        @change="handleQuery">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-date-picker v-model="dateRange" type="daterange" range-separator="→" start-placeholder="开始时间"
                        end-placeholder="结束时间" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="filter-date"
                        @change="handleQuery" />
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
                <div class="stat-item high-risk">
                    <el-icon class="icon">
                        <Bell />
                    </el-icon>
                    <span class="label">高危预警</span>
                    <span class="value">{{ stats.highRiskCount }}</span>
                </div>
                <div class="stat-item pending">
                    <el-icon class="icon">
                        <Clock />
                    </el-icon>
                    <span class="label">待处理预警</span>
                    <span class="value">{{ stats.pendingHandleCount }}</span>
                </div>
            </div>

            <div class="table-content">
                <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="warningTime" label="预警时间" width="160">
                        <template #default="{ row }">
                            {{ row.warningTime ? row.warningTime.replace('T', ' ') : '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="patientInfo" label="患者信息" width="140" />
                    <el-table-column prop="inpatientNo" label="住院号" width="100" />
                    <el-table-column prop="wardName" label="病区" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="warningType" label="预警类型" min-width="120" show-overflow-tooltip>
                        <template #default="{ row }">
                            <span class="text-type">{{ row.warningType }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alertLevelText" label="预警级别" width="100" align="center">
                        <template #default="{ row }">
                            <span class="custom-tag" :class="getRiskLevelClass(row.alertLevelText)">
                                {{ row.alertLevelText }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="alertStatusText" label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <span class="custom-tag" :class="getStatusClass(row.alertStatusText)">
                                {{ row.alertStatusText }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="handleTime" label="处理时间" width="160" align="center">
                        <template #default="{ row }">
                            {{ row.handleTime ? row.handleTime.replace('T', ' ') : '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" align="center" fixed="right">
                        <template #default="{ row }">
                            <div class="action-cell">
                                <el-button link type="primary" @click="showDetail(row)" class="action-view">
                                    <el-icon class="mr-1">
                                        <View />
                                    </el-icon>查看详情
                                </el-button>
                                <el-button v-if="row.alertStatusText !== '已处理'" type="primary" size="small"
                                    class="action-handle" @click="showDetail(row)">
                                    <el-icon class="mr-1">
                                        <Check />
                                    </el-icon>处理
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-wrapper" style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 15, 20, 30, 50]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-card>

        <!-- Detail Dialog -->
        <el-dialog v-model="dialogVisible" title="预警详情" width="600px" class="custom-dialog" destroy-on-close>
            <div v-if="currentDetail" class="dialog-content">
                <!-- Header Info -->
                <div class="info-grid header-grid">
                    <div class="grid-item">
                        <div class="label">预警时间</div>
                        <div class="value font-num">{{ currentDetail.warningTime ?
                            currentDetail.warningTime.replace('T', ' ') :
                            '-' }}</div>
                    </div>
                    <div class="grid-item">
                        <div class="label">预警级别</div>
                        <div class="value">
                            <span class="custom-tag" :class="getRiskLevelClass(currentDetail.alertLevelText)">
                                {{ currentDetail.alertLevelText }}
                            </span>
                        </div>
                    </div>
                    <div class="grid-item">
                        <div class="label">预警状态</div>
                        <div class="value">
                            <span class="custom-tag" :class="getStatusClass(currentDetail.alertStatusText)">
                                {{ currentDetail.alertStatusText }}
                            </span>
                        </div>
                    </div>
                </div>

                <el-divider class="divider-light" />

                <!-- Patient Info -->
                <div class="section">
                    <div class="section-title">患者信息</div>
                    <div class="patient-title">{{ currentDetail.patientName }}/{{ currentDetail.age }}岁/{{
                        currentDetail.genderText }}</div>
                    <div class="info-row">
                        <span class="label">住院号：</span>
                        <span class="value">{{ currentDetail.inpatientNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">病区：</span>
                        <span class="value">{{ currentDetail.wardName }}</span>
                    </div>
                </div>

                <!-- Warning Type and Description -->
                <div class="section mt-24">
                    <div class="label mb-8">预警类型与说明</div>
                    <span class="text-type bold-type mb-8" style="display:block;">分类：{{ currentDetail.warningType
                    }}</span>
                    <div class="content-box">
                        说明：{{ currentDetail.warningDesc || '暂无说明' }}
                    </div>
                </div>

                <!-- AI Analysis -->
                <div class="section mt-24">
                    <div class="label mb-8">AI 辅助分析</div>
                    <div class="content-box">
                        <div v-if="currentDetail.aiConclusion" class="mb-8"><strong>AI 结论：</strong>{{
                            currentDetail.aiConclusion
                        }}</div>
                        <div v-if="currentDetail.clinicalManifestation" class="mb-8"><strong>临床表现：</strong>{{
                            currentDetail.clinicalManifestation }}</div>
                        <div v-if="currentDetail.lisHint"><strong>LIS 建议：</strong>{{ currentDetail.lisHint }}</div>
                        <div
                            v-if="!currentDetail.aiConclusion && !currentDetail.clinicalManifestation && !currentDetail.lisHint">
                            暂无相关的AI分析辅助建议</div>
                    </div>
                </div>

                <!-- Handle Info (If Processed) -->
                <div v-if="currentDetail.handleTime" class="section mt-24"
                    style="background: #f8fafc; padding: 16px; border-radius: 6px;">
                    <div class="section-title"
                        style="margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                        处理记录</div>
                    <div class="info-row">
                        <span class="label">处理人：</span>
                        <span class="value">{{ currentDetail.handleUserName || '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">处理时间：</span>
                        <span class="value">{{ currentDetail.handleTime ? currentDetail.handleTime.replace('T', ' ') :
                            '-'
                        }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">处理备注：</span>
                        <span class="value">{{ currentDetail.handleRemark || '无' }}</span>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                    <el-button v-if="currentDetail?.alertStatusText !== '已处理'" type="primary"
                        @click="processWarning">处理预警</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.warning-container {
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
    margin-bottom: 20px;

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

        .filter-date {
            width: 280px;
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
    gap: 24px;
    margin-bottom: 24px;
    padding-left: 4px;

    .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;

        .icon {
            font-size: 16px;
        }

        .label {
            color: #666;
        }

        .value {
            font-size: 18px;
            font-weight: 600;
        }

        &.high-risk {

            .icon,
            .value {
                color: #ef4444;
            }
        }

        &.pending {

            .icon,
            .value {
                color: #f59e0b;
            }
        }
    }
}

.table-content {
    flex: 1;
    overflow: hidden;

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

.text-type {
    color: #3b82f6;
}

.action-cell {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding-left: 10px;
}

.action-view {
    font-size: 14px;
    padding: 0;
    height: auto;
}

.action-handle {
    border-radius: 4px;
    padding: 5px 12px;
}

/* Custom Tag Styles */
.custom-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 22px;
    border: 1px solid transparent;
    white-space: nowrap;
}

/* Risk Levels */
.level-high {
    background-color: #fef2f2;
    color: #ef4444;
    border-color: #fca5a5;
}

.level-mid {
    background-color: #fff7ed;
    color: #f97316;
    border-color: #fdba74;
}

.level-low {
    background-color: #fefce8;
    color: #eab308;
    border-color: #fde047;
}

/* Statuses */
.status-confirm {
    background-color: #eff6ff;
    color: #3b82f6;
    border-color: #bfdbfe;
}

.status-pending {
    background-color: #fffbeb;
    color: #d97706;
    /* distinct from mid risk */
    border-color: #fcd34d;
}

.status-processing {
    background-color: #fefce8;
    color: #eab308;
    border-color: #fde047;
}

.status-handled {
    background-color: #f0fdf4;
    color: #22c55e;
    border-color: #bbf7d0;
}

.mr-1 {
    margin-right: 4px;
}

/* Dialog Styles */
.custom-dialog {
    :deep(.el-dialog__header) {
        margin-right: 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #f1f5f9;

        .el-dialog__title {
            font-weight: 600;
            color: #333;
        }
    }

    :deep(.el-dialog__body) {
        padding: 24px;
    }
}

.dialog-content {
    color: #333;

    .header-grid {
        display: flex;
        gap: 40px;
        margin-bottom: 20px;

        .grid-item {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .label {
                font-size: 13px;
                color: #999;
            }

            .value {
                font-size: 15px;

                &.font-num {
                    font-family: monospace, sans-serif;
                    font-weight: 600;
                    font-size: 16px;
                }
            }
        }
    }

    .divider-light {
        margin: 20px 0;
        border-color: #f1f5f9;
    }

    .section {
        .section-title {
            font-size: 13px;
            color: #999;
            margin-bottom: 16px;
        }

        .patient-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1a1a1a;
        }

        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
            display: flex;

            .label {
                color: #666;
                width: 70px;
                flex-shrink: 0;
            }

            .value {
                color: #333;
            }
        }

        .bold-type {
            font-size: 15px;
            font-weight: 600;
        }

        .content-box {
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            margin-top: 8px;
        }

        .label {
            font-size: 13px;
            color: #999;
        }
    }

    .mt-24 {
        margin-top: 32px;
    }

    .mb-8 {
        margin-bottom: 12px;
    }
}
</style>