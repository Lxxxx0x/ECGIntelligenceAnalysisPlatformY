<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

defineOptions({
    name: "WorkbenchIndex",
});

const getPrimaryColor = () => {
    return document.documentElement.style.getPropertyValue("--el-color-primary") || "#3582e6";
};

// 顶部时间筛选
const dateRange = ref([]);
const activeDateBtn = ref("今天");
const dateBtns = ["今天", "本周", "本月", "本年"];

// 统计数据
const stats = [
    { label: "心电测量次数", value: 2453, unit: "次" },
    { label: "待分析记录", value: 194, unit: "条" },
    { label: "待审核报告", value: 28, unit: "份" },
    { label: "异常预警", value: 11, unit: "条" },
    { label: "预警总数", value: 564, unit: "条" },
    { label: "报告总数", value: 118, unit: "条" },
    { label: "AI诊断准确率", value: 92.8, unit: "%" },
];

const activeBottomTab = ref("待处理预警");

// 待处理预警数据
const warningTableData = [
    { time: "2026-04-11 11:33:00", patientInfo: "赵六/72岁/女", ward: "老年病科", type: "心动过缓", level: "中危", status: "待处理" },
    { time: "2026-04-11 08:32:00", patientInfo: "张三/45岁/男", ward: "心血管内 科一区", type: "ST段异常", level: "中危", status: "待处理" },
    { time: "2026-04-11 10:35:00", patientInfo: "林十四/55岁/女", ward: "肾内科", type: "室性早搏增多", level: "高危", status: "待处理" },
    { time: "2026-04-11 14:35:00", patientInfo: "陈十二/78岁/男", ward: "骨科", type: "ST-T改变", level: "中危", status: "待处理" },
    { time: "2026-04-11 16:05:00", patientInfo: "刘十一/32岁/女", ward: "产科", type: "窦性心动过速", level: "中危", status: "待处理" }
];

// 最新心电记录数据
const latestRecordData = [
    { time: "2026-04-11 11:45:00", patientInfo: "王五/60岁/男", ward: "心血管内科二区", device: "ECG-001", aiResult: "室性早搏", status: "待审核" },
    { time: "2026-04-11 11:30:00", patientInfo: "李莹/45岁/女", ward: "急诊病房", device: "ECG-023", aiResult: "窦性心律，正常心电图", status: "已审核" },
    { time: "2026-04-11 11:15:00", patientInfo: "孙齐/52岁/男", ward: "神经内科", device: "ECG-015", aiResult: "房颤", status: "危急值" },
    { time: "2026-04-11 10:50:00", patientInfo: "周八/68岁/女", ward: "呼吸内科", device: "ECG-102", aiResult: "ST段改变", status: "待审核" }
];

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

onMounted(() => {
    nextTick(() => {
        initCharts();
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
                    2026-04-14 至 2026-04-14
                </div>
            </div>

            <!-- 核心统栏 -->
            <div class="stats-wrapper">
                <div class="stat-item" v-for="(item, i) in stats" :key="i">
                    <div class="stat-title">{{ item.label }}</div>
                    <div class="stat-number">
                        <span class="val">{{ item.value }}</span>
                        <span class="unit">{{ item.unit }}</span>
                    </div>
                </div>
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
                <el-button link type="primary" style="font-size: 14px; margin-bottom: 10px;">查看全部 <span
                        style="margin-left: 4px; font-size: 16px;">&rarr;</span></el-button>
            </div>

            <!-- 待处理预警表格 -->
            <el-table v-show="activeBottomTab === '待处理预警'" :data="warningTableData" style="width: 100%; height: auto;"
                :header-cell-style="{ background: '#f5f7fa', color: '#333', fontWeight: 'bold' }">
                <el-table-column label="预警时间" width="180">
                    <template #default="{ row }">
                        <div style="line-height: 1.5; color: #606266;">
                            <div>{{ row.time.split(' ')[0] }}</div>
                            <div>{{ row.time.split(' ')[1] }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="patientInfo" label="患者信息" width="200" />
                <el-table-column prop="ward" label="病区" width="200" />
                <el-table-column label="预警类型" min-width="160">
                    <template #default="{ row }">
                        <span style="color: #409eff; cursor: pointer;">{{ row.type }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="预警级别" width="120">
                    <template #default="{ row }">
                        <el-tag :type="row.level === '高危' ? 'danger' : 'warning'" effect="plain" size="small"
                            style="border-radius: 4px;">{{ row.level }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag type="warning" effect="plain" size="small"
                            style="border-radius: 4px; color: #e6a23c; border-color: #fdf6ec; background-color: #fdf6ec;">{{
                                row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                    <template #default>
                        <el-button link type="primary" size="small">查看详情 <span
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
                            <div>{{ row.time.split(' ')[0] }}</div>
                            <div>{{ row.time.split(' ')[1] }}</div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="patientInfo" label="患者信息" width="200" />
                <el-table-column prop="ward" label="病区" width="180" />
                <el-table-column prop="device" label="设备" width="140" />
                <el-table-column label="状态" width="120">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '危急值' ? 'danger' : (row.status === '已审核' ? 'success' : 'info')"
                            effect="plain" size="small" style="border-radius: 4px;">{{ row.status }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="AI结论" min-width="160">
                    <template #default="{ row }">
                        <span>{{ row.aiResult }}</span>
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
