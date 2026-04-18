<script setup>
import { ref } from 'vue'
import { Search, Bell, Clock, View, Check } from '@element-plus/icons-vue'

// Filters
const searchQuery = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')
const dateRange = ref([])

// Options
const levelOptions = [
    { label: '高危', value: 'high' },
    { label: '中危', value: 'mid' },
    { label: '低危', value: 'low' },
]

const statusOptions = [
    { label: '待确认', value: 'pending_confirm' },
    { label: '待处理', value: 'pending_handle' },
    { label: '处理中', value: 'handling' },
    { label: '已处理', value: 'handled' },
]

const stats = {
    highRisk: 4,
    pending: 7
}

// Table Data (Mocked based on image 1)
const tableData = ref([
    {
        id: '1',
        warningTime: '2026-04-11 10:02:00',
        patientInfo: '王五/58岁/男',
        name: '王五',
        age: '58岁',
        gender: '男',
        hospitalNo: '2187225',
        ward: '神经内科一区',
        warningType: '心房颤动',
        warningLevel: '高危',
        status: '已处理',
        handleTime: '2026-04-11 10:15:00',
        content: 'AI检测到房颤心律，RR间期绝对不齐，心率波动在90-130次/分。患者有房颤病史，目前无明显不适。'
    },
    {
        id: '2',
        warningTime: '2026-04-11 11:33:00',
        patientInfo: '赵六/72岁/女',
        name: '赵六',
        age: '72岁',
        gender: '女',
        hospitalNo: '2192221',
        ward: '老年病科',
        warningType: '心动过缓',
        warningLevel: '中危',
        status: '待处理',
        handleTime: '-',
        content: 'AI检测到窦性心动过缓，心率52次/分，患者有头晕症状。高龄患者，需评估窦房结功能。'
    },
    {
        id: '3',
        warningTime: '2026-04-11 08:32:00',
        patientInfo: '张三/45岁/男',
        name: '张三',
        age: '45岁',
        gender: '男',
        hospitalNo: '2186225',
        ward: '心血管内科一区',
        warningType: 'ST段异常',
        warningLevel: '中危',
        status: '待处理',
        handleTime: '-',
        content: '监测到V1-V3导联ST段压低＞0.1mV，伴有T波倒置。建议结合心肌酶学指标进一步确认。'
    },
    {
        id: '4',
        warningTime: '2026-04-11 09:05:00',
        patientInfo: '郑十/52岁/女',
        name: '郑十',
        age: '52岁',
        gender: '女',
        hospitalNo: '2179999',
        ward: '居家',
        warningType: '室性早搏增多',
        warningLevel: '高危',
        status: '待确认',
        handleTime: '-',
        content: '近1小时内频发室性早搏，偶发成对室早。需紧急联系患者到院复查。'
    },
    {
        id: '5',
        warningTime: '2026-04-11 10:35:00',
        patientInfo: '林十四/55岁/女',
        name: '林十四',
        age: '55岁',
        gender: '女',
        hospitalNo: '2198888',
        ward: '肾内科',
        warningType: '室性早搏增多',
        warningLevel: '高危',
        status: '待处理',
        handleTime: '-',
        content: '长程心电图显示室早负荷超过10%，需评估心功能并调整抗心律失常药物。'
    },
    {
        id: '6',
        warningTime: '2026-04-11 17:05:00',
        patientInfo: '黄十三/42岁/男',
        name: '黄十三',
        age: '42岁',
        gender: '男',
        hospitalNo: '2187777',
        ward: '急诊科',
        warningType: 'QT间期延长',
        warningLevel: '高危',
        status: '待确认',
        handleTime: '-',
        content: '校正QT间期(QTc)达520ms，存在发生尖端扭转型室速(TdP)的高风险。'
    },
    {
        id: '7',
        warningTime: '2026-04-11 14:35:00',
        patientInfo: '陈十二/78岁/男',
        name: '陈十二',
        age: '78岁',
        gender: '男',
        hospitalNo: '2196666',
        ward: '骨科',
        warningType: 'ST-T改变',
        warningLevel: '中危',
        status: '待处理',
        handleTime: '-',
        content: '监测到多导联ST-T动态改变，骨科术后患者需警惕围手术期心肌缺血。'
    },
    {
        id: '8',
        warningTime: '2026-04-11 16:05:00',
        patientInfo: '刘十一/32岁/女',
        name: '刘十一',
        age: '32岁',
        gender: '女',
        hospitalNo: '2185555',
        ward: '产科',
        warningType: '窦性心动过速',
        warningLevel: '中危',
        status: '待处理',
        handleTime: '-',
        content: '阵发性窦性心动过速，心率最高140次/分，考虑与妊娠生理性变化或近期劳累有关。'
    },
    {
        id: '9',
        warningTime: '2026-04-11 09:00:00',
        patientInfo: '林十四/55岁/女',
        name: '林十四',
        age: '55岁',
        gender: '女',
        hospitalNo: '2198888',
        ward: '肾内科',
        warningType: '血钾异常',
        warningLevel: '高危',
        status: '已处理',
        handleTime: '2026-04-11 09:15:00',
        content: '心电图由于高钾血症表现出T波高尖，血钾复查值达6.5mmol/L，已紧急进行降钾治疗。'
    },
    {
        id: '10',
        warningTime: '2026-04-11 11:20:00',
        patientInfo: '郑十/52岁/女',
        name: '郑十',
        age: '52岁',
        gender: '女',
        hospitalNo: '2179999',
        ward: '居家',
        warningType: 'RR间期过长',
        warningLevel: '高危',
        status: '处理中',
        handleTime: '-',
        content: '检测到夜间大于3秒的RR长间期，已通过App发送提醒并联系家属跟进。'
    },
    {
        id: '11',
        warningTime: '2026-04-11 14:45:00',
        patientInfo: '李四/62岁/女',
        name: '李四',
        age: '62岁',
        gender: '女',
        hospitalNo: '2191885',
        ward: '心血管内科二区',
        warningType: '室速发作',
        warningLevel: '高危',
        status: '已处理',
        handleTime: '2026-04-11 14:50:00',
        content: '突发短阵室性心动过速，持续7拍，伴血液动力学波动。已予静脉应用胺碘酮。'
    }
])

