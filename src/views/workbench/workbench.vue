<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from "vue";
import * as echarts from "echarts";
import { apiDashboardCoreMetrics, apiWarningLevelDistribution, apiWarningTypeWardTop, apiWarningTrend7d, apiPendingWarningsPage, apiLatestEcgPage, apiWarningDetail, apiIncludeWarning, apiEligiblePushCount } from "@/apis/workbench";
import { apigetSearchDicts } from "@/apis/search";
import { ElMessage } from "element-plus";
import { Promotion } from "@element-plus/icons-vue";

defineOptions({
    name: "WorkbenchIndex",
});

const rulesDrawerVisible = ref(false);
const rulesForm = ref({
    warningLevels: ['低危', '中危', '高危'],
    warningTypes: ['ST段抬高异常', '室性心动过速风险', '室性早搏增多', '房颤发作倾向', '短暂心率升高'],
    wardIds: ['ALL']
});
const wardOptions = ref([]);
const eligiblePatientCount = ref(0);

const fetchEligiblePushCount = async () => {
    try {
        const payload = {
            warningLevels: rulesForm.value.warningLevels.join(','),
            warningTypes: rulesForm.value.warningTypes.join(','),
            wardIds: rulesForm.value.wardIds.includes('ALL') ? '' : rulesForm.value.wardIds.join(',')
        };
        const res = await apiEligiblePushCount(payload);
        if (res.code === 0 && res.data) {
            eligiblePatientCount.value = res.data.eligibleCount ?? 0;
        } else {
            eligiblePatientCount.value = res.eligibleCount ?? 0;
        }
    } catch (err) {
        console.error("加载符合条件的患者数量失败", err);
    }
};

watch(rulesForm, () => {
    if (rulesDrawerVisible.value) {
        fetchEligiblePushCount();
    }
}, { deep: true });

const handleWardChange = (val) => {
    if (val.length > 0 && val[val.length - 1] === 'ALL') {
        rulesForm.value.wardIds = ['ALL'];
    } else if (val.includes('ALL')) {
        rulesForm.value.wardIds = val.filter(v => v !== 'ALL');
    }
};

const loadWards = async () => {
    try {
        const res = await apigetSearchDicts();
        let options = [];
        if (res.code === 0 && res.data) {
            options = res.data.wardOptions || [];
        } else {
            options = res.data?.wardOptions || res.wardOptions || [];
        }
        // 过滤掉接口可能自带的'全部病区'选项，避免重复
        options = options.filter(item => item.label !== '全部病区');
        wardOptions.value = [{ label: '全部病区', value: 'ALL' }, ...options];
    } catch (err) {
        console.error("加载病区数据失败", err);
    }
};

const openRulesDrawer = () => {
    rulesDrawerVisible.value = true;
    if (wardOptions.value.length === 0) {
        loadWards();
    }
    fetchEligiblePushCount();
};

const handleConfirmPush = () => {
    rulesDrawerVisible.value = false;
    loadData();
    // 可以在这里获取 rulesForm.value.wardIds
};

const getPrimaryColor = () => {
    return document.documentElement.style.getPropertyValue("--el-color-primary") || "#3582e6";
};

// 顶部时间筛选
const dateRange = ref([]);
const activeDateBtn = ref("本年");
const dateBtns = ["今天", "本周", "本月", "本年", "自定义"];

