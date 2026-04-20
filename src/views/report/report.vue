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
                            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </div>
                </div>
                <div class="action-group">
                    <el-button type="primary" :icon="Search" class="query-btn" @click="handleQuery">查询</el-button>
                </div>
            </div>

            <!-- 列表区 -->
            <div class="table-content">
                <el-table v-loading="loading" :data="tableData" style="width: 100%"
                    :header-cell-style="{ background: '#f5f7fa', color: '#606266', padding: '12px 0' }">
                    <el-table-column prop="reportNo" label="报告编号" width="140" />
                    <el-table-column prop="patientInfo" label="患者信息" width="140" />
                    <el-table-column prop="hospitalNo" label="住院号" width="120" />
                    <el-table-column prop="collectionTime" label="采集时间" width="170">
                        <template #default="scope">
                            {{ scope.row.collectionTime ? scope.row.collectionTime.replace('T', ' ') : '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="aiConclusion" label="AI结论" min-width="180" show-overflow-tooltip />
                    <el-table-column prop="doctorConclusion" label="医生结论" width="160" show-overflow-tooltip>
                        <template #default="scope">
                            {{ scope.row.doctorConclusion || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="auditDoctorName" label="审核医生" width="100">
                        <template #default="scope">
                            {{ scope.row.auditDoctorName || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="auditTime" label="审核时间" width="170">
                        <template #default="scope">
                            {{ scope.row.auditTime ? scope.row.auditTime.replace('T', ' ') : '-' }}
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
                            <el-button link type="primary" size="small"
                                @click="handleDownload(scope.row.reportId)">下载</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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
                    <div class="section-title">患者基础信息</div>
                    <div class="section-content split-3">
                        <div>患者姓名: {{ currentReport?.patientName || '-' }} ({{ currentReport?.gender || '-' }}/{{
                            currentReport?.age || '-' }}岁)</div>
                        <div>住院号: {{ currentReport?.hospitalNo || '-' }}</div>
                        <div>采集时间: {{ currentReport?.collectionTime ? currentReport.collectionTime.replace('T', ' ') :
                            '-' }}
                        </div>
                    </div>
                </div>

                <!-- 块2：AI诊断结果 -->
                <div class="report-section">
                    <div class="section-title">AI 原始诊断结论</div>
                    <div class="section-content">
                        结论: {{ currentReport?.aiConclusion || '暂无内容' }}
                    </div>
                </div>

                <!-- 块3：医生审核意见 -->
                <div class="report-section">
                    <div class="section-title">医生最终诊断与建议</div>
                    <div class="section-content" style="padding-bottom: 20px;">
                        <div style="margin-bottom: 12px;"><strong>结论:</strong> {{ currentReport?.doctorConclusion || '无'
                        }}
                        </div>
                        <div><strong>建议:</strong> {{ currentReport?.doctorSuggestion || '无' }}</div>
                    </div>
                    <div class="section-footer"
                        style="display: block; border-top: 1px dashed #ebeef5; padding-top: 16px; margin-top: 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div>报告生成医生: {{ currentReport?.reportCreateDoctorName || '无' }}</div>
                            <div>报告生成时间: {{ currentReport?.reportCreateTime ?
                                currentReport.reportCreateTime.replace('T', ' ') :
                                '无' }}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div>审核医生: {{ currentReport?.auditDoctorName || '无' }}</div>
                            <div>审核时间: {{ currentReport?.auditTime ? currentReport.auditTime.replace('T', ' ') : '无' }}
                            </div>
                        </div>
                        <div v-if="currentReport?.auditOpinion" style="color: #e6a23c; font-size: 13px;">
                            审核意见: {{ currentReport.auditOpinion }}
                        </div>
                    </div>
                </div>

                <div class="disclaimer">AI诊断仅供参考，最终诊断以医生意见为准</div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">关闭</el-button>
                    <el-button type="primary" :icon="Download"
                        @click="handleDownload(currentReport?.reportId)">下载PDF</el-button>
                    <el-button :icon="Printer">打印</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search, Download, Printer } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { apiDiagnosisReportsPage, apiDiagnosisReportsDicts, apiDiagnosisReportDetail, apiDiagnosisReportDownload } from '@/apis/reports';

const searchQuery = ref({
    reportNo: '',
    patientName: '',
    status: ''
});

const statusOptions = ref([]);

const dialogVisible = ref(false);
const currentReport = ref(null);

const tableData = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getDicts = async () => {
    try {
        const res = await apiDiagnosisReportsDicts();
        if (res.code === 0 && res.data) {
            statusOptions.value = res.data.statusList || [];
        }
    } catch (error) {
        console.error('获取字典数据失败:', error);
    }
};

const fetchReports = async () => {
    loading.value = true;
    try {
        const res = await apiDiagnosisReportsPage({
            reportNo: searchQuery.value.reportNo || undefined,
            patientName: searchQuery.value.patientName || undefined,
            status: searchQuery.value.status || undefined,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        });
        if (res.code === 0 && res.data) {
            tableData.value = res.data.list || [];
            total.value = res.data.total || 0;
        }
    } catch (error) {
        console.error('获取报告列表失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleQuery = () => {
    pageNum.value = 1;
    fetchReports();
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    pageNum.value = 1;
    fetchReports();
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    fetchReports();
};

const handleView = async (row) => {
    try {
        const res = await apiDiagnosisReportDetail(row.reportId);
        if (res.code === 0 && res.data) {
            // 合并列表的基础数据和获取到的详情数据
            currentReport.value = { ...row, ...res.data };
            dialogVisible.value = true;
        }
    } catch (error) {
        console.error('获取报告详情失败:', error);
        ElMessage.error('获取报告详情失败');
    }
};

const handleDownload = async (reportId) => {
    if (!reportId) return;
    try {
        const res = await apiDiagnosisReportDownload(reportId);
        // 创建Blob对象并下载
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `诊断报告_${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        ElMessage.success('报告下载成功');
    } catch (error) {
        console.error('下载报告失败:', error);
        ElMessage.error('下载报告失败');
    }
};

onMounted(() => {
    getDicts();
    fetchReports();
});
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
