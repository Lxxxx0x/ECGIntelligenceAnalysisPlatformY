<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchQuery = ref('')
const selectedWard = ref('')
const selectedLevel = ref('')
const selectedStatus = ref('')

// Dropdown options
const wardOptions = [
    { label: '心血管内科一区', value: '1' },
    { label: '心血管内科二区', value: '2' },
    { label: '神经内科一区', value: '3' },
    { label: '老年病科', value: '4' },
]

const levelOptions = [
    { label: '高危', value: 'high' },
    { label: '中高危', value: 'mid-high' },
    { label: '中危', value: 'mid' },
]

const statusOptions = [
    { label: '住院中', value: 'inpatient' },
    { label: '居家随访', value: 'home' }
]

const stats = {
    total: 12,
    inpatient: 10,
    home: 2,
    highRisk: 5
}

// Table Data (Mocked based on image)
const tableData = ref([
    {
        id: '1',
        name: '张三',
        gender: '男',
        age: '45岁',
        hospitalNo: '2186225',
        ward: '心血管内科一区',
        bed: '01',
        diagnosis: '冠心病/不稳定型心...',
        riskLevel: '中高危',
        status: '住院中',
        ecgCount: 5,
        lastEcgTime: '2026-04-11 08:30:00'
    },
    {
        id: '2',
        name: '李四',
        gender: '女',
        age: '62岁',
        hospitalNo: '2191885',
        ward: '心血管内科二区',
        bed: '02',
        diagnosis: '心房颤动',
        riskLevel: '高危',
        status: '住院中',
        ecgCount: 8,
        lastEcgTime: '2026-04-11 09:15:00'
    },
    {
        id: '3',
        name: '王五',
        gender: '男',
        age: '58岁',
        hospitalNo: '2187225',
        ward: '神经内科一区',
        bed: '15',
        diagnosis: '脑梗塞/TIA',
        riskLevel: '高危',
        status: '住院中',
        ecgCount: 12,
        lastEcgTime: '2026-04-11 10:00:00'
    },
    {
        id: '4',
        name: '赵六',
        gender: '女',
        age: '72岁',
        hospitalNo: '2192221',
        ward: '老年病科',
        bed: '28',
        diagnosis: '高血压、心动过缓',
        riskLevel: '中高危',
        status: '住院中',
        ecgCount: 15,
        lastEcgTime: '2026-04-11 11:30:00'
    },
    {
        id: '5',
        name: '孙七',
        gender: '男',
        age: '55岁',
        hospitalNo: '2180867',
        ward: '心血管内科一区',
        bed: '05',
        diagnosis: '胸闷待查',
        riskLevel: '中危',
        status: '住院中',
        ecgCount: 1,
        lastEcgTime: '2026-04-11 14:00:00'
    },
    {
        id: '6',
        name: '周八',
        gender: '女',
        age: '48岁',
        hospitalNo: '2143093',
        ward: '内分泌科',
        bed: '09',
        diagnosis: '糖尿病',
        riskLevel: '中高危',
        status: '住院中',
        ecgCount: 3,
        lastEcgTime: '2026-04-11 15:20:00'
    },
    {
        id: '7',
        name: '吴九',
        gender: '男',
        age: '65岁',
        hospitalNo: '2178888',
        ward: '',
        bed: '',
        diagnosis: '冠心病术后',
        riskLevel: '中危',
        status: '居家随访',
        ecgCount: 25,
        lastEcgTime: '2026-04-10 16:00:00'
    },
    {
        id: '8',
        name: '郑十',
        gender: '女',
        age: '52岁',
        hospitalNo: '2179999',
        ward: '',
        bed: '',
        diagnosis: '心律失常',
        riskLevel: '中高危',
        status: '居家随访',
        ecgCount: 18,
        lastEcgTime: '2026-04-11 09:00:00'
    },
    {
        id: '9',
        name: '刘十一',
        gender: '女',
        age: '32岁',
        hospitalNo: '2185555',
        ward: '产科',
        bed: '12',
        diagnosis: '妊娠期心律失常',
        riskLevel: '中高危',
        status: '住院中',
        ecgCount: 6,
        lastEcgTime: '2026-04-11 16:00:00'
    },
    {
        id: '10',
        name: '陈十二',
        gender: '男',
        age: '78岁',
        hospitalNo: '2196666',
        ward: '骨科',
        bed: '08',
        diagnosis: '股骨颈骨折',
        riskLevel: '高危',
        status: '住院中',
        ecgCount: 4,
        lastEcgTime: '2026-04-11 14:30:00'
    },
    {
        id: '11',
        name: '黄十三',
        gender: '男',
        age: '42岁',
        hospitalNo: '2187777',
        ward: '急诊科',
        bed: '03',
        diagnosis: '晕厥待查',
        riskLevel: '高危',
        status: '住院中',
        ecgCount: 2,
        lastEcgTime: '2026-04-11 17:00:00'
    },
    {
        id: '12',
        name: '林十四',
        gender: '女',
        age: '55岁',
        hospitalNo: '2198888',
        ward: '肾内科',
        bed: '16',
        diagnosis: '肾功能不全',
        riskLevel: '高危',
        status: '住院中',
        ecgCount: 20,
        lastEcgTime: '2026-04-11 10:30:00'
    }
])

const handleQuery = () => {
    console.log('Query patients...')
}

const getRiskLevelClass = (level) => {
    if (level === '高危') return 'risk-high'
    if (level === '中高危') return 'risk-mid-high'
    if (level === '中危') return 'risk-mid'
    return ''
}

const getStatusClass = (status) => {
    if (status === '住院中') return 'status-inpatient'
    if (status === '居家随访') return 'status-home'
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
                <el-table :data="tableData" style="width: 100%" height="100%">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="name" label="患者姓名" width="100" />
                    <el-table-column prop="gender" label="性别" width="60" />
                    <el-table-column prop="age" label="年龄" width="70" />
                    <el-table-column prop="hospitalNo" label="住院号" width="100" />
                    <el-table-column prop="ward" label="病区" min-width="130" show-overflow-tooltip />
                    <el-table-column prop="bed" label="床号" width="70" />
                    <el-table-column prop="diagnosis" label="诊断" min-width="160" show-overflow-tooltip />
                    <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
                        <template #default="scope">
                            <span class="custom-tag" :class="getRiskLevelClass(scope.row.riskLevel)">
                                {{ scope.row.riskLevel }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100" align="center">
                        <template #default="scope">
                            <span class="custom-tag" :class="getStatusClass(scope.row.status)">
                                {{ scope.row.status }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ecgCount" label="心电次数" width="90" align="center" />
                    <el-table-column prop="lastEcgTime" label="最近心电时间" width="180" align="center" />
                    <el-table-column label="操作" width="80" align="center" fixed="right">
                        <template #default>
                            <!-- Small blue icon button (matches image's cut-off operation col) -->
                            <el-button link type="primary" size="small">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
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

/* Custom Tag Styles */
.custom-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 20px;
    border: 1px solid transparent;
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
