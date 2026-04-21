<template>
    <div class="ai-diagnosis-container">
        <div class="page-header">
            <!-- <h2 class="page-title">AI诊断中心</h2> -->
            <div class="header-actions">
                <el-tag
                    :type="aiStatus.engineStatus === 'RUNNING' ? 'success' : (aiStatus.engineStatus === 'PENDING' ? 'warning' : 'info')"
                    effect="light" round>
                    {{ aiStatus.engineStatusText }} {{ aiStatus.engineVersion ? `(v${aiStatus.engineVersion})` : '' }}
                </el-tag>
                <span class="last-update">最后更新: {{ currentTime }}</span>
            </div>
        </div>

        <!-- 顶部数据概览 -->
        <el-row :gutter="20" class="stat-cards">
            <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
                        <el-icon :color="stat.color">
                            <component :is="stat.icon" />
                        </el-icon>
                    </div>
                    <div class="stat-info">
                        <div class="stat-title">{{ stat.title }}</div>
                        <div class="stat-value">{{ stat.value }}<span v-if="stat.unit" class="unit">{{ stat.unit
                                }}</span></div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" class="charts-row">
            <!-- 异常趋势图 -->
            <el-col :span="16">
                <el-card shadow="never" class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>近期心电预警检出趋势</span>
                            <el-radio-group v-model="trendPeriod" size="small">
                                <el-radio-button label="7天" />
                                <el-radio-button label="15天" />
                                <el-radio-button label="30天" />
                            </el-radio-group>
                        </div>
                    </template>
                    <div ref="trendChartRef" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 诊断分布图 -->
            <el-col :span="8">
                <el-card shadow="never" class="chart-card">
                    <template #header>
                        <div class="card-header">
                            <span>异常类型分布 (AI检出)</span>
                        </div>
                    </template>
                    <div ref="distributionChartRef" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 最新异常预警列表 -->
        <el-card shadow="never" class="table-card">
            <template #header>
                <div class="card-header">
                    <span>AI诊断记录列表</span>
                    <el-button type="primary" link @click="openAllRecordsDialog">查看全部</el-button>
                </div>
            </template>
            <el-table :data="recentAnomalies" style="width: 100%" class="custom-table"
                :header-cell-style="{ background: '#f8fafc', color: '#475569' }">
                <el-table-column prop="diagnosisId" label="诊断编号" width="140" show-overflow-tooltip />
                <el-table-column prop="ecgNo" label="心电图编号" width="140" show-overflow-tooltip />
                <el-table-column prop="patientInfo" label="患者信息" width="140" show-overflow-tooltip />
                <el-table-column prop="hospitalNo" label="住院号" width="120" />
                <el-table-column prop="deptName" label="科室" width="140" show-overflow-tooltip />
                <el-table-column prop="aiVersion" label="AI版本" width="100" />
                <el-table-column prop="aiConclusion" label="诊断结论" min-width="200" show-overflow-tooltip>
                    <template #default="scope">
                        <span class="anomaly-type">{{ scope.row.aiConclusion }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="abnormalCount" label="异常数量" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.abnormalCount > 0 ? 'danger' : 'info'" size="small" effect="plain"
                            v-if="scope.row.abnormalCount > 0">
                            {{ scope.row.abnormalCount }} 项
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="confidence" label="置信度" width="160">
                    <template #default="scope">
                        <el-progress :percentage="scope.row.confidence" :color="getConfidenceColor" :stroke-width="8" />
                    </template>
                </el-table-column>
                <el-table-column prop="diagnosisTime" label="诊断时间" width="180">
                    <template #default="scope">
                        {{ scope.row.diagnosisTime?.replace('T', ' ') }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === '待审核' ? 'warning' : 'success'" size="small">
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="140" align="center">
                    <template #default="scope">
                        <el-button link type="primary" size="small"
                            @click="openDetailDialog(scope.row)">查看详情</el-button>
                        <el-button link type="primary" size="small" :disabled="scope.row.status === '已审核'"
                            @click="openReviewDialog(scope.row)">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 查看全部弹窗 -->
        <el-dialog v-model="allRecordsVisible" title="全部AI诊断记录" width="90%" top="5vh" destroy-on-close>
            <div class="search-bar" style="margin-bottom: 20px; display: flex; gap: 10px;">
                <el-input v-model="allRecordsParams.ecgNo" placeholder="心电图编号" style="width: 180px" clearable
                    @keyup.enter="handleSearchAll" />
                <el-input v-model="allRecordsParams.patientName" placeholder="患者姓名" style="width: 150px" clearable
                    @keyup.enter="handleSearchAll" />
                <el-select v-model="allRecordsParams.status" placeholder="审核状态" clearable style="width: 120px"
                    @change="handleSearchAll">
                    <el-option label="待审核" value="待审核"></el-option>
                    <el-option label="已审核" value="已审核"></el-option>
                </el-select>
                <el-button type="primary" :icon="Search" @click="handleSearchAll">查询</el-button>
            </div>

            <el-table v-loading="allRecordsLoading" :data="allRecordsData" style="width: 100%"
                :header-cell-style="{ background: '#f8fafc', color: '#475569' }" height="55vh">
                <el-table-column prop="diagnosisId" label="诊断编号" width="140" show-overflow-tooltip />
                <el-table-column prop="ecgNo" label="心电图编号" width="140" show-overflow-tooltip />
                <el-table-column prop="patientInfo" label="患者信息" width="140" show-overflow-tooltip />
                <el-table-column prop="hospitalNo" label="住院号" width="120" />
                <el-table-column prop="deptName" label="科室" width="140" show-overflow-tooltip />
                <el-table-column prop="aiVersion" label="AI版本" width="100" />
                <el-table-column prop="aiConclusion" label="诊断结论" min-width="200" show-overflow-tooltip>
                    <template #default="scope">
                        <span class="anomaly-type">{{ scope.row.aiConclusion }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="abnormalCount" label="异常数量" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.abnormalCount > 0 ? 'danger' : 'info'" size="small" effect="plain"
                            v-if="scope.row.abnormalCount > 0">
                            {{ scope.row.abnormalCount }} 项
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="confidence" label="置信度" width="160">
                    <template #default="scope">
                        <el-progress :percentage="scope.row.confidence" :color="getConfidenceColor" :stroke-width="8" />
                    </template>
                </el-table-column>
                <el-table-column prop="diagnosisTime" label="诊断时间" width="180">
                    <template #default="scope">
                        {{ scope.row.diagnosisTime?.replace('T', ' ') }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.status === '待审核' ? 'warning' : 'success'" size="small">
                            {{ scope.row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="140" align="center">
                    <template #default="scope">
                        <el-button link type="primary" size="small"
                            @click="openDetailDialog(scope.row)">查看详情</el-button>
                        <el-button link type="primary" size="small" :disabled="scope.row.status === '已审核'"
                            @click="openReviewDialog(scope.row)">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <el-pagination v-model:current-page="allRecordsParams.pageNum"
                    v-model:page-size="allRecordsParams.pageSize" :page-sizes="[10, 20, 50, 100]" background
                    layout="total, sizes, prev, pager, next, jumper" :total="allRecordsTotal"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </el-dialog>

        <!-- 医生审核弹窗 -->
        <el-dialog v-model="reviewDialogVisible" title="人工复核 - 心电图数据" width="80%" top="5vh" destroy-on-close
            @opened="initEcgChart">
            <div class="review-dialog-content">
                <!-- 顶部患者和AI信息 -->
                <div class="review-header">
                    <div class="info-group">
                        <div class="info-item">
                            <span class="label">患者信息：</span>
                            <span class="value">{{ currentReviewingData?.patientInfo }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">诊断编号：</span>
                            <span class="value">{{ currentReviewingData?.diagnosisId }}</span>
                        </div>
                    </div>
                    <div class="ai-result-card">
                        <div class="ai-result-header">
                            <span class="ai-label">AI诊断结论</span>
                            <div class="confidence-wrap">
                                <span class="confidence-label">置信度:</span>
                                <el-progress :percentage="currentReviewingData?.confidence || 0"
                                    :color="getConfidenceColor" />
                            </div>
                        </div>
                        <div class="ai-conclusion-text">{{ currentReviewingData?.aiConclusion }}</div>
                    </div>
                </div>

                <!-- 模拟心电图片段区域 -->
                <div class="ecg-viewer-area">
                    <div class="ecg-title">12导联心电波形采集数据 (片段)</div>
                    <div ref="ecgChartRef" class="ecg-chart-container"></div>
                </div>

                <!-- 医生审核意见 -->
                <div class="doctor-review-form">
                    <div class="form-title">医生最终诊断意见</div>
                    <el-input v-model="doctorConclusion" type="textarea" :rows="4"
                        placeholder="请输入复核意见，若确认无误可直接采用AI结论..."></el-input>
                    <div class="quick-actions">
                        <el-button size="small"
                            @click="doctorConclusion = currentReviewingData?.aiConclusion">一键采用AI结论</el-button>
                        <el-button size="small" @click="doctorConclusion = '正常心电图'">标记为正常</el-button>
                    </div>
                </div>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reviewDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitReview">确认复核完成</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 查看详情对话框 -->
        <el-dialog v-model="detailVisible" title="分析详情" width="850px">
            <div class="detail-content" v-if="detailData">
                <el-descriptions title="基础信息" :column="2" border>
                    <el-descriptions-item label="心电图编号">{{ detailData.ecgNo }}</el-descriptions-item>
                    <el-descriptions-item label="病人ID">{{ detailData.patientId }}</el-descriptions-item>
                    <el-descriptions-item label="病人姓名">{{ detailData.patientName }}</el-descriptions-item>
                    <el-descriptions-item label="性别 / 年龄">{{ detailData.gender }} / {{ detailData.age
                    }}岁</el-descriptions-item>
                    <el-descriptions-item label="住院号">{{ detailData.hospitalNo }}</el-descriptions-item>
                    <el-descriptions-item label="科室">{{ detailData.deptName }}</el-descriptions-item>
                    <el-descriptions-item label="采集时间" :span="2">{{ detailData.collectionStartTime?.replace('T', ' ') }}
                        至 {{
                            detailData.collectionEndTime?.replace('T', ' ') }}</el-descriptions-item>
                </el-descriptions>

                <el-descriptions title="诊断信息" :column="2" border style="margin-top: 20px;">
                    <el-descriptions-item label="诊断编号">{{ detailData.diagnosisId }}</el-descriptions-item>
                    <el-descriptions-item label="AI版本">{{ detailData.aiVersion }}</el-descriptions-item>
                    <el-descriptions-item label="诊断时间" :span="2">{{ detailData.diagnosisTime?.replace('T', ' ')
                    }}</el-descriptions-item>
                    <el-descriptions-item label="心率">{{ detailData.heartRate }} bpm</el-descriptions-item>
                    <el-descriptions-item label="PR间期">{{ detailData.prInterval }} ms</el-descriptions-item>
                    <el-descriptions-item label="QRS时限">{{ detailData.qrsDuration }} ms</el-descriptions-item>
                    <el-descriptions-item label="QT间期">{{ detailData.qtInterval }} ms</el-descriptions-item>
                    <el-descriptions-item label="QTc间期">{{ detailData.qtcInterval }} ms</el-descriptions-item>
                    <el-descriptions-item label="异常类型">{{ detailData.abnormalType || '-' }}</el-descriptions-item>
                    <el-descriptions-item label="异常数量">{{ detailData.abnormalCount }} 项</el-descriptions-item>
                    <el-descriptions-item label="置信度">{{ detailData.confidence }}%</el-descriptions-item>
                    <el-descriptions-item label="AI结论" :span="2">{{ detailData.aiConclusion }}</el-descriptions-item>
                    <el-descriptions-item label="当前状态">
                        <el-tag :type="detailData.status === '已审核' ? 'success' : 'warning'" size="small">{{
                            detailData.status
                        }}</el-tag>
                    </el-descriptions-item>
                </el-descriptions>

                <el-descriptions title="医生审核信息" :column="2" border style="margin-top: 20px;"
                    v-if="detailData.status === '已审核' || detailData.auditDoctorName">
                    <el-descriptions-item label="审核医生">{{ detailData.auditDoctorName }}</el-descriptions-item>
                    <el-descriptions-item label="审核时间">{{ detailData.auditTime?.replace('T', ' ')
                    }}</el-descriptions-item>
                    <el-descriptions-item label="医生结论" :span="2">{{ detailData.doctorConclusion
                    }}</el-descriptions-item>
                    <el-descriptions-item label="医生建议" :span="2">{{ detailData.doctorSuggestion
                    }}</el-descriptions-item>
                    <el-descriptions-item label="审核意见" :span="2">{{ detailData.auditOpinion }}</el-descriptions-item>
                </el-descriptions>

                <div v-if="detailData.abnormalPointList && detailData.abnormalPointList.length > 0"
                    style="margin-top: 20px;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1e293b;">异常波段列表</div>
                    <el-table :data="detailData.abnormalPointList" border size="small" style="width: 100%">
                        <el-table-column prop="pointIndex" label="片段索引" width="100" align="center" />
                        <el-table-column prop="pointType" label="类型" width="120" />
                        <el-table-column prop="level" label="风险等级" width="100" align="center">
                            <template #default="scope">
                                <el-tag
                                    :type="scope.row.level === '高危' ? 'danger' : (scope.row.level === '中危' ? 'warning' : 'info')"
                                    size="small">
                                    {{ scope.row.level }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="异常描述" />
                    </el-table>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { DataLine, Warning, TrendCharts, Coordinate, Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { apiAiDiagnosisPage, apiAiDiagnosisDetail, apiAiDiagnosisAudit, apiAiDiagnosisEngineStatus, apiAiDiagnosisWarningTrend, apiAiDiagnosisAbnormalTypeRatio } from '@/apis/ai-diagnosis';

const currentTime = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
let timer = null;

// 弹窗与审核相关状态
const reviewDialogVisible = ref(false);
const currentReviewingData = ref(null);
const doctorConclusion = ref('');
const ecgChartRef = ref(null);
let ecgChart = null;

const detailVisible = ref(false);
const detailData = ref(null);

const openDetailDialog = async (row) => {
    try {
        const res = await apiAiDiagnosisDetail(row.diagnosisId);
        if (res.code === 200 || res.code === 0) {
            detailData.value = res.data;
            detailVisible.value = true;
        } else {
            ElMessage.error(res.msg || res.message || '获取详情失败');
        }
    } catch (error) {
        console.error('获取详情失败:', error);
        ElMessage.error('获取详情失败');
    }
};

const openReviewDialog = (row) => {
    currentReviewingData.value = row;
    doctorConclusion.value = '';
    reviewDialogVisible.value = true;
};

const initEcgChart = () => {
    if (!ecgChartRef.value) return;
    if (ecgChart) ecgChart.dispose();

    ecgChart = echarts.init(ecgChartRef.value);

    // 模拟 ECG 数据
    const dataSize = 1000;
    const xAxisData = [];
    const yAxisData = [];
    for (let i = 0; i < dataSize; i++) {
        xAxisData.push(i);
        // 生成一个简单的基础波形 + 偶尔的 QRS 波群
        let v;
        if (i % 200 > 180 && i % 200 < 190) {
            v = Math.random() * 8 + 5; // R 波
        } else if (i % 200 > 170 && i % 200 <= 180) {
            v = -Math.random() * 3 - 1; // Q 波
        } else if (i % 200 >= 190 && i % 200 < 200) {
            v = -Math.random() * 2 - 1; // S 波
        } else {
            v = Math.sin(i / 10) * 0.5 + (Math.random() * 0.2 - 0.1); // 基线漂移与微噪音
            if (currentReviewingData.value?.abnormalCount > 0 && Math.random() < 0.05) {
                v += 1.5; // 模拟些许异常抖动
            }
        }
        yAxisData.push(v);
    }

    const option = {
        title: {
            text: 'Lead II (示例模拟波形)',
            textStyle: { fontSize: 12, color: '#64748b' },
            top: 10,
            left: 10
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            axisLabel: { show: false },
            axisLine: { show: true, lineStyle: { color: '#e2e8f0' } },
            splitLine: { show: true, lineStyle: { color: '#cbd5e1', type: 'solid', opacity: 0.3 } }, // 模拟心电图纸网格
        },
        yAxis: {
            type: 'value',
            min: -10,
            max: 15,
            axisLabel: { show: false },
            splitLine: { show: true, lineStyle: { color: '#cbd5e1', type: 'solid', opacity: 0.3 } }, // 模拟心电图纸网格
        },
        series: [
            {
                name: 'mV',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: { color: '#10b981' }, // 绿色波形比较常见于监护仪
                lineStyle: { width: 1.5 },
                data: yAxisData
            }
        ]
    };
    ecgChart.setOption(option);
};

const submitReview = async () => {
    if (!doctorConclusion.value) {
        ElMessage.warning('请输入复核意见');
        return;
    }

    try {
        const res = await apiAiDiagnosisAudit({
            diagnosisId: currentReviewingData.value.diagnosisId,
            doctorConclusion: doctorConclusion.value
        });

        if (res.code === 200 || res.code === 0) {
            ElMessage.success(`复核完成`);
            reviewDialogVisible.value = false;
            // 刷新列表和概览数据
            fetchEngineStatus();
            fetchWarningTrend();
            fetchRecentAnomalies();
            if (allRecordsVisible.value) {
                loadAllRecords();
            }
        } else {
            ElMessage.error(res.msg || res.message || '复核失败');
        }
    } catch (error) {
        console.error('复核异常:', error);
        ElMessage.error('复核发生异常');
    }
};

const aiStatus = reactive({
    engineStatus: 'RUNNING',
    engineStatusText: 'AI 引擎运行正常',
    engineVersion: 'v1.0.0',
});

const statistics = ref([
    { title: '运行实例数', value: '0', unit: '个', icon: DataLine, color: '#409EFF', bgColor: '#ecf5ff', prop: 'runningInstanceCount' },
    { title: '队列积压任务', value: '0', unit: '个', icon: Warning, color: '#F56C6C', bgColor: '#fef0f0', prop: 'queueBacklogCount' },
    { title: '今日完成分析', value: '0', unit: '份', icon: TrendCharts, color: '#E6A23C', bgColor: '#fdf6ec', prop: 'todayAnalysisCount' },
    { title: '今日平均分析耗时', value: '0', unit: '秒', icon: Coordinate, color: '#67C23A', bgColor: '#f0f9eb', prop: 'avgAnalysisSeconds' },
]);

const fetchEngineStatus = async () => {
    try {
        const res = await apiAiDiagnosisEngineStatus();
        const data = res.data || {};

        aiStatus.engineStatus = data.engineStatus || 'RUNNING';
        aiStatus.engineStatusText = data.engineStatusText || 'AI 引擎运行正常';
        aiStatus.engineVersion = data.engineVersion || '';

        statistics.value.forEach(stat => {
            if (data[stat.prop] !== undefined) {
                stat.value = data[stat.prop];
            }
        });
    } catch (error) {
        console.error('获取AI诊断引擎状态失败', error);
    }
};

const fetchWarningTrend = async () => {
    try {
        const res = await apiAiDiagnosisWarningTrend();
        const data = res.data || {};

        const dateList = data.dateList || [];
        const pendingAuditList = data.pendingAuditList || [];
        const passList = data.passList || [];
        const rejectList = data.rejectList || [];

        if (trendChart) {
            trendChart.setOption({
                xAxis: {
                    data: dateList
                },
                series: [
                    { data: pendingAuditList },
                    { data: passList },
                    { data: rejectList }
                ]
            });
        }
    } catch (error) {
        console.error('获取近期心电预警检出趋势失败', error);
    }
};

const fetchAbnormalTypeRatio = async () => {
    try {
        const res = await apiAiDiagnosisAbnormalTypeRatio();
        const data = res.data || [];
        const pieData = data.map(item => ({
            name: item.abnormalType,
            value: item.count
        }));

        if (distChart) {
            distChart.setOption({
                series: [{
                    data: pieData
                }]
            });
        }
    } catch (error) {
        console.error('获取异常类型分布失败', error);
    }
};

const trendPeriod = ref('30天');
const trendChartRef = ref(null);
const distributionChartRef = ref(null);
let trendChart = null;
let distChart = null;

const recentAnomalies = ref([]);

const fetchRecentAnomalies = async () => {
    try {
        const res = await apiAiDiagnosisPage({ pageNum: 1, pageSize: 5 });
        const data = res.data || res;
        recentAnomalies.value = data.list || data.records || data.rows || [];
    } catch (error) {
        console.error('获取最新诊断记录失败', error);
    }
};

// 查看全部逻辑
const allRecordsVisible = ref(false);
const allRecordsData = ref([]);
const allRecordsTotal = ref(0);
const allRecordsLoading = ref(false);

const allRecordsParams = reactive({
    ecgNo: '',
    patientName: '',
    status: '',
    pageNum: 1,
    pageSize: 10
});

const loadAllRecords = async () => {
    allRecordsLoading.value = true;
    try {
        const res = await apiAiDiagnosisPage(allRecordsParams);
        const data = res.data || res;
        allRecordsData.value = data.list || data.records || data.rows || [];
        allRecordsTotal.value = data.total || 0;
    } catch (error) {
        console.error('获取所有诊断记录失败', error);
    } finally {
        allRecordsLoading.value = false;
    }
};

const openAllRecordsDialog = () => {
    allRecordsVisible.value = true;
    Object.assign(allRecordsParams, {
        ecgNo: '',
        patientName: '',
        status: '',
        pageNum: 1,
        pageSize: 10
    });
    loadAllRecords();
};

const handleSearchAll = () => {
    allRecordsParams.pageNum = 1;
    loadAllRecords();
};

const handleSizeChange = (val) => {
    allRecordsParams.pageSize = val;
    loadAllRecords();
};

const handleCurrentChange = (val) => {
    allRecordsParams.pageNum = val;
    loadAllRecords();
};

const getConfidenceColor = (percentage) => {
    if (percentage >= 95) return '#10b981'; // 绿
    if (percentage >= 85) return '#f59e0b'; // 黄
    return '#ef4444'; // 红
};

const initCharts = () => {
    // 趋势图配置 (模仿大厂监控风格)
    trendChart = echarts.init(trendChartRef.value);
    const trendOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['待审核', '审核通过', '审核驳回'], bottom: 0, icon: 'circle' },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [], // 动态获取
            axisLine: { lineStyle: { color: '#e2e8f0' } },
            axisLabel: { color: '#64748b' }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
            axisLabel: { color: '#64748b' }
        },
        series: [
            {
                name: '待审核',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#fbbf24' },
                data: []
            },
            {
                name: '审核通过',
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(56, 189, 248, 0.4)' },
                        { offset: 1, color: 'rgba(56, 189, 248, 0.01)' }
                    ])
                },
                lineStyle: { width: 3 },
                itemStyle: { color: '#38bdf8' },
                data: []
            },
            {
                name: '审核驳回',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#fb7185' },
                data: []
            }
        ]
    };
    trendChart.setOption(trendOption);

    // 分布图配置 (南丁格尔玫瑰图)
    distChart = echarts.init(distributionChartRef.value);
    const distOption = {
        tooltip: { trigger: 'item', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0' },
        legend: {
            top: 'bottom'
        },
        toolbox: {
            show: true,
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        series: [
            {
                name: '异常类型分布',
                type: 'pie',
                radius: [20, 100], // 适配当前容器大小
                center: ['50%', '45%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                data: []
            }
        ]
    };
    distChart.setOption(distOption);
};

const resizeWindow = () => {
    trendChart?.resize();
    distChart?.resize();
};

onMounted(() => {
    fetchEngineStatus();
    fetchRecentAnomalies();
    timer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    }, 1000);

    nextTick(() => {
        initCharts();
        fetchWarningTrend();
        fetchAbnormalTypeRatio();
        window.addEventListener('resize', resizeWindow);
    });
});

onUnmounted(() => {
    clearInterval(timer);
    window.removeEventListener('resize', resizeWindow);
    trendChart?.dispose();
    distChart?.dispose();
});
</script>

<style lang="scss" scoped>
.ai-diagnosis-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        letter-spacing: 0.5px;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;

        .last-update {
            font-size: 13px;
            color: #94a3b8;
        }
    }
}

/* 顶部卡片 */
.stat-cards {
    .stat-card {
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
            transform: translateY(-2px);
        }

        :deep(.el-card__body) {
            display: flex;
            align-items: center;
            padding: 24px;
        }

        .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 20px;

            .el-icon {
                font-size: 26px;
            }
        }

        .stat-info {
            flex: 1;

            .stat-title {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 6px;
            }

            .stat-value {
                font-size: 28px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1;
                margin-bottom: 8px;

                .unit {
                    font-size: 14px;
                    font-weight: normal;
                    color: #94a3b8;
                    margin-left: 6px;
                }
            }

            .stat-trend {
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 2px;
                font-weight: 500;

                &.up {
                    color: #ef4444;
                }

                &.down {
                    color: #10b981;
                }
            }
        }
    }
}

