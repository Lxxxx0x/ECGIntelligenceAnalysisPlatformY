<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Aim, Timer, TrendCharts, Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { apiMonitorStatistics, apiMonitorPatients, apiWardDistribution, apiMonitorPatientDetail } from '@/apis/realtime'

// Top Stats Data
const stats = ref([
    { id: 1, title: '今日采集', value: 45, unit: '例', icon: Aim, colorClass: 'text-blue', bgClass: 'bg-blue' },
    { id: 2, title: '待分析', value: 8, unit: '例', icon: Timer, colorClass: 'text-orange', bgClass: 'bg-orange' },
    { id: 3, title: '待审核', value: 12, unit: '例', icon: TrendCharts, colorClass: 'text-purple', bgClass: 'bg-purple' },
    { id: 4, title: '预警数', value: 11, unit: '条', icon: Bell, colorClass: 'text-red', bgClass: 'bg-red' }
])

// Real-time Patient Dashboard Data
const patients = ref([])

// Department Stats Data
const deptStats = ref([])

const filterLevel = ref('全部')

const filteredPatients = computed(() => {
    if (filterLevel.value === '全部') return patients.value
    if (filterLevel.value === '高危') return patients.value.filter(p => p.hr > 120 || p.hr < 45)
    if (filterLevel.value === '中危') return patients.value.filter(p => (p.hr > 100 && p.hr <= 120) || (p.hr >= 45 && p.hr < 55))
    if (filterLevel.value === '正常') return patients.value.filter(p => p.hr >= 55 && p.hr <= 100)
    return patients.value
})

const handleAddFocus = (patient) => {
    ElMessage.success(`已将 ${patient.name} 加入重点监护`)
}

// Fetch Stats
const fetchStats = async () => {
    try {
        const res = await apiMonitorStatistics()
        const resData = res.data || res;
        const data = resData.data || resData;

        if (data) {
            stats.value[0].value = data.todayCollect || 0;
            stats.value[1].value = data.pendingAnalyse || 0;
            stats.value[2].value = data.pendingAudit || 0;
            stats.value[3].value = data.alertTotal || 0;
        }
    } catch (error) {
        console.error('获取统计数据失败:', error)
    }
}

// 详情弹窗相关数据
const detailDialogVisible = ref(false)
const patientDetail = ref(null)

const openPatientDetail = async (patientId) => {
    try {
        const res = await apiMonitorPatientDetail(patientId)
        const resData = res.data || res;
        const data = resData.data || resData;
        if (data) {
            patientDetail.value = data;
            detailDialogVisible.value = true;
        } else {
            ElMessage.error('获取患者详情失败');
        }
    } catch (error) {
        console.error('获取患者详情失败:', error)
        ElMessage.error('获取患者详情出错');
    }
}

// 获取患者监护列表
const fetchPatients = async () => {
    try {
        const res = await apiMonitorPatients()
        const resData = res.data || res;
        const data = resData.data || resData;

        if (data && data.list) {
            patients.value = data.list.map(p => ({
                id: p.patientId,
                name: p.patientName,
                wardBed: p.wardBed,
                hr: p.heartRate,
                status: p.monitorStatus === '预警' ? 'warning' : 'normal',
                statusText: p.monitorStatus,
                time: p.updateTime
            }))
        }
    } catch (error) {
        console.error('获取患者列表失败:', error)
    }
}

// 获取科室分布统计
const fetchDeptStats = async () => {
    try {
        const res = await apiWardDistribution()
        const resData = res.data || res;
        const data = resData.data || resData;

        if (data && data.dataList) {
            const total = data.dataList.reduce((sum, item) => sum + item.patientCount, 0);
            deptStats.value = data.dataList.map(item => ({
                name: item.wardName,
                value: item.patientCount,
                percentage: total === 0 ? 0 : Math.round((item.patientCount / total) * 100)
            }))
        }
    } catch (error) {
        console.error('获取科室分布失败:', error)
    }
}