// Dialog State
const dialogVisible = ref(false)
const currentDetail = ref(null)

const handleQuery = () => {
    console.log('Query warnings...')
}

const showDetail = (row) => {
    currentDetail.value = row
    dialogVisible.value = true
}

const processWarning = () => {
    console.log('Processing warning...', currentDetail.value.id)
    dialogVisible.value = false
}

// Helpers for tag styles
const getRiskLevelClass = (level) => {
    if (level === '高危') return 'level-high'
    if (level === '中危') return 'level-mid'
    if (level === '低危') return 'level-low'
    return ''
}

const getStatusClass = (status) => {
    if (status === '待确认') return 'status-confirm'
    if (status === '待处理') return 'status-pending'
    if (status === '处理中') return 'status-processing'
    if (status === '已处理') return 'status-handled'
    return ''
}
</script>

<template>
    <div class="warning-container">
        <el-card shadow="never" class="main-card">
            <div class="filter-bar">
                <div class="filter-group">
                    <el-input v-model="searchQuery" placeholder="搜索患者姓名/住院号" class="search-input" clearable>
                        <template #append>
                            <el-button type="primary" class="append-search-btn">
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>

                    <el-select v-model="selectedLevel" placeholder="全部级别" clearable class="filter-select">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-select v-model="selectedStatus" placeholder="全部状态" clearable class="filter-select">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>

                    <el-date-picker v-model="dateRange" type="daterange" range-separator="→" start-placeholder="开始时间"
                        end-placeholder="结束时间" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="filter-date" />
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
                    <span class="value">{{ stats.highRisk }}</span>
                </div>
                <div class="stat-item pending">
                    <el-icon class="icon">
                        <Clock />
                    </el-icon>
                    <span class="label">待处理预警</span>
                    <span class="value">{{ stats.pending }}</span>
                </div>
            </div>

            <div class="table-content">
                <el-table :data="tableData" style="width: 100%" height="100%">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="warningTime" label="预警时间" width="160" />
                    <el-table-column prop="patientInfo" label="患者信息" width="140" />
                    <el-table-column prop="hospitalNo" label="住院号" width="100" />
                    <el-table-column prop="ward" label="病区" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="warningType" label="预警类型" min-width="120" show-overflow-tooltip>
                        <template #default="{ row }">
                            <span class="text-type">{{ row.warningType }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="warningLevel" label="预警级别" width="100" align="center">
                        <template #default="{ row }">
                            <span class="custom-tag" :class="getRiskLevelClass(row.warningLevel)">
                                {{ row.warningLevel }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <span class="custom-tag" :class="getStatusClass(row.status)">
                                {{ row.status }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="handleTime" label="处理时间" width="160" align="center" />
                    <el-table-column label="操作" width="180" align="center" fixed="right">
                        <template #default="{ row }">
                            <div class="action-cell">
                                <el-button link type="primary" @click="showDetail(row)" class="action-view">
                                    <el-icon class="mr-1">
                                        <View />
                                    </el-icon>查看详情
                                </el-button>
                                <el-button v-if="row.status !== '已处理'" type="primary" size="small" class="action-handle"
                                    @click="showDetail(row)">
                                    <el-icon class="mr-1">
                                        <Check />
                                    </el-icon>处理
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <!-- Detail Dialog -->
        <el-dialog v-model="dialogVisible" title="预警详情" width="600px" class="custom-dialog" destroy-on-close>
            <div v-if="currentDetail" class="dialog-content">
                <!-- Header Info -->
                <div class="info-grid header-grid">
                    <div class="grid-item">
                        <div class="label">预警时间</div>
                        <div class="value font-num">{{ currentDetail.warningTime }}</div>
                    </div>
                    <div class="grid-item">
                        <div class="label">预警级别</div>
                        <div class="value">
                            <span class="custom-tag" :class="getRiskLevelClass(currentDetail.warningLevel)">
                                {{ currentDetail.warningLevel }}
                            </span>
                        </div>
                    </div>
                    <div class="grid-item">
                        <div class="label">预警状态</div>
                        <div class="value">
                            <span class="custom-tag" :class="getStatusClass(currentDetail.status)">
                                {{ currentDetail.status }}
                            </span>
                        </div>
                    </div>
                </div>

                <el-divider class="divider-light" />

                <!-- Patient Info -->
                <div class="section">
                    <div class="section-title">患者信息</div>
                    <div class="patient-title">{{ currentDetail.name }}/{{ currentDetail.age }}/{{ currentDetail.gender
                    }}</div>
                    <div class="info-row">
                        <span class="label">住院号：</span>
                        <span class="value">{{ currentDetail.hospitalNo }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">病区：</span>
                        <span class="value">{{ currentDetail.ward }}</span>
                    </div>
                </div>

                <!-- Warning Type -->
                <div class="section mt-24">
                    <div class="label mb-8">预警类型</div>
                    <span class="text-type bold-type">{{ currentDetail.warningType }}</span>
                </div>

                <!-- Warning Content -->
                <div class="section mt-24">
                    <div class="label mb-8">预警内容</div>
                    <div class="content-box">
                        {{ currentDetail.content }}
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                    <el-button type="primary" @click="processWarning">处理预警</el-button>
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