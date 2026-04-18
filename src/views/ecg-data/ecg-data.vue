<template>
    <div class="ecg-data-container">
        <!-- <div class="page-header">
            <h2 class="page-title">心电数据列表</h2>
            
        </div> -->

        <div class="table-card">
            <!-- 搜索与筛选 -->
            <div class="filter-bar">
                <el-input v-model="searchQuery" placeholder="搜索患者姓名/住院号/设备" class="filter-item search-input" clearable>
                    <template #append>
                        <el-button :icon="Search" />
                    </template>
                </el-input>

                <el-select v-model="wardFilter" placeholder="全部病区" class="filter-item" clearable>
                    <el-option label="心血管内科一区" value="心血管内科一区" />
                    <el-option label="心血管内科二区" value="心血管内科二区" />
                    <el-option label="神经内科一区" value="神经内科一区" />
                    <el-option label="急诊科" value="急诊科" />
                    <el-option label="骨科" value="骨科" />
                    <el-option label="产科" value="产科" />
                    <el-option label="内分泌科" value="内分泌科" />
                </el-select>

                <el-select v-model="statusFilter" placeholder="全部状态" class="filter-item" clearable>
                    <el-option label="已分析" value="已分析" />
                    <el-option label="待分析" value="待分析" />
                    <el-option label="已审核" value="已审核" />
                </el-select>

                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始时间"
                    end-placeholder="结束时间" class="filter-item date-picker" />

                <el-button type="primary" :icon="Search" class="query-btn">查询</el-button>
                <el-button type="primary" :icon="Upload">上传数据</el-button>
            </div>

            <!-- 表格 -->
            <el-table :data="tableData" style="width: 100%"
                :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                <el-table-column prop="id" label="序号" width="70" />
                <el-table-column prop="collectTime" label="采集时间" width="160" />
                <el-table-column prop="patientInfo" label="患者信息" width="140" />
                <el-table-column prop="hospitalNo" label="住院号" width="120" />
                <el-table-column prop="ward" label="病区" width="140" />
                <el-table-column prop="bedNo" label="床号" width="80" />
                <el-table-column prop="device" label="设备" width="180" show-overflow-tooltip />
                <el-table-column prop="leads" label="导联数" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row.status)" effect="plain" size="small">
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="aiConclusion" label="AI结论" min-width="200" show-overflow-tooltip />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default>
                        <el-button link type="primary" size="small">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search, Upload } from '@element-plus/icons-vue';

const searchQuery = ref('');
const wardFilter = ref('');
const statusFilter = ref('');
const dateRange = ref([]);

const tableData = ref([
    { id: 1, collectTime: '2026-04-11 08:30:00', patientInfo: '张三/45岁/男', hospitalNo: '2186225', ward: '心血管内科一区', bedNo: '01', device: '心电图机ECG-2000', leads: '12导联', status: '已分析', aiConclusion: '窦性心律，ST段轻度压低' },
    { id: 2, collectTime: '2026-04-11 09:15:00', patientInfo: '李四/62岁/女', hospitalNo: '2191885', ward: '心血管内科二区', bedNo: '02', device: '心电图机ECG-3000', leads: '12导联', status: '待分析', aiConclusion: '-' },
    { id: 3, collectTime: '2026-04-11 10:00:00', patientInfo: '王五/58岁/男', hospitalNo: '2187225', ward: '神经内科一区', bedNo: '15', device: '心电图机ECG-2000', leads: '12导联', status: '已审核', aiConclusion: '心房颤动，建议进一步检查' },
    { id: 4, collectTime: '2026-04-11 11:30:00', patientInfo: '赵六/72岁/女', hospitalNo: '2192221', ward: '老年病科', bedNo: '28', device: '便携式心电仪PE-100', leads: '3导联', status: '已分析', aiConclusion: '窦性心动过缓，心率52次/分' },
    { id: 5, collectTime: '2026-04-11 14:00:00', patientInfo: '孙七/55岁/男', hospitalNo: '2180867', ward: '心血管内科一区', bedNo: '05', device: '心电图机ECG-3000', leads: '12导联', status: '待分析', aiConclusion: '-' },
    { id: 6, collectTime: '2026-04-11 15:20:00', patientInfo: '周八/48岁/女', hospitalNo: '2143093', ward: '内分泌科', bedNo: '09', device: '心电图机ECG-2000', leads: '12导联', status: '已审核', aiConclusion: '正常心电图' },
    { id: 7, collectTime: '2026-04-11 16:00:00', patientInfo: '刘十一/32岁/女', hospitalNo: '2185555', ward: '产科', bedNo: '12', device: '心电图机ECG-3000', leads: '12导联', status: '已分析', aiConclusion: '窦性心动过速，偶发房早' },
    { id: 8, collectTime: '2026-04-11 14:30:00', patientInfo: '陈十二/78岁/男', hospitalNo: '2196666', ward: '骨科', bedNo: '08', device: '心电图机ECG-2000', leads: '12导联', status: '已分析', aiConclusion: '窦性心律，左室肥厚伴劳损' },
    { id: 9, collectTime: '2026-04-11 17:00:00', patientInfo: '黄十三/42岁/男', hospitalNo: '2187777', ward: '急诊科', bedNo: '03', device: '心电图机ECG-3000', leads: '12导联', status: '已分析', aiConclusion: '窦性心律，QT间期延长' },
    { id: 10, collectTime: '2026-04-11 10:30:00', patientInfo: '林十四/55岁/女', hospitalNo: '2198888', ward: '肾内科', bedNo: '16', device: '便携式心电仪PE-100', leads: '3导联', status: '已分析', aiConclusion: '窦性心律，频发室性早搏' },
    { id: 11, collectTime: '2026-04-11 09:00:00', patientInfo: '郑十/52岁/女', hospitalNo: '2179999', ward: '居家', bedNo: '-', device: '远程心电监测仪RM-200', leads: '3导联', status: '已分析', aiConclusion: '室性早搏增多' }
]);

const getStatusType = (status) => {
    switch (status) {
        case '已分析': return 'primary';
        case '待分析': return 'warning';
        case '已审核': return 'success';
        default: return 'info';
    }
};
</script>

<style lang="scss" scoped>
.ecg-data-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
    }
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
    margin-bottom: 20px;

    .filter-item {
        width: 200px;
    }

    .search-input {
        width: 280px;
    }

    .date-picker {
        width: 320px;
    }

    .query-btn {
        margin-left: auto;
        width: 100px;
    }
}

:deep(.el-table) {
    flex: 1;

    .el-tag {
        border-radius: 4px;
        padding: 0 8px;
    }
}
</style>
