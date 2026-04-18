<template>
    <div class="report-container">
        <el-card shadow="never" class="main-card">
            <!-- 搜索筛选区 -->
            <div class="filter-bar">
                <div class="filter-group">
                    <div class="filter-item">
                        <span class="label">报告编号：</span>
                        <el-input v-model="searchQuery.reportNo" placeholder="报告编号" clearable />
                    </div>
                    <div class="filter-item">
                        <span class="label">患者姓名：</span>
                        <el-input v-model="searchQuery.patientName" placeholder="患者姓名" clearable />
                    </div>
                    <div class="filter-item">
                        <span class="label">状态：</span>
                        <el-select v-model="searchQuery.status" placeholder="全部状态" clearable style="width: 140px;">
                            <el-option label="已审核" value="已审核" />
                            <el-option label="待审核" value="待审核" />
                        </el-select>
                    </div>
                </div>
                <div class="action-group">
                    <el-button type="primary" :icon="Search" class="query-btn">查询</el-button>
                </div>
            </div>

            <!-- 列表区 -->
            <div class="table-content">
                <el-table :data="tableData" style="width: 100%"
                    :header-cell-style="{ background: '#f5f7fa', color: '#606266', padding: '12px 0' }">
                    <el-table-column prop="reportNo" label="报告编号" width="140" />
                    <el-table-column prop="patientInfo" label="患者信息" width="140" />
                    <el-table-column prop="hospitalNo" label="住院号" width="120" />
                    <el-table-column prop="collectTime" label="采集时间" width="170" />
                    <el-table-column prop="aiConclusion" label="AI结论" min-width="180" show-overflow-tooltip />
                    <el-table-column prop="doctorConclusion" label="医生结论" width="120">
                        <template #default="scope">
                            {{ scope.row.doctorConclusion || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="reviewDoctor" label="审核医生" width="100">
                        <template #default="scope">
                            {{ scope.row.reviewDoctor || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="reviewTime" label="审核时间" width="170">
                        <template #default="scope">
                            {{ scope.row.reviewTime || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === '已审核' ? 'success' : 'warning'" effect="light"
                                size="small">
                                {{ scope.row.status }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" fixed="right" width="120" align="center">
                        <template #default="scope">
                            <el-button link type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
                            <el-button link type="primary" size="small">下载</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <!-- 诊断报告预览弹框 -->
        <el-dialog v-model="dialogVisible" title="诊断报告预览" width="780px" top="5vh" class="report-dialog"
            destroy-on-close>
            <div class="report-preview-content" id="report-print-area">
                <h2 class="report-title">心电图诊断报告</h2>
                <div class="report-subtitle">报告编号: {{ currentReport?.reportNo }}</div>

                <!-- 块1：患者信息 -->
                <div class="report-section">
                    <div class="section-title">患者信息</div>
                    <div class="section-content split-3">
                        <div>患者姓名: {{ currentReport?.patientInfo }}</div>
                        <div>住院号: {{ currentReport?.hospitalNo }}</div>
                        <div>采集时间: {{ currentReport?.collectTime }}</div>
                    </div>
                </div>

                <!-- 块2：AI诊断结果 -->
                <div class="report-section">
                    <div class="section-title">AI诊断结果</div>
                    <div class="section-content">
                        结论: {{ currentReport?.aiConclusion }}
                    </div>
                </div>

                <!-- 块3：医生审核意见 -->
                <div class="report-section">
                    <div class="section-title">医生审核意见</div>
                    <div class="section-content" style="padding-bottom: 40px;">
                        结论: {{ currentReport?.doctorConclusion || '无' }}
                    </div>
                    <div class="section-footer">
                        <div>审核医生: {{ currentReport?.reviewDoctor || '无' }}</div>
                        <div>审核时间: {{ currentReport?.reviewTime || '无' }}</div>
                    </div>
                </div>

                <div class="disclaimer">AI诊断仅供参考，最终诊断以医生意见为准</div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                    <el-button type="primary" :icon="Download">下载PDF</el-button>
                    <el-button :icon="Printer">打印</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search, Download, Printer } from '@element-plus/icons-vue';

const searchQuery = ref({
    reportNo: '',
    patientName: '',
    status: ''
});

const dialogVisible = ref(false);
const currentReport = ref(null);

const tableData = ref([
    { reportNo: '20260411001', patientInfo: '王五/58岁/男', hospitalNo: '2187225', collectTime: '2026-04-11 10:05:00', aiConclusion: '心房颤动', doctorConclusion: '审核通过', reviewDoctor: '王医生', reviewTime: '2026-04-11 10:30:00', status: '已审核' },
    { reportNo: '20260411002', patientInfo: '周八/48岁/女', hospitalNo: '2143093', collectTime: '2026-04-11 15:25:00', aiConclusion: '正常心电图', doctorConclusion: '审核通过', reviewDoctor: '王医生', reviewTime: '2026-04-11 15:45:00', status: '已审核' },
    { reportNo: '20260411003', patientInfo: '张三/45岁/男', hospitalNo: '2186225', collectTime: '2026-04-11 08:35:00', aiConclusion: '窦性心律，ST段轻度压低', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' },
    { reportNo: '20260411004', patientInfo: '赵六/72岁/女', hospitalNo: '2192221', collectTime: '2026-04-11 11:35:00', aiConclusion: '窦性心动过缓', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' },
    { reportNo: '20260411005', patientInfo: '刘十一/32岁/女', hospitalNo: '2185555', collectTime: '2026-04-11 16:05:00', aiConclusion: '窦性心动过速，偶发房早', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' },
    { reportNo: '20260411006', patientInfo: '陈十二/78岁/男', hospitalNo: '2196666', collectTime: '2026-04-11 14:35:00', aiConclusion: '窦性心律，左室肥厚伴劳损', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' },
    { reportNo: '20260411007', patientInfo: '黄十三/42岁/男', hospitalNo: '2187777', collectTime: '2026-04-11 17:05:00', aiConclusion: '窦性心律，QT间期延长', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' },
    { reportNo: '20260411008', patientInfo: '林十四/55岁/女', hospitalNo: '2198888', collectTime: '2026-04-11 10:35:00', aiConclusion: '窦性心律，频发室性早搏', doctorConclusion: '', reviewDoctor: '', reviewTime: '', status: '待审核' }
]);

const handleView = (row) => {
    currentReport.value = row;
    dialogVisible.value = true;
};
</script>

<style lang="scss" scoped>
.report-container {
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
        gap: 32px;

        .filter-item {
            display: flex;
            align-items: center;

            .label {
                font-size: 14px;
                color: #333;
                margin-right: 8px;
                white-space: nowrap;
            }

            .el-input {
                width: 200px;
            }
        }
    }

    .action-group {
        .query-btn {
            width: 100px;
        }
    }
}

.table-content {
    flex: 1;
    overflow: hidden;

    :deep(.el-table) {
        th.el-table__cell {
            font-weight: 600;
        }

        .el-table__row {
            td {
                border-bottom: 1px solid #f1f5f9;
            }
        }
    }
}

/* 诊断报告预览样式 */
.report-dialog {
    :deep(.el-dialog__body) {
        padding-top: 10px;
        padding-bottom: 10px;
    }
}

.report-preview-content {
    background-color: #fff;
    padding: 10px 30px 20px;

    .report-title {
        text-align: center;
        font-size: 22px;
        font-weight: normal;
        color: #303133;
        margin: 0 0 10px 0;
        letter-spacing: 2px;
    }

    .report-subtitle {
        text-align: center;
        font-size: 13px;
        color: #909399;
        margin-bottom: 24px;
    }

    .report-section {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        margin-bottom: 16px;
        padding: 18px 24px;

        .section-title {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 16px;
            border-bottom: 1px solid #ebeef5;
            padding-bottom: 12px;
        }

        .section-content {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;

            &.split-3 {
                display: flex;
                justify-content: space-between;

                >div {
                    flex: 1;
                }
            }
        }

        .section-footer {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #606266;
            margin-top: 16px;
        }
    }

    .disclaimer {
        text-align: right;
        font-size: 12px;
        color: #c0c4cc;
        margin-top: 16px;
        padding-right: 10px;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-right: 20px;
}
</style>
