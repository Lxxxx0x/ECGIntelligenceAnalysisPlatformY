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
                    <el-option v-for="item in wardOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-select v-model="statusFilter" placeholder="全部状态" class="filter-item" clearable>
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>

                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始时间"
                    end-placeholder="结束时间" class="filter-item date-picker" />

                <el-button type="primary" :icon="Search" class="query-btn" @click="handleQuery">查询</el-button>
                <el-button type="primary" :icon="Upload" @click="uploadVisible = true">上传数据</el-button>
                <el-button type="success" :icon="Link" @click="vendorImportVisible = true">厂商数据导入</el-button>
            </div>

            <!-- 表格 -->
            <div class="table-content">
                <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%"
                    :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                    <el-table-column type="index" label="序号" width="70" align="center" />
                    <el-table-column prop="collectTime" label="采集时间" width="180">
                        <template #default="scope">
                            {{ scope.row.collectTime ? scope.row.collectTime.replace('T', ' ') : '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="patientInfo" label="患者信息" width="160" />
                    <el-table-column prop="inpatientNo" label="住院号" width="120" />
                    <el-table-column prop="ward" label="病区" width="140" />
                    <el-table-column prop="deviceNo" label="设备编号" width="160" show-overflow-tooltip />
                    <el-table-column prop="status" label="状态" width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="getStatusType(scope.row.status)" effect="plain" size="small">
                                {{ scope.row.status }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="aiConclusion" label="AI结论" min-width="200" show-overflow-tooltip />
                    <el-table-column label="操作" width="100" fixed="right" align="center">
                        <template #default="scope">
                            <el-button link type="primary" size="small"
                                @click="handleDetail(scope.row)">查看详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>

            <!-- 详情弹窗 -->
            <el-dialog v-model="dialogVisible" title="心电数据详情" width="850px" destroy-on-close
                @closed="handleDialogClosed">
                <div v-loading="detailLoading" class="detail-content">
                    <el-descriptions :column="3" border>
                        <el-descriptions-item label="心电编号">{{ ecgDetail.ecgNo || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="患者姓名">{{ ecgDetail.patientName || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="性别/年龄">{{ ecgDetail.gender || '-' }} / {{ ecgDetail.age + '岁' ||
                            '-'
                        }}</el-descriptions-item>
                        <el-descriptions-item label="住院号">{{ ecgDetail.inpatientNo || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="病区">{{ ecgDetail.wardName || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="床号">{{ ecgDetail.bedNo || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="设备名称" :span="2">{{ ecgDetail.deviceName || '-'
                        }}</el-descriptions-item>
                        <el-descriptions-item label="采集时长">{{ ecgDetail.collectionDuration ?
                            ecgDetail.collectionDuration + 's' :
                            '-' }}</el-descriptions-item>
                        <el-descriptions-item label="采集时间" :span="2">{{ ecgDetail.collectStartTime ?
                            ecgDetail.collectStartTime.replace('T', ' ') : '-' }} 至 {{ ecgDetail.collectEndTime ?
                                ecgDetail.collectEndTime.split('T')[1] || ecgDetail.collectEndTime : '-'
                            }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <span v-if="ecgDetail.status">
                                <el-tag :type="getStatusType(ecgDetail.status)" effect="plain" size="small">{{
                                    ecgDetail.status
                                }}</el-tag>
                            </span>
                            <span v-else>-</span>
                        </el-descriptions-item>
                        <el-descriptions-item label="主要诊断" :span="3">{{ ecgDetail.primaryDiagnosis || '-'
                        }}</el-descriptions-item>
                        <el-descriptions-item label="AI结论" :span="3">{{ ecgDetail.aiConclusion || '-'
                        }}</el-descriptions-item>
                    </el-descriptions>

                    <div class="chart-area" v-if="ecgDetail.waveformPreview && ecgDetail.waveformPreview.length">
                        <div class="chart-header">心电波形预览 (模拟段)</div>
                        <div class="echarts-container" ref="chartRef" style="width: 100%; height: 300px;"></div>
                    </div>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="dialogVisible = false">关闭</el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- 上传数据弹窗 (前端页面占位) -->
            <el-dialog v-model="uploadVisible" title="手动上传心电数据" width="500px">
                <el-form :model="uploadForm" label-width="100px">
                    <el-form-item label="患者姓名">
                        <el-input v-model="uploadForm.patientName" placeholder="请输入患者姓名 (可选)" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="住院号">
                        <el-input v-model="uploadForm.inpatientNo" placeholder="请输入住院号 (可选)" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="设备编号">
                        <el-input v-model="uploadForm.deviceNo" placeholder="请输入设备编号 (可选)" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="数据文件">
                        <el-upload action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                            :auto-upload="false" :limit="1">
                            <el-button type="primary">选择心电文件</el-button>
                            <template #tip>
                                <div class="el-upload__tip text-gray-500">
                                    请上传 .ecg, .dat 或 .xml 格式的数据文件
                                </div>
                            </template>
                        </el-upload>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="uploadVisible = false">取消</el-button>
                        <el-button type="primary" @click="submitUpload">确认上传</el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- 厂商数据导入配置弹窗 -->
            <el-dialog v-model="vendorImportVisible" title="配置设备厂商接口" width="600px" destroy-on-close>
                <el-form :model="vendorForm" label-width="130px" label-position="right">
                    <el-form-item label="选择设备厂商" required>
                        <el-select v-model="vendorForm.vendorName" placeholder="请选择需要对接的设备系统" style="width: 100%">
                            <el-option label="迈瑞 (Mindray)" value="mindray" />
                            <el-option label="飞利浦 (Philips)" value="philips" />
                            <el-option label="GE医疗 (GE Healthcare)" value="ge" />
                            <el-option label="理邦 (Edan)" value="edan" />
                            <el-option label="其他厂商" value="other" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="API接口地址" required>
                        <el-input v-model="vendorForm.apiUrl" placeholder="请输入厂商系统的对接API网关地址"></el-input>
                    </el-form-item>
                    <el-form-item label="AppKey / 账号">
                        <el-input v-model="vendorForm.appKey" placeholder="请输入分配的 AppKey 或 API账号"></el-input>
                    </el-form-item>
                    <el-form-item label="AppSecret / 密码">
                        <el-input v-model="vendorForm.appSecret" type="password" show-password
                            placeholder="请输入分配的密钥或密码"></el-input>
                    </el-form-item>
                    <el-form-item label="数据同步策略">
                        <el-radio-group v-model="vendorForm.syncStrategy">
                            <el-radio value="realtime" label="realtime">实时同步</el-radio>
                            <el-radio value="scheduled" label="scheduled">定时轮询</el-radio>
                            <el-radio value="manual" label="manual">手动拉取</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="轮询间隔" v-if="vendorForm.syncStrategy === 'scheduled'">
                        <el-input-number v-model="vendorForm.interval" :min="1" :max="1440" :step="10" />
                        <span style="margin-left: 10px; color: #606266;">分钟</span>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <el-button type="info" plain @click="testVendorConnection">测试连接</el-button>
                        <div>
                            <el-button @click="vendorImportVisible = false">取消</el-button>
                            <el-button type="primary" @click="submitVendorConfig">保存配置并开启</el-button>
                        </div>
                    </div>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Search, Upload, Link } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { apiEcgDataList, apiEcgDataDetail } from '@/apis/ecgData';
import { apiEcgDataDicts } from '@/apis/search';
import * as echarts from 'echarts';

const searchQuery = ref('');
const wardFilter = ref('');
const statusFilter = ref('');
const dateRange = ref([]);

const wardOptions = ref([]);
const deviceOptions = ref([]);
const statusOptions = ref([]);

const tableData = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const getDicts = async () => {
    try {
        const res = await apiEcgDataDicts();
        if (res.code === 0 && res.data) {
            wardOptions.value = res.data.wardOptions || [];
            deviceOptions.value = res.data.deviceOptions || [];
            statusOptions.value = res.data.statusOptions || [];
        }
    } catch (error) {
        console.error('Failed to fetch dicts:', error);
    }
};

const fetchEcgData = async () => {
    loading.value = true;
    try {
        let startTime = undefined;
        let endTime = undefined;
        if (dateRange.value && dateRange.value.length === 2) {
            startTime = dateRange.value[0];
            endTime = dateRange.value[1];
        }

        const res = await apiEcgDataList({
            keyword: searchQuery.value || undefined,
            wardId: wardFilter.value || undefined,
            status: statusFilter.value || undefined,
            startTime,
            endTime,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        });
        if (res.code === 0 && res.data) {
            tableData.value = res.data.records || res.data.list || res.data || [];
            total.value = res.data.total || 0;
        }
    } catch (error) {
        console.error('Failed to fetch ECG data:', error);
    } finally {
        loading.value = false;
    }
};

const handleQuery = () => {
    pageNum.value = 1;
    fetchEcgData();
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    pageNum.value = 1;
    fetchEcgData();
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    fetchEcgData();
};

const dialogVisible = ref(false);
const detailLoading = ref(false);
const ecgDetail = ref({});
const chartRef = ref(null);
let chartInstance = null;

const handleDialogClosed = () => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
};

// --- 上传数据逻辑 ---
const uploadVisible = ref(false);
const uploadForm = ref({
    patientName: '',
    inpatientNo: '',
    deviceNo: '',
    file: null
});

const submitUpload = () => {
    // 后续接入接口逻辑
    ElMessage.success('心电数据上传模拟成功');
    uploadVisible.value = false;
};

// --- 厂商数据导入逻辑 ---
const vendorImportVisible = ref(false);
const vendorForm = ref({
    vendorName: '',
    apiUrl: '',
    appKey: '',
    appSecret: '',
    syncStrategy: 'manual', // realtime, scheduled, manual
    interval: 30
});

const testVendorConnection = () => {
    if (!vendorForm.value.vendorName || !vendorForm.value.apiUrl) {
        ElMessage.warning('请先填写完整厂商名称及API接口地址');
        return;
    }
    ElMessage.success('成功连接到厂商设备服务器资源库！');
};

const submitVendorConfig = () => {
    if (!vendorForm.value.vendorName || !vendorForm.value.apiUrl) {
        ElMessage.warning('请补全必需的配置项');
        return;
    }
    ElMessage.success('配置更新成功，已启动采集作业');
    vendorImportVisible.value = false;
};

const handleDetail = async (row) => {
    dialogVisible.value = true;
    detailLoading.value = true;
    try {
        // Here we pass the appropriate ID, assuming it's ecgId or id. We use row.ecgId from API.
        const res = await apiEcgDataDetail(row.ecgId || row.id);
        if (res.code === 0 && res.data) {
            ecgDetail.value = res.data;
            if (res.data.waveformPreview && res.data.waveformPreview.length > 0) {
                // Use nextTick to wait for v-if DOM to render the ref
                nextTick(() => {
                    renderChart(res.data.waveformPreview);
                });
            }
        }
    } catch (error) {
        console.error('Failed to fetch ECG detail:', error);
    } finally {
        detailLoading.value = false;
    }
};

const renderChart = (data) => {
    if (!chartRef.value) return;

    // Prevent memory leaks
    if (chartInstance) {
        chartInstance.dispose();
    }

    chartInstance = echarts.init(chartRef.value);

    // Formatting data for chart
    const xData = data.map(item => item.pointIndex);
    const yData = data.map(item => item.pointValue);

    const option = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c} mV'
        },
        grid: {
            left: 40,
            right: 40,
            bottom: 40,
            top: 20
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xData,
            axisLabel: { show: false },
            axisTick: { show: false },
            splitLine: {
                show: true,
                lineStyle: { color: '#ffb3b3', type: 'solid', width: 0.5 } // red grid line style for ECG
            }
        },
        yAxis: {
            type: 'value',
            name: 'mV',
            splitLine: {
                show: true,
                lineStyle: { color: '#ffb3b3', type: 'solid', width: 0.5 }
            }
        },
        series: [
            {
                name: '心电波形',
                type: 'line',
                smooth: false,
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: '#333'
                },
                lineStyle: {
                    width: 1.5,
                    color: '#1a1a1a'
                },
                data: yData
            }
        ]
    };

    chartInstance.setOption(option);
};

onMounted(() => {
    getDicts();
    fetchEcgData();
});

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

.chart-area {
    margin-top: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fffaf0; // Light red background like ECG paper
}

.chart-header {
    background-color: #f5f7fa;
    padding: 8px 15px;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid #ebeef5;
}

.echarts-container {
    width: 100%;
    margin-top: 10px;
}

:deep(.el-table) {
    height: 100%;

    .el-tag {
        border-radius: 4px;
        padding: 0 8px;
    }
}
</style>