// Simulate real-time updates
let intervalId;
onMounted(() => {
    fetchStats()
    fetchPatients()
    fetchDeptStats()
    intervalId = setInterval(() => {
        fetchPatients()
        fetchDeptStats()
    }, 5000); // 调整为5秒一刷
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})

</script>

<template>
    <div class="realtime-container">
        <!-- Top Stats Row -->
        <div class="stats-grid">
            <el-card v-for="stat in stats" :key="stat.id" shadow="hover" class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">{{ stat.title }}</span>
                </div>
                <div class="stat-body">
                    <el-icon class="stat-icon" :class="stat.colorClass">
                        <component :is="stat.icon" />
                    </el-icon>
                    <div class="stat-value-box">
                        <span class="stat-value" :class="stat.colorClass">{{ stat.value }}</span>
                        <span class="stat-unit" :class="stat.colorClass">{{ stat.unit }}</span>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Left Dashboard -->
            <div class="dashboard-panel">
                <div class="panel-header">
                    <div class="title-with-bar" style="display: flex; align-items: center; gap: 16px;">
                        <span>实时监护大屏</span>
                        <el-select v-model="filterLevel" placeholder="全部等级" size="small" style="width: 120px;">
                            <el-option label="全部等级" value="全部" />
                            <el-option label="高危预警" value="高危" />
                            <el-option label="中危预警" value="中危" />
                            <el-option label="正常监护" value="正常" />
                        </el-select>
                    </div>
                    <div class="live-indicator">
                        <span class="pulsing-dot"></span>
                        实时更新中
                    </div>
                </div>

                <div class="patient-grid">
                    <!-- Patient Cards -->
                    <div v-for="patient in filteredPatients" :key="patient.id" class="patient-card"
                        :class="patient.status === 'warning' ? 'is-warning' : 'is-normal'"
                        @click="openPatientDetail(patient.id)" style="cursor: pointer;">
                        <!-- Card Header -->
                        <div class="p-header">
                            <span class="p-name">{{ patient.name }}</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <el-button size="small" type="primary" link
                                    @click.stop="handleAddFocus(patient)">加入重点监护</el-button>
                                <span class="p-tag">{{ patient.statusText }}</span>
                            </div>
                        </div>
                        <!-- Card Meta -->
                        <div class="p-meta">
                            {{ patient.wardBed }}
                        </div>
                        <!-- HR Display -->
                        <div class="p-hr-box">
                            <svg class="heart-icon icon-pulse"
                                :class="patient.status === 'warning' ? 'text-red' : 'text-gray'" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span class="p-hr-value">{{ patient.hr }}</span>
                            <span class="p-hr-unit">bpm</span>
                        </div>
                        <!-- Sub Info & Time -->
                        <div class="p-footer">
                            <span class="update-label">更新时间</span>
                            <span class="update-time">{{ patient.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Stats -->
            <div class="dept-panel">
                <div class="panel-header" style="margin-bottom: 24px;">
                    <div class="title-with-bar">
                        <span>科室分布统计</span>
                    </div>
                </div>
                <div class="dept-list">
                    <div class="dept-item" v-for="(dept, index) in deptStats" :key="index">
                        <div class="dept-info">
                            <span class="dept-name">{{ dept.name }}</span>
                            <span class="dept-value">{{ dept.value }} <span class="dept-unit">例</span></span>
                        </div>
                        <el-progress :percentage="dept.percentage" :show-text="false" :stroke-width="8" color="#3b82f6"
                            class="custom-progress" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 患者详情弹窗 -->
        <el-dialog v-model="detailDialogVisible" title="患者实时监护详情" width="800px" destroy-on-close>
            <div v-if="patientDetail" class="patient-detail-content">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="患者姓名">{{ patientDetail.patientName }}</el-descriptions-item>
                    <el-descriptions-item label="住院号">{{ patientDetail.inpatientNo }}</el-descriptions-item>
                    <el-descriptions-item label="病区">{{ patientDetail.wardName }}</el-descriptions-item>
                    <el-descriptions-item label="床位/关联病床">{{ patientDetail.wardBed }}</el-descriptions-item>
                    <el-descriptions-item label="主要诊断" :span="2">{{ patientDetail.primaryDiagnosis }}</el-descriptions-item>
                    <el-descriptions-item label="当前心率">
                        <span :class="{'text-red': patientDetail.currentHeartRate > 100 || patientDetail.currentHeartRate < 60, 'font-bold': true}">{{ patientDetail.currentHeartRate }} bpm</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="监护状态">
                        <el-tag :type="patientDetail.monitorStatus === 2 ? 'danger' : 'success'" size="small">
                            {{ patientDetail.monitorStatusText }} {{ patientDetail.warningLevelText ? `(${patientDetail.warningLevelText})` : '' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="更新时间">{{ patientDetail.updateTime?.replace('T', ' ') }}</el-descriptions-item>
                </el-descriptions>

                <div v-if="patientDetail.continuousRecords && patientDetail.continuousRecords.length > 0" style="margin-top: 20px;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #1e293b;">连续监控记录</div>
                    <el-table :data="patientDetail.continuousRecords" border size="small" style="width: 100%">
                        <el-table-column prop="ecgNo" label="记录编号" width="130" show-overflow-tooltip />
                        <el-table-column prop="deviceName" label="设备名称" width="130" show-overflow-tooltip />
                        <el-table-column label="采集时间" width="160">
                            <template #default="{ row }">
                                {{ row.collectionStartTime?.split('T')[1] }} - {{ row.collectionEndTime?.split('T')[1] }}
                            </template>
                        </el-table-column>
                        <el-table-column label="AI结论" min-width="150" show-overflow-tooltip>
                            <template #default="{ row }">
                                <span :class="{'text-red': row.aiConclusionShort?.includes('风险')}">{{ row.aiConclusionShort }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="displayStatusText" label="状态" width="80" align="center" />
                    </el-table>
                </div>

                <div v-if="patientDetail.warningHistory && patientDetail.warningHistory.length > 0" style="margin-top: 20px;">
                    <div style="font-weight: 600; margin-bottom: 10px; color: #ef4444;">历史预警记录</div>
                    <el-table :data="patientDetail.warningHistory" border size="small" style="width: 100%">
                        <el-table-column label="预警时间" width="150">
                            <template #default="{ row }">
                                {{ row.warningTime?.replace('T', ' ') }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="warningType" label="预警类型" min-width="120" show-overflow-tooltip />
                        <el-table-column prop="alertLevelText" label="等级" width="80" align="center">
                            <template #default="{ row }">
                                <el-tag type="danger" size="small" effect="dark">{{ row.alertLevelText }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="alertStatusText" label="处理状态" width="80" align="center" />
                        <el-table-column prop="handleUserName" label="处理人" width="80" align="center" />
                        <el-table-column prop="handleRemark" label="处理结果" min-width="120" show-overflow-tooltip />
                    </el-table>
                </div>

            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="detailDialogVisible = false">关闭</el-button>
                    <el-button type="primary" @click="detailDialogVisible = false">进入深度分析台</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.realtime-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
}

/* Colors */
.text-blue {
    color: #3b82f6;
}

.text-orange {
    color: #f59e0b;
}

.text-purple {
    color: #8b5cf6;
}

.text-red {
    color: #ef4444;
}

.text-gray {
    color: #94a3b8;
}

.bg-blue {
    background-color: #eff6ff;
}

.bg-orange {
    background-color: #fffbeb;
}

.bg-purple {
    background-color: #f5f3ff;
}

.bg-red {
    background-color: #fef2f2;
}

/* Top Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .stat-card {
        border-radius: 12px;
        border: none;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
            transform: translateY(-2px);
        }

        :deep(.el-card__body) {
            padding: 20px 24px;
        }

        .stat-header {
            margin-bottom: 12px;

            .stat-title {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }
        }

        .stat-body {
            display: flex;
            align-items: center;
            gap: 16px;

            .stat-icon {
                font-size: 28px;
            }

            .stat-value-box {
                display: flex;
                align-items: baseline;
                gap: 6px;

                .stat-value {
                    font-size: 32px;
                    font-weight: 600;
                    font-family: monospace, sans-serif;
                    line-height: 1;
                }

                .stat-unit {
                    font-size: 14px;
                    font-weight: 500;
                }
            }
        }
    }
}

/* Main Content Layout */
.main-content {
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;

    .dashboard-panel {
        flex: 3;
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        min-width: 0; // Prevent flex blowout
    }

    .dept-panel {
        flex: 1;
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.03);
        min-width: 300px;
    }
}

/* Panel Headers */
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title-with-bar {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;

        /* Removed heavy colored bar to keep it minimalist */
    }

    .live-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #10b981;
        font-weight: 500;
        background: #f0fdf4;
        padding: 4px 12px;
        border-radius: 100px;

        .pulsing-dot {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
    }
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}

/* Patient Grid Redesign (Minimalist & High-end) */
.patient-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    overflow-y: auto;
    padding-right: 8px;
    /* For scrollbar space */

    /* Scrollbar override */
    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
}

.patient-card {
    position: relative;
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;

    &.is-normal {
        border: 1px solid #f1f5f9;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);

        .p-tag {
            background: #f0fdf4;
            color: #10b981;
        }

        .heart-icon {
            color: #cbd5e1;
        }

        &:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
            border-color: #e2e8f0;
            transform: translateY(-2px);
        }
    }

    &.is-warning {
        background: #fef2f2;
        border: 1px solid #fecaca;
        box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.1);

        .p-tag {
            background: #ef4444;
            color: #ffffff;
            animation: gentle-shimmer 2s infinite;
        }

        .heart-icon {
            color: #ef4444;
            animation: heartbeat 1s infinite;
        }

        .p-hr-value {
            color: #b91c1c;
        }

        &:hover {
            box-shadow: 0 10px 20px -3px rgba(239, 68, 68, 0.15);
            transform: translateY(-2px);
        }
    }

    .p-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .p-name {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
        }

        .p-tag {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
    }

    .p-meta {
        font-size: 13px;
        color: #64748b;
        margin-bottom: 16px;

        .divider {
            margin: 0 6px;
            color: #cbd5e1;
            font-size: 10px;
        }
    }

    .p-hr-box {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 16px;

        .heart-icon {
            width: 24px;
            height: 24px;
            position: relative;
            top: 4px;
        }

        .p-hr-value {
            font-size: 42px;
            font-weight: 300;
            font-family: 'Helvetica Neue', Helvetica, Arial, monospace;
            /* Cleanest built-in number font looking */
            line-height: 1;
            color: #0f172a;
            letter-spacing: -1px;
        }

        .p-hr-unit {
            font-size: 14px;
            color: #94a3b8;
            font-weight: 500;
        }
    }

    .p-footer {
        border-top: 1px dashed #e2e8f0;
        padding-top: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #94a3b8;

        .update-time {
            font-family: monospace;
            color: #64748b;
        }
    }
}

@keyframes heartbeat {
    0% {
        transform: scale(1);
    }

    14% {
        transform: scale(1.15);
    }

    28% {
        transform: scale(1);
    }

    42% {
        transform: scale(1.15);
    }

    70% {
        transform: scale(1);
    }
}

@keyframes gentle-shimmer {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.8;
    }

    100% {
        opacity: 1;
    }
}

/* Department Stats Panel */
.dept-list {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .dept-item {
        .dept-info {
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-bottom: 8px;

            .dept-name {
                font-size: 14px;
                color: #334155;
                font-weight: 500;
            }

            .dept-value {
                font-size: 16px;
                font-weight: 600;
                color: #0f172a;

                .dept-unit {
                    font-size: 12px;
                    color: #94a3b8;
                    font-weight: normal;
                    margin-left: 2px;
                }
            }
        }

        .custom-progress {
            :deep(.el-progress-bar__outer) {
                background-color: #f1f5f9;
            }
        }
    }
}
</style>