// 计算时间范围
const getQueryParams = () => {
    const now = new Date();
    const format = (d, isEnd) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day} ${isEnd ? '23:59:59' : '00:00:00'}`;
    };

    let startObj = new Date(now);
    let endObj = new Date(now);

    if (activeDateBtn.value === "本周") {
        const day = now.getDay() || 7;
        startObj.setDate(now.getDate() - day + 1);
        endObj.setDate(startObj.getDate() + 6);
    } else if (activeDateBtn.value === "本月") {
        startObj = new Date(now.getFullYear(), now.getMonth(), 1);
        endObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (activeDateBtn.value === "本年") {
        startObj = new Date(now.getFullYear(), 0, 1);
        endObj = new Date(now.getFullYear(), 11, 31);
    } else if (activeDateBtn.value === "自定义" && dateRange.value?.length === 2) {
        startObj = new Date(dateRange.value[0]);
        endObj = new Date(dateRange.value[1]);
    }

    return {
        startTime: format(startObj, false),
        endTime: format(endObj, true),
        warningLevels: rulesForm.value.warningLevels,
        warningTypes: rulesForm.value.warningTypes,
        wardIds: rulesForm.value.wardIds.includes('ALL') ? [] : rulesForm.value.wardIds
    };
};

const displayDateStr = computed(() => {
    const { startTime, endTime } = getQueryParams();
    if (startTime && endTime) {
        return `${startTime.split(' ')[0]} 至 ${endTime.split(' ')[0]}`;
    }
    return '';
});

// 监听时间变化重新加载数据
watch([activeDateBtn, dateRange], () => {
    if (activeDateBtn.value === '自定义' && (!dateRange.value || dateRange.value.length !== 2)) {
        return; // 自定义未选择完整日期时不拉取
    }
    loadData();
});

// 统计数据
const stats = ref([
    { label: "心电测量次数", value: 0, unit: "次", key: "ecgTotal" },
    { label: "待分析记录", value: 0, unit: "条", key: "pendingAnalyse" },
    { label: "待审核报告", value: 0, unit: "份", key: "pendingAudit" },
    { label: "异常预警", value: 0, unit: "条", key: "abnormalWarning" },
    { label: "预警总数", value: 0, unit: "条", key: "warningTotal" },
    { label: "报告总数", value: 0, unit: "条", key: "reportTotal" },
    { label: "AI诊断准确率", value: 0, unit: "%", key: "aiAccuracy" },
]);

const activeBottomTab = ref("待处理预警");

// 待处理预警数据
const warningTableData = ref([]);

// 最新心电记录数据
const latestRecordData = ref([]);

// "查看全部" 弹窗
const showAllDialogVisible = ref(false);
const dialogTitle = ref("");
const fullTableData = ref([]);

// "查看详情" 弹窗
const detailDialogVisible = ref(false);
const currentDetail = ref({});
const handleDetail = async (row) => {
    try {
        const id = row.alertId || row.warningId || row.id;
        const res = await apiWarningDetail(id);
        currentDetail.value = res.data?.data || res.data || {};
        detailDialogVisible.value = true;
    } catch (err) {
        console.error("加载预警详情失败", err);
    }
};

// 纳入预警
const handleInclude = async (row) => {
    try {
        await apiIncludeWarning(row.alertId || row.warningId);
        ElMessage.success("纳入成功");
        loadData(); // 重新加载数据
        if (showAllDialogVisible.value && activeBottomTab.value === "待处理预警") {
            handleViewAll(); // 如果在查看全部弹窗中，刷新全量列表
        }
    } catch (err) {
        console.error("纳入预警失败", err);
        ElMessage.error("纳入失败");
    }
};

// ECharts 图表容器引用
const lineChartRef = ref(null);
const barChartRef = ref(null);
const alarmLevelRef = ref(null);
const warningTypeRef = ref(null);

let lineChart = null;
let barChart = null;
let alarmLevelChart = null;
let warningTypeChart = null;

const initCharts = () => {
    const primaryColor = getPrimaryColor();

    // 1. 预警级别分布 (Bar chart with visualMap)
    if (alarmLevelRef.value) {
        alarmLevelChart = echarts.init(alarmLevelRef.value);
        alarmLevelChart.setOption({
            dataset: {
                source: [
                    ['score', 'amount', 'product'],
                    [90, 49, '高危'],
                    [50, 35, '中危'],
                    [10, 27, '低危']
                ]
            },
            grid: { top: 10, bottom: 20, left: 60, right: 30 },
            xAxis: { show: false, name: 'amount' },
            yAxis: { type: 'category', axisLine: { show: false }, axisTick: { show: false } },
            visualMap: {
                orient: 'horizontal',
                left: 'center',
                min: 10,
                max: 100,
                show: false,
                dimension: 0,
                inRange: {
                    color: ['#65B581', '#FFCE34', '#FD665F']
                }
            },
            series: [
                {
                    type: 'bar',
                    barWidth: 20,
                    itemStyle: { borderRadius: 10 },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{@amount}条'
                    },
                    encode: {
                        x: 'amount',
                        y: 'product'
                    }
                }
            ]
        });
    }

    // 2. 预警类型分布 (Nightingale Chart)
    if (warningTypeRef.value) {
        warningTypeChart = echarts.init(warningTypeRef.value);
        warningTypeChart.setOption({
            tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
            legend: {
                left: 'center',
                bottom: '0',
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { fontSize: 12 },
                data: ['心房颤动', 'ST段异常', '心动过缓', '室性早搏', '心动过速', 'QT延长']
            },
            series: [
                {
                    name: '预警类型分布',
                    type: 'pie',
                    radius: [15, 80],
                    center: ['50%', '45%'],
                    roseType: 'area',
                    itemStyle: { borderRadius: 4 },
                    label: { show: false },
                    data: [
                        { value: 32, name: 'ST段异常' },
                        { value: 28, name: '室性早搏' },
                        { value: 23, name: '心房颤动' },
                        { value: 18, name: '心动过速' },
                        { value: 15, name: '心动过缓' },
                        { value: 8, name: 'QT延长' }
                    ]
                }
            ]
        });
    }

    // 3. 周预警趋势 (Line Chart)
    if (lineChartRef.value) {
        lineChart = echarts.init(lineChartRef.value);
        lineChart.setOption({
            tooltip: { trigger: "axis" },
            grid: { top: 30, bottom: 20, left: 40, right: 20 },
            xAxis: {
                type: "category",
                data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
                axisLine: { lineStyle: { color: "#ddd" } },
                axisLabel: { color: "#666" }
            },
            yAxis: {
                type: "value",
                splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
                axisLabel: { color: "#666" }
            },
            series: [
                {
                    name: "预警次数",
                    type: "line",
                    smooth: true,
                    itemStyle: { color: primaryColor },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: `${primaryColor}66` },
                            { offset: 1, color: `${primaryColor}00` }
                        ])
                    },
                    data: [120, 150, 180, 130, 210, 243, 190]
                }
            ]
        });
    }

    // 2. 病区预警排行 (Bar Chart)
    if (barChartRef.value) {
        barChart = echarts.init(barChartRef.value);
        barChart.setOption({
            tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
            grid: { top: 20, bottom: 20, left: 100, right: 30 },
            xAxis: { type: "value", show: false },
            yAxis: {
                type: "category",
                data: ["骨科病区", "消化内科", "神经内科", "急诊病房", "心内科"],
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: "#555", fontSize: 11 }
            },
            series: [
                {
                    type: "bar",
                    barWidth: 15,
                    itemStyle: { color: "#f29c38", borderRadius: [0, 4, 4, 0] },
                    label: { show: true, position: "right", color: "#555", fontSize: 11 },
                    data: [15, 28, 45, 89, 135]
                }
            ]
        });
    }
};

const handleThemeChange = () => {
    if (lineChart) lineChart.setOption({ series: [{ itemStyle: { color: getPrimaryColor() } }] });
    if (barChart) barChart.setOption({ series: [{ itemStyle: { color: "#f29c38" } }] });
};

const handleResize = () => {
    if (lineChart) lineChart.resize();
    if (barChart) barChart.resize();
    if (alarmLevelChart) alarmLevelChart.resize();
    if (warningTypeChart) warningTypeChart.resize();
};

const loadData = async () => {
    try {
        const params = getQueryParams();
        const metricsRes = await apiDashboardCoreMetrics(params);
        const metricsData = metricsRes.data?.data || metricsRes.data;
        if (metricsData) {
            stats.value.forEach(item => {
                if (item.key && metricsData[item.key] !== undefined) {
                    item.value = metricsData[item.key];
                }
            })
        }

        const levelRes = await apiWarningLevelDistribution(params);
        const levelData = levelRes.data?.data || levelRes.data;
        if (levelData && alarmLevelChart) {
            alarmLevelChart.setOption({
                dataset: {
                    source: [
                        ['score', 'amount', 'product'],
                        [90, levelData.highRiskCount || 0, '高危'],
                        [50, levelData.middleRiskCount || 0, '中危'],
                        [10, levelData.lowRiskCount || 0, '低危']
                    ]
                }
            });
        }

        const typeWardRes = await apiWarningTypeWardTop(params);
        const typeWardData = typeWardRes.data?.data || typeWardRes.data;
        if (typeWardData) {
            if (warningTypeChart && typeWardData.warningTypeStats) {
                const legendData = typeWardData.warningTypeStats.map(i => i.warningType);
                const seriesData = typeWardData.warningTypeStats.map(i => ({ value: i.count, name: i.warningType }));
                warningTypeChart.setOption({
                    legend: { data: legendData },
                    series: [{ data: seriesData }]
                });
            }
            if (barChart && typeWardData.wardTopStats) {
                const names = typeWardData.wardTopStats.map(i => i.wardName).reverse();
                const counts = typeWardData.wardTopStats.map(i => i.warningCount).reverse();
                barChart.setOption({
                    yAxis: { data: names },
                    series: [{ data: counts }]
                });
            }
        }

        const trendRes = await apiWarningTrend7d(params);
        const trendData = trendRes.data?.data || trendRes.data;
        if (trendData && lineChart) {
            lineChart.setOption({
                xAxis: { data: trendData.dateList || [] },
                series: [{ data: trendData.warningCountList || [] }]
            });
        }

        // 加载待处理预警数据 (默认展示5条)
        const warnRes = await apiPendingWarningsPage({ ...params, pageNum: 1, pageSize: 5 });
        const warnData = warnRes.data?.data || warnRes.data;
        if (warnData && warnData.list) {
            warningTableData.value = warnData.list;
        }

        // 加载最新心电记录数据 (默认展示5条)
        const ecgRes = await apiLatestEcgPage({ ...params, pageNum: 1, pageSize: 5 });
        const ecgData = ecgRes.data?.data || ecgRes.data;
        if (ecgData && ecgData.list) {
            latestRecordData.value = ecgData.list;
        }
    } catch (err) {
        console.error("加载大屏数据失败", err);
    }
}

const handleViewAll = async () => {
    dialogTitle.value = activeBottomTab.value;
    fullTableData.value = [];
    showAllDialogVisible.value = true;

    // 打开弹框时加载全量数据 (最多 200 条)
    const params = getQueryParams();
    try {
        if (activeBottomTab.value === "待处理预警") {
            const res = await apiPendingWarningsPage({ ...params, pageNum: 1, pageSize: 200 });
            const data = res.data?.data || res.data;
            if (data && data.list) {
                fullTableData.value = data.list;
            }
        } else {
            const res = await apiLatestEcgPage({ ...params, pageNum: 1, pageSize: 200 });
            const data = res.data?.data || res.data;
            if (data && data.list) {
                fullTableData.value = data.list;
            }
        }
    } catch (err) {
        console.error("加载全部数据失败", err);
    }
};

onMounted(() => {
    nextTick(() => {
        initCharts();
        loadData();
    });
    window.addEventListener("theme-changed", handleThemeChange);
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    window.removeEventListener("theme-changed", handleThemeChange);
    window.removeEventListener("resize", handleResize);
    if (lineChart) lineChart.dispose();
    if (barChart) barChart.dispose();
    if (alarmLevelChart) alarmLevelChart.dispose();
    if (warningTypeChart) warningTypeChart.dispose();
});
</script>

<template>
    <div class="workbench-container">
        <!-- 顶部数据概览面板 -->
        <div class="panel header-panel">
            <!-- 筛选栏 -->
            <div class="filter-row">
                <span class="label">统计时间范围：</span>
                <div class="date-buttons">
                    <span v-for="btn in dateBtns" :key="btn" :class="['date-btn', { active: activeDateBtn === btn }]"
                        @click="activeDateBtn = btn">
                        {{ btn }}
                    </span>
                </div>
                <el-date-picker v-if="activeDateBtn === '自定义'" v-model="dateRange" type="daterange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" size="small"
                    style="width: 240px; margin-left: 12px;" />
                <div v-else class="date-display">
                    {{ displayDateStr }}
                </div>
            </div>

            <!-- 核心统栏 -->
            <div class="stats-wrapper" style="display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="display: flex; gap: 60px;">
                    <div class="stat-item" v-for="(item, i) in stats" :key="i">
                        <div class="stat-title">{{ item.label }}</div>
                        <div class="stat-number">
                            <span class="val">{{ item.value }}</span>
                            <span class="unit">{{ item.unit }}</span>
                        </div>
                    </div>
                </div>
                <el-button type="primary" @click="openRulesDrawer">
                    <el-icon style="margin-right: 4px;">
                        <Promotion />
                    </el-icon>推送规则
                </el-button>
            </div>
        </div>

        <!-- 图片四个模块的可视化面板 -->
        <div class="custom-card-grid">
            <div class="chart-row">
                <!-- 模块1: 预警级别分布 (Bar Chart + visualMap) -->
                <div class="panel flex-1">
                    <div class="panel-title" style="font-weight:bold; margin-bottom:10px;">预警级别分布</div>
                    <div ref="alarmLevelRef" style="height: 200px;"></div>
                </div>
                <!-- 模块2: 预警类型分布 (Nightingale Pie Chart) -->
                <div class="panel flex-1">
                    <div class="panel-title" style="font-weight:bold; margin-bottom:10px;">预警类型分布</div>
                    <div ref="warningTypeRef" style="height: 200px;"></div>
                </div>
            </div>

            <div class="chart-row mt-3">
                <div class="panel flex-1">
                    <div class="panel-title" style="font-weight:bold; margin-bottom:10px;">病区心电预警TOP排行</div>
                    <div ref="barChartRef" style="height: 200px;"></div>
                </div>
                <div class="panel flex-1">
                    <div class="panel-title" style="font-weight:bold; margin-bottom:10px;">近7日全院心电预警趋势</div>
                    <div ref="lineChartRef" style="height: 200px;"></div>
                </div>
            </div>
        </div>

        <!-- 底部待处理预警列表 -->
        <div class="panel list-panel mt-3">
            <div
                style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 1px solid #ebeef5; padding-bottom: 0;">
                <div class="custom-tabs">
                    <div class="tab-item" :class="{ active: activeBottomTab === '待处理预警' }"
                        @click="activeBottomTab = '待处理预警'">待处理预警</div>
                    <div class="tab-item" :class="{ active: activeBottomTab === '最新心电记录' }"
                        @click="activeBottomTab = '最新心电记录'">最新心电记录</div>
                </div>
                <el-button link type="primary" style="font-size: 14px; margin-bottom: 10px;" @click="handleViewAll">查看全部
                    <span style="margin-left: 4px; font-size: 16px;">&rarr;</span></el-button>
            </div>

            <!-- 待处理预警表格 -->
            <el-table v-show="activeBottomTab === '待处理预警'" :data="warningTableData" style="width: 100%; height: auto;"
                :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                <el-table-column label="预警时间" width="180">
                    <template #default="{ row }">
                        <div style="line-height: 1.5; color: #606266;">
                            <div>{{ row.warningTime ? row.warningTime.split(' ')[0] : '' }}</div>
                            <div>{{ row.warningTime ? row.warningTime.split(' ')[1] : '' }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="patientInfo" label="患者信息" width="200" />
                <el-table-column prop="ward" label="病区" width="200" />
                <el-table-column label="临床指标类型" min-width="160">
                    <template #default="{ row }">
                        <span style="color: #409eff; cursor: pointer;">{{ row.clinicalIndicator }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="预警级别" width="120">
                    <template #default="{ row }">
                        <el-tag :type="row.warningLevel === '高危' ? 'danger' : 'warning'" effect="plain" size="small"
                            style="border-radius: 4px;">{{ row.warningLevel }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag type="warning" effect="plain" size="small"
                            style="border-radius: 4px; color: #e6a23c; border-color: #fdf6ec; background-color: #fdf6ec;">{{
                                row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleInclude(row)">纳入</el-button>
                        <el-button link type="primary" size="small" @click="handleDetail(row)">查看详情 <span
                                style="margin-left: 4px; font-size: 14px;">&rarr;</span></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 最新心电记录表格 -->
            <el-table v-show="activeBottomTab === '最新心电记录'" :data="latestRecordData" style="width: 100%; height: auto;"
                :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                <el-table-column label="采集时间" width="180">
                    <template #default="{ row }">
                        <div style="line-height: 1.5; color: #606266;">
                            <div>{{ row.collectStartTime ? row.collectStartTime.split(' ')[0] : '' }}</div>
                            <div>{{ row.collectStartTime ? row.collectStartTime.split(' ')[1] : '' }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="患者信息" width="200">
                    <template #default="{ row }">
                        {{ row.patientName }}/{{ row.gender || '-' }}/{{ row.age != null ? row.age + '岁' : '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="deptName" label="病区" width="180" />
                <el-table-column prop="deviceName" label="设备" width="140" />
                <el-table-column label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag
                            :type="row.displayStatus === 3 ? 'danger' : (row.displayStatus === 2 ? 'success' : 'info')"
                            effect="plain" size="small" style="border-radius: 4px;">{{ row.statusText }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="AI结论" min-width="160">
                    <template #default="{ row }">
                        <span>{{ row.aiConclusionShort }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                    <template #default>
                        <el-button link type="primary" size="small">查看报告 <span
                                style="margin-left: 4px; font-size: 14px;">&rarr;</span></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 查看全部 弹窗 -->
        <el-dialog v-model="showAllDialogVisible" :title="dialogTitle" width="1000px" destroy-on-close>
            <div style="min-height: 400px; max-height: 60vh; overflow-y: auto;">
                <template v-if="dialogTitle === '待处理预警'">
                    <el-table :data="fullTableData" style="width: 100%; height: auto;"
                        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                        <el-table-column label="预警时间" width="180">
                            <template #default="{ row }">
                                <div style="line-height: 1.5; color: #606266;">
                                    <div>{{ row.warningTime ? row.warningTime.split(' ')[0] : '' }}</div>
                                    <div>{{ row.warningTime ? row.warningTime.split(' ')[1] : '' }}</div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="patientInfo" label="患者信息" width="200" />
                        <el-table-column prop="ward" label="病区" width="200" />
                        <el-table-column label="临床指标类型" min-width="160">
                            <template #default="{ row }">
                                <span style="color: #409eff; cursor: pointer;">{{ row.clinicalIndicator }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="预警级别" width="120">
                            <template #default="{ row }">
                                <el-tag :type="row.warningLevel === '高危' ? 'danger' : 'warning'" effect="plain"
                                    size="small" style="border-radius: 4px;">{{ row.warningLevel }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="120">
                            <template #default="{ row }">
                                <el-tag type="warning" effect="plain" size="small"
                                    style="border-radius: 4px; color: #e6a23c; border-color: #fdf6ec; background-color: #fdf6ec;">{{
                                        row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="160" fixed="right">
                            <template #default="{ row }">
                                <el-button link type="primary" size="small" @click="handleInclude(row)">纳入</el-button>
                                <el-button link type="primary" size="small" @click="handleDetail(row)">查看详情 <span
                                        style="margin-left: 4px; font-size: 14px;">&rarr;</span></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
                <template v-else>
                    <el-table :data="fullTableData" style="width: 100%; height: auto;"
                        :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                        <el-table-column label="采集时间" width="180">
                            <template #default="{ row }">
                                <div style="line-height: 1.5; color: #606266;">
                                    <div>{{ row.collectStartTime ? row.collectStartTime.split(' ')[0] : '' }}</div>
                                    <div>{{ row.collectStartTime ? row.collectStartTime.split(' ')[1] : '' }}</div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="患者信息" width="200">
                            <template #default="{ row }">
                                {{ row.patientName }}/{{ row.gender || '-' }}/{{ row.age != null ? row.age + '岁' : '-'
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="deptName" label="病区" width="180" />
                        <el-table-column prop="deviceName" label="设备" width="140" />
                        <el-table-column label="状态" width="120">
                            <template #default="{ row }">
                                <el-tag
                                    :type="row.displayStatus === 3 ? 'danger' : (row.displayStatus === 2 ? 'success' : 'info')"
                                    effect="plain" size="small" style="border-radius: 4px;">{{ row.statusText
                                    }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="AI结论" min-width="160">
                            <template #default="{ row }">
                                <span>{{ row.aiConclusionShort }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="140" fixed="right">
                            <template #default>
                                <el-button link type="primary" size="small">查看报告 <span
                                        style="margin-left: 4px; font-size: 14px;">&rarr;</span></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showAllDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 查看详情 弹窗 -->
        <el-dialog v-model="detailDialogVisible" title="预警详情" width="900px" destroy-on-close>
            <el-descriptions :column="2" border size="small">
                <!-- 预警信息 -->
                <el-descriptions-item label="预警ID">{{ currentDetail.alertId }}</el-descriptions-item>
                <el-descriptions-item label="预警时间">{{ currentDetail.warningTime }}</el-descriptions-item>
                <el-descriptions-item label="预警等级">{{ currentDetail.alertLevelText }}</el-descriptions-item>
                <el-descriptions-item label="处理状态">{{ currentDetail.alertStatusText }}</el-descriptions-item>
                <el-descriptions-item label="预警类型">{{ currentDetail.warningType }}</el-descriptions-item>
                <el-descriptions-item label="异常类型">{{ currentDetail.abnormalType }}</el-descriptions-item>
                <el-descriptions-item label="预警描述" :span="2">{{ currentDetail.warningDesc }}</el-descriptions-item>
                <el-descriptions-item label="LIS辅助提示" :span="2">{{ currentDetail.lisHint }}</el-descriptions-item>

                <!-- 患者信息 -->
                <el-descriptions-item label="患者姓名">{{ currentDetail.patientName }}</el-descriptions-item>
                <el-descriptions-item label="患者ID">{{ currentDetail.patientId }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ currentDetail.age }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ currentDetail.genderText }}</el-descriptions-item>
                <el-descriptions-item label="住院号">{{ currentDetail.inpatientNo }}</el-descriptions-item>
                <el-descriptions-item label="病区">{{ currentDetail.wardName }}</el-descriptions-item>
                <el-descriptions-item label="床号">{{ currentDetail.bedNo }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ currentDetail.phone }}</el-descriptions-item>
                <el-descriptions-item label="主要诊断" :span="2">{{ currentDetail.primaryDiagnosis }}</el-descriptions-item>

                <!-- 采集信息 -->
                <el-descriptions-item label="设备名称">{{ currentDetail.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="心电图编号">{{ currentDetail.ecgNo }}</el-descriptions-item>
                <el-descriptions-item label="导联数">{{ currentDetail.leadCount }}</el-descriptions-item>
                <el-descriptions-item label="采样率">{{ currentDetail.samplingRate }}</el-descriptions-item>
                <el-descriptions-item label="采集时长">{{ currentDetail.collectionDuration ?
                    currentDetail.collectionDuration + ' 秒'
                    : '' }}</el-descriptions-item>
                <el-descriptions-item label="置信度">{{ currentDetail.confidence }}</el-descriptions-item>
                <el-descriptions-item label="采集时间" :span="2">{{ currentDetail.collectionStartTime }} 至 {{
                    currentDetail.collectionEndTime || '正在采集' }}</el-descriptions-item>

                <!-- AI结论与指标 -->
                <el-descriptions-item label="AI诊断编号">{{ currentDetail.diagnosisNo }}</el-descriptions-item>
                <el-descriptions-item label="模型版本">{{ currentDetail.aiModelVersion }}</el-descriptions-item>
                <el-descriptions-item label="AI完整结论" :span="2">{{ currentDetail.aiConclusion }}</el-descriptions-item>

                <el-descriptions-item label="心率">{{ currentDetail.heartRate }}</el-descriptions-item>
                <el-descriptions-item label="PR间期">{{ currentDetail.prInterval }}</el-descriptions-item>
                <el-descriptions-item label="QRS时限">{{ currentDetail.qrsDuration }}</el-descriptions-item>
                <el-descriptions-item label="QT/QTc间期">{{ currentDetail.qtInterval }} / {{ currentDetail.qtcInterval
                }}</el-descriptions-item>

                <el-descriptions-item label="异常数量/级别">{{ currentDetail.abnormalCount }} / {{
                    currentDetail.abnormalLevelText
                }}</el-descriptions-item>
                <el-descriptions-item label="AI分析状态">{{ currentDetail.analysisStatusText }}</el-descriptions-item>
                <el-descriptions-item label="诊断完成时间" :span="2">{{ currentDetail.diagnosisTime }}</el-descriptions-item>

                <!-- 处理信息 -->
                <el-descriptions-item label="处理人">{{ currentDetail.handleUserName }}</el-descriptions-item>
                <el-descriptions-item label="处理时间">{{ currentDetail.handleTime }}</el-descriptions-item>
                <el-descriptions-item label="处理意见" :span="2">{{ currentDetail.handleRemark }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="detailDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 推送规则 弹窗 -->
        <el-drawer v-model="rulesDrawerVisible" title="推送规则" direction="rtl" size="600px">
            <el-form :model="rulesForm" label-width="100px" label-position="left" style="padding: 0 10px;">
                <div style="color: #666; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                    当前符合条件的患者: {{ eligiblePatientCount }} 人
                </div>

                <el-form-item required>
                    <template #label>
                        <span style="color: red; margin-right: 4px;">*</span>预警级别
                    </template>
                    <el-checkbox-group v-model="rulesForm.warningLevels">
                        <el-checkbox label="低危">低危</el-checkbox>
                        <el-checkbox label="中危">中危</el-checkbox>
                        <el-checkbox label="高危">高危</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item required>
                    <template #label>
                        <span style="color: red; margin-right: 4px;">*</span>预警类型
                    </template>
                    <el-checkbox-group v-model="rulesForm.warningTypes" style="display: flex; flex-wrap: wrap;">
                        <el-checkbox label="ST段抬高异常" style="margin-right: 20px; width: 160px;">ST段抬高异常</el-checkbox>
                        <el-checkbox label="室性心动过速风险" style="margin-right: 20px; width: 160px;">室性心动过速风险</el-checkbox>
                        <el-checkbox label="室性早搏增多" style="margin-right: 20px; width: 160px;">室性早搏增多</el-checkbox>
                        <el-checkbox label="房颤发作倾向" style="margin-right: 20px; width: 160px;">房颤发作倾向</el-checkbox>
                        <el-checkbox label="短暂心率升高" style="margin-right: 20px; width: 160px;">短暂心率升高</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <el-form-item required>
                    <template #label>
                        <span style="color: red; margin-right: 4px;">*</span>病区范围
                    </template>
                    <el-select v-model="rulesForm.wardIds" multiple collapse-tags collapse-tags-tooltip clearable
                        placeholder="请选择病区" style="width: 320px;" @change="handleWardChange">
                        <el-option v-for="item in wardOptions" :key="item.value" :label="item.label" :value="item.value"
                            :disabled="rulesForm.wardIds.includes('ALL') && item.value !== 'ALL'" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div style="display: flex; justify-content: flex-end; padding-top: 20px;">
                    <el-button @click="rulesDrawerVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleConfirmPush">确定推送</el-button>
                </div>
            </template>
        </el-drawer>
    </div>
</template>

<style lang="scss" scoped>
.workbench-container {
    background: var(--el-bg-color-overlay);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    color: var(--el-text-color-primary);

    .panel {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 20px;

        .panel-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--el-text-color-primary);
            position: relative;
            padding-left: 12px;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 2px;
                bottom: 2px;
                width: 4px;
                background: var(--el-color-primary);
                border-radius: 2px;
            }
        }
    }

    .mt-3 {
        margin-top: 16px;
    }

    .flex-1 {
        flex: 1;
    }

    // 顶部卡片
    .header-panel {
        margin-bottom: 16px;

        .filter-row {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            font-size: 14px;

            .label {
                font-weight: 500;
                color: #555;
                margin-right: 12px;
            }

            .date-buttons {
                display: flex;
                border: 1px solid #dcdfe6;
                border-radius: 4px;
                background: #fff;

                .date-btn {
                    padding: 4px 16px;
                    cursor: pointer;
                    color: #606266;
                    border-right: 1px solid #dcdfe6;
                    transition: all 0.2s;

                    &:last-child {
                        border-right: none;
                    }

                    &:hover {
                        color: var(--el-color-primary);
                    }

                    &.active {
                        background: var(--el-color-primary-light-9);
                        color: var(--el-color-primary);
                        font-weight: 500;
                    }
                }
            }

            .date-display {
                margin-left: 16px;
                color: #aaa;
                font-size: 13px;
            }
        }

        .stats-wrapper {
            display: flex;
            justify-content: flex-start;
            gap: 60px;

            .stat-title {
                font-size: 13px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .stat-number {
                display: flex;
                align-items: baseline;

                .val {
                    font-size: 32px;
                    font-weight: bold;
                    color: #333;
                    line-height: 1;
                    margin-right: 6px;
                }

                .unit {
                    font-size: 14px;
                    color: #999;
                }
            }
        }
    }

    // 中间图表
    .chart-row {
        display: flex;
        gap: 16px;
    }

    // 表格部分
    .list-panel {
        .custom-tabs {
            display: flex;
            align-items: center;
            gap: 32px;

            .tab-item {
                font-size: 16px;
                color: #606266;
                cursor: pointer;
                padding-bottom: 12px;
                position: relative;
                transition: color 0.2s;

                &:hover {
                    color: var(--el-color-primary);
                }

                &.active {
                    color: var(--el-color-primary);
                    font-weight: bold;

                    &::after {
                        content: '';
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background: var(--el-color-primary);
                    }
                }
            }
        }

        .table-tools {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            background: #fff;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #ebeef5;

            .left-tools {
                display: flex;
                align-items: center;

                .label {
                    font-size: 14px;
                    color: #555;
                    font-weight: 500;
                }
            }
        }
    }

    .custom-card-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 16px;
    }

    .status-stats-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 160px;
        padding: 0 20px;
    }

    .status-row {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .status-label {
        width: 60px;
        font-size: 14px;
        color: #333;
    }

    .status-progress-track {
        flex: 1;
        height: 12px;
        background: #f5f5f5;
        border-radius: 6px;
        margin: 0 15px;
        overflow: hidden;
    }

    .status-progress-fill {
        height: 100%;
        border-radius: 6px;
    }

    .bg-gray {
        background: #e4e7ed;
    }

    .bg-blue {
        background: #409eff;
    }

    .status-value {
        width: 50px;
        text-align: right;
        font-size: 14px;
        color: #333;
    }

    .device-stats-wrapper {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 160px;
        padding: 0 20px;
    }

    .bubble {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border: 4px solid #fff;
    }

    .bubble-blue {
        background: #E6F1FC;
        color: #409eff;
    }

    .bubble-green {
        background: #F0F9EB;
        color: #67C23A;
    }

    .bubble-orange {
        background: #FDF6EC;
        color: #E6A23C;
    }

    .bubble .num {
        font-size: 28px;
        font-weight: bold;
    }
}
</style>
