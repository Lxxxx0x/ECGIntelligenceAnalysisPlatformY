<template>
    <div class="ai-diagnosis-container">
        <div class="page-header">
            <!-- <h2 class="page-title">AI诊断中心</h2> -->
            <div class="header-actions">
                <el-tag type="success" effect="light" round>AI 引擎运行正常</el-tag>
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
                        <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
                            同比 {{ Math.abs(stat.trend) }}%
                            <el-icon>
                                <Top v-if="stat.trend > 0" />
                                <Bottom v-else />
                            </el-icon>
                        </div>
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
                    <el-button type="primary" link>查看全部</el-button>
                </div>
            </template>
            <el-table :data="recentAnomalies" style="width: 100%" class="custom-table"
                :header-cell-style="{ background: '#f8fafc', color: '#475569' }">
                <el-table-column prop="diagnosisId" label="诊断编号" width="120" show-overflow-tooltip />
                <el-table-column prop="ecgId" label="心电图编号" width="120" show-overflow-tooltip />
                <el-table-column prop="patientInfo" label="患者信息" width="140" />
                <el-table-column prop="hospitalNo" label="住院号" width="100" />
                <el-table-column prop="department" label="科室" width="120" show-overflow-tooltip />
                <el-table-column prop="aiVersion" label="AI版本" width="100" />
                <el-table-column prop="diagnosisConclusion" label="诊断结论" min-width="180" show-overflow-tooltip>
                    <template #default="scope">
                        <span class="anomaly-type">{{ scope.row.diagnosisConclusion }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="anomalyCount" label="异常数量" width="90" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.anomalyCount > 0 ? 'danger' : 'info'" size="small" effect="plain"
                            v-if="scope.row.anomalyCount > 0">
                            {{ scope.row.anomalyCount }} 项
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="confidence" label="置信度" width="160">
                    <template #default="scope">
                        <el-progress :percentage="scope.row.confidence" :color="getConfidenceColor" :stroke-width="8" />
                    </template>
                </el-table-column>
                <el-table-column prop="diagnosisTime" label="诊断时间" width="160" />
                <el-table-column label="操作" fixed="right" width="140">
                    <template #default="scope">
                        <el-button link type="primary" size="small">查看详情</el-button>
                        <el-button link type="primary" size="small" @click="openReviewDialog(scope.row)">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

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
                        <div class="ai-conclusion-text">{{ currentReviewingData?.diagnosisConclusion }}</div>
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
                            @click="doctorConclusion = currentReviewingData?.diagnosisConclusion">一键采用AI结论</el-button>
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
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Top, Bottom, DataLine, Warning, TrendCharts, Coordinate } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';

const currentTime = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
let timer = null;

// 弹窗与审核相关状态
const reviewDialogVisible = ref(false);
const currentReviewingData = ref(null);
const doctorConclusion = ref('');
const ecgChartRef = ref(null);
let ecgChart = null;

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
            if (currentReviewingData.value?.anomalyCount > 0 && Math.random() < 0.05) {
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

const submitReview = () => {
    if (!doctorConclusion.value) {
        ElMessage.warning('请输入复核意见');
        return;
    }
    ElMessage.success(`复核完成，诊断意见：${doctorConclusion.value}`);
    reviewDialogVisible.value = false;
};

const statistics = ref([
    { title: '今日AI分析总量', value: '4,285', unit: '份', icon: DataLine, color: '#409EFF', bgColor: '#ecf5ff', trend: 12.5 },
    { title: '高危预警拦截', value: '186', unit: '次', icon: Warning, color: '#F56C6C', bgColor: '#fef0f0', trend: 3.2 },
    { title: '异常检出率', value: '14.2', unit: '%', icon: TrendCharts, color: '#E6A23C', bgColor: '#fdf6ec', trend: -1.5 },
    { title: 'AI模型准确度', value: '98.5', unit: '%', icon: Coordinate, color: '#67C23A', bgColor: '#f0f9eb', trend: 0.8 },
]);

const trendPeriod = ref('30天');
const trendChartRef = ref(null);
const distributionChartRef = ref(null);
let trendChart = null;
let distChart = null;

const recentAnomalies = ref([
    { diagnosisId: 'D20240418001', ecgId: 'E10002341', patientInfo: '李** / 男 / 62岁', hospitalNo: '281903', department: '心血管内科', aiVersion: 'v3.2.1', diagnosisConclusion: '急性前壁心肌梗死, 频发性房早', anomalyCount: 2, confidence: 98, diagnosisTime: '2024-04-18 10:42:15' },
    { diagnosisId: 'D20240418002', ecgId: 'E10002342', patientInfo: '王** / 女 / 55岁', hospitalNo: '302111', department: '急诊科', aiVersion: 'v3.2.1', diagnosisConclusion: '阵发性室性心动过速', anomalyCount: 1, confidence: 95, diagnosisTime: '2024-04-18 10:38:02' },
    { diagnosisId: 'D20240418003', ecgId: 'E10002343', patientInfo: '张** / 男 / 45岁', hospitalNo: '294821', department: '神经内科', aiVersion: 'v3.2.1', diagnosisConclusion: '严重心动过缓 (<40bpm)', anomalyCount: 1, confidence: 91, diagnosisTime: '2024-04-18 10:35:11' },
    { diagnosisId: 'D20240418004', ecgId: 'E10002344', patientInfo: '赵** / 女 / 71岁', hospitalNo: '183922', department: '老年病科', aiVersion: 'v3.2.1', diagnosisConclusion: '心房颤动伴长RR间期, ST-T改变', anomalyCount: 2, confidence: 88, diagnosisTime: '2024-04-18 10:20:45' },
    { diagnosisId: 'D20240418005', ecgId: 'E10002345', patientInfo: '孙** / 男 / 48岁', hospitalNo: '302195', department: '体检中心', aiVersion: 'v3.2.1', diagnosisConclusion: '正常心电图', anomalyCount: 0, confidence: 99, diagnosisTime: '2024-04-18 10:15:30' }
]);



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
        legend: { data: ['总异常预警', '室性心律失常', '缺血性ST-T改变'], bottom: 0, icon: 'circle' },
        grid: { left: '3%', right: '4%', bottom: '15%', top: '8%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['04-12', '04-13', '04-14', '04-15', '04-16', '04-17', '04-18'],
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
                name: '总异常预警',
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
                data: [120, 132, 101, 134, 180, 230, 210]
            },
            {
                name: '室性心律失常',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#fb7185' },
                data: [20, 32, 21, 34, 65, 45, 30]
            },
            {
                name: '缺血性ST-T改变',
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2 },
                itemStyle: { color: '#fbbf24' },
                data: [40, 50, 45, 60, 55, 80, 70]
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
                data: [
                    { value: 40, name: '心房颤动' },
                    { value: 38, name: '室性早搏' },
                    { value: 32, name: 'ST-T改变' },
                    { value: 30, name: '心动过缓' },
                    { value: 28, name: '传导阻滞' },
                    { value: 26, name: '室性心动过速' },
                    { value: 22, name: '房性早搏' },
                    { value: 18, name: '其他异常' }
                ]
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
    timer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    }, 1000);

    nextTick(() => {
        initCharts();
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