/* 图表区域 */
.chart-card {
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);

    :deep(.el-card__header) {
        border-bottom: 1px solid #f8fafc;
        padding: 16px 20px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
    }

    .chart-container {
        height: 340px;
        width: 100%;
    }
}

/* 表格区域 */
.table-card {
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    margin-bottom: 10px;

    :deep(.el-card__header) {
        border-bottom: 1px solid #f8fafc;
        padding: 16px 20px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
    }

    .anomaly-type {
        font-weight: 600;
        color: #334155;
    }

    .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;

        &.pending {
            background-color: #ef4444;
            box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
            animation: pulse 2s infinite;
        }

        &.done {
            background-color: #10b981;
        }
    }
}

/* 医生审核弹窗样式 */
.review-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 10px;

    .review-header {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .info-group {
            display: flex;
            gap: 24px;
            font-size: 14px;
            color: #475569;

            .info-item {
                .label {
                    color: #94a3b8;
                }

                .value {
                    font-weight: 500;
                    color: #1e293b;
                }
            }
        }

        .ai-result-card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;

            .ai-result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;

                .ai-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #3b82f6;
                }

                .confidence-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 200px;
                    font-size: 13px;
                    color: #64748b;

                    .el-progress {
                        width: 140px;
                    }
                }
            }

            .ai-conclusion-text {
                font-size: 16px;
                font-weight: 600;
                color: #ef4444;
                /* 这里通常展示危急值 */
            }
        }
    }

    .ecg-viewer-area {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        overflow: hidden;

        .ecg-title {
            background-color: #1e293b;
            color: #fff;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
        }

        .ecg-chart-container {
            height: 280px;
            background-color: #f1f5f9;
            /* 模拟深黑色或浅色监护仪底色 */
            background-image:
                linear-gradient(#e2e8f0 1px, transparent 1px),
                linear-gradient(90deg, #e2e8f0 1px, transparent 1px),
                linear-gradient(#cbd5e1 1px, transparent 1px),
                linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
            background-size: 10px 10px, 10px 10px, 50px 50px, 50px 50px;
            /* 模拟标准心电图小方格和大方格 */
        }
    }

    .doctor-review-form {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .form-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
        }

        .quick-actions {
            display: flex;
            gap: 10px;
            margin-top: 4px;
        }
    }
}

.dialog-footer {
    .el-button {
        margin-left: 12px;
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }

    70% {
        box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}

:deep(.custom-table) {
    border-radius: 8px;

    th.el-table__cell {
        font-weight: 600;
        border-bottom: 1px solid #e2e8f0;
    }

    td.el-table__cell {
        border-bottom: 1px solid #f1f5f9;
    }

    .el-table__row:hover>td.el-table__cell {
        background-color: #f8fafc;
    }
}
</style>
