<template>
    <div class="dashboard-container">
        <header class="header">
            <div class="header-title">心电图及患者数据分析监控中心</div>
        </header>

        <div class="dashboard-body">
            <!-- Left Column -->
            <div class="side-col left-col">
                <div class="panel">
                    <div class="panel-header">监测指标</div>
                    <div class="panel-content indicators">
                        <div class="indicator-item">
                            <div class="icon-base">
                                <el-icon>
                                    <Odometer />
                                </el-icon>
                            </div>
                            <div class="value">65</div>
                            <div class="label">监管指标数</div>
                        </div>
                        <div class="indicator-item">
                            <div class="icon-base">
                                <el-icon>
                                    <DataLine />
                                </el-icon>
                            </div>
                            <div class="value">35</div>
                            <div class="label">运行指标数</div>
                        </div>
                        <div class="indicator-item">
                            <div class="icon-base">
                                <el-icon>
                                    <Warning />
                                </el-icon>
                            </div>
                            <div class="value">30</div>
                            <div class="label">异常指标数</div>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header">健康数据分布</div>
                    <div class="panel-content" ref="pieChartRef"></div>
                </div>

                <div class="panel">
                    <div class="panel-header">病患管理</div>
                    <div class="panel-content manage-list">
                        <div class="manage-item">
                            <el-icon>
                                <DataAnalysis />
                            </el-icon>
                            <div class="manage-info">
                                <div class="label">基础数据<br />数据采集量</div>
                            </div>
                            <div class="manage-value">1480<small>MB/s</small></div>
                        </div>
                        <div class="manage-item">
                            <el-icon>
                                <Monitor />
                            </el-icon>
                            <div class="manage-info">
                                <div class="label">诊疗进展<br />操作数量</div>
                            </div>
                            <div class="manage-value">1480<small>个</small></div>
                        </div>
                        <div class="manage-item">
                            <el-icon>
                                <House />
                            </el-icon>
                            <div class="manage-info">
                                <div class="label">医疗机构<br />接入平台数量</div>
                            </div>
                            <div class="manage-value">1480<small>个</small></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Center Column -->
            <div class="center-col">
                <div class="top-stats">
                    <div class="stat-box">
                        <div class="stat-icon pie-icon"></div>
                        <div class="stat-data">
                            <div class="value">13<small>万例</small></div>
                            <div class="label">患者总数</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon graph-icon"></div>
                        <div class="stat-data">
                            <div class="value">13<small>个</small> 47<small>个</small></div>
                            <div class="label">重点机构数量</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon target-icon"></div>
                        <div class="stat-data">
                            <div class="value">13<small>万</small> 47<small>万</small></div>
                            <div class="label">数据覆盖人数</div>
                        </div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon bar-icon"></div>
                        <div class="stat-data">
                            <div class="value">13<small>万</small> 47<small>%</small></div>
                            <div class="label">异常检出占比</div>
                        </div>
                    </div>
                </div>
                <div class="map-container" ref="mapChartRef"></div>
            </div>

            <!-- Right Column -->
            <div class="side-col right-col">
                <div class="panel">
                    <div class="panel-header">收治概况</div>
                    <div class="panel-content general-stats">
                        <div class="general-item">
                            <div class="g-icon database-icon"></div>
                            <div class="g-val">1480<small>/种</small></div>
                            <div class="g-label">病区类型</div>
                        </div>
                        <div class="general-item">
                            <div class="g-icon check-icon"></div>
                            <div class="g-val">1480<small>例/周</small></div>
                            <div class="g-label">床均产出</div>
                        </div>
                        <div class="general-item">
                            <div class="g-icon layers-icon"></div>
                            <div class="g-val">1480<small>项/床</small></div>
                            <div class="g-label">监测平均项数</div>
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header">重点数据分布</div>
                    <div class="panel-content" ref="lineChartRef"></div>
                </div>

                <div class="panel">
                    <div class="panel-header">重症收容</div>
                    <div class="panel-content" ref="barChartRef"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Odometer, DataLine, Warning, DataAnalysis, Monitor, House } from '@element-plus/icons-vue'

const pieChartRef = ref(null)
const mapChartRef = ref(null)
const lineChartRef = ref(null)
const barChartRef = ref(null)

let charts = []

const initPieChart = () => {
    const chart = echarts.init(pieChartRef.value)
    chart.setOption({
        tooltip: { trigger: 'item' },
        legend: {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: { color: '#a0cbe8', fontSize: 10 },
            itemWidth: 8,
            itemHeight: 8
        },
        series: [
            {
                name: '健康数据分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['35%', '50%'],
                avoidLabelOverlap: false,
                label: { show: false },
                labelLine: { show: false },
                data: [
                    { value: 1048, name: '高 10.28%', itemStyle: { color: '#00ffff' } },
                    { value: 735, name: '较高 26.50%', itemStyle: { color: '#0b72a6' } },
                    { value: 580, name: '中 23.14%', itemStyle: { color: '#16578a' } },
                    { value: 484, name: '低 20.50%', itemStyle: { color: '#4478a3' } },
                    { value: 300, name: '极低 10.28%', itemStyle: { color: '#1f9fd6' } }
                ]
            }
        ]
    })
    charts.push(chart)
}

const initLineChart = () => {
    const chart = echarts.init(lineChartRef.value)
    chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#a0cbe8', fontSize: 10 }, top: 0, right: 10 },
        grid: { top: 30, bottom: 20, left: 30, right: 10 },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
            axisLine: { lineStyle: { color: '#2b5f8f' } },
            axisLabel: { color: '#a0cbe8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            name: '单位: %',
            nameTextStyle: { color: '#a0cbe8', fontSize: 10, align: 'right' },
            splitLine: { show: false },
            axisLabel: { color: '#a0cbe8', fontSize: 10 }
        },
        series: [
            {
                name: '地域规模',
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(0, 255, 255, 0.5)' },
                        { offset: 1, color: 'rgba(0, 255, 255, 0.01)' }
                    ])
                },
                itemStyle: { color: '#00ffff' },
                data: [120, 132, 301, 134, 90, 230, 210, 320]
            },
            {
                name: '区院分布',
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(39, 174, 96, 0.5)' },
                        { offset: 1, color: 'rgba(39, 174, 96, 0.01)' }
                    ])
                },
                itemStyle: { color: '#27ae60' },
                data: [220, 182, 191, 234, 290, 330, 310, 420]
            }
        ]
    })
    charts.push(chart)
}

const initBarChart = () => {
    const chart = echarts.init(barChartRef.value)
    chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { top: 40, bottom: 20, left: 30, right: 10 },
        xAxis: {
            type: 'category',
            data: ['常规总量', '早发', '中度', '晚期'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#a0cbe8', fontSize: 12 }
        },
        yAxis: { show: false },
        series: [
            {
                type: 'bar',
                barWidth: 30,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#00ffff' },
                        { offset: 1, color: '#08487b' }
                    ]),
                    borderRadius: [2, 2, 0, 0]
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c} /万例',
                    color: '#fff',
                    fontSize: 12
                },
                data: [480, 260, 220, 390]
            }
        ]
    })
    charts.push(chart)
}

const initMapChart = async () => {
    const chart = echarts.init(mapChartRef.value)
    charts.push(chart)

    try {
        const res = await fetch('/china.json')
        const geoJson = await res.json()
        echarts.registerMap('china', geoJson)

        // Changsha coords
        const changsha = [112.982279, 28.19409]
        // Other cities coords
        const targets = [
            { name: '北京', value: [116.405285, 39.904989] },
            { name: '上海', value: [121.472644, 31.231706] },
            { name: '广州', value: [113.280637, 23.125178] },
            { name: '成都', value: [104.065735, 30.659462] },
            { name: '西安', value: [108.948024, 34.263161] },
            { name: '武汉', value: [114.298572, 30.584355] },
            { name: '乌鲁木齐', value: [87.617733, 43.792818] }
        ]

        const lines = targets.map(item => {
            return {
                coords: [changsha, item.value]
            }
        })

        const option = {
            geo: {
                map: 'china',
                roam: true,
                zoom: 1.2,
                itemStyle: {
                    areaColor: '#0b295c',
                    borderColor: '#1f9fd6',
                    borderWidth: 1,
                    shadowColor: 'rgba(0, 255, 255, 0.5)',
                    shadowBlur: 10
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#175591'
                    },
                    label: { show: false }
                }
            },
            series: [
                {
                    type: 'lines',
                    zlevel: 1,
                    effect: {
                        show: true,
                        period: 6,
                        trailLength: 0.7,
                        color: '#fff',
                        symbolSize: 3
                    },
                    lineStyle: {
                        color: '#00ffff',
                        width: 0,
                        curveness: 0.2
                    },
                    data: lines
                },
                {
                    type: 'lines',
                    zlevel: 2,
                    effect: {
                        show: true,
                        period: 6,
                        trailLength: 0,
                        symbol: 'arrow',
                        symbolSize: 6
                    },
                    lineStyle: {
                        color: '#00ffff',
                        width: 1,
                        opacity: 0.4,
                        curveness: 0.2
                    },
                    data: lines
                },
                {
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    rippleEffect: { brushType: 'stroke' },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                        color: '#fff'
                    },
                    symbolSize: 8,
                    itemStyle: { color: '#00ffff' },
                    data: [{ name: '长沙', value: [...changsha, 100], itemStyle: { color: '#ffeb3b' } }, ...targets]
                }
            ]
        }

        chart.setOption(option)
    } catch (e) {
        console.warn("Failed to load map data.", e)
    }
}

onMounted(() => {
    initPieChart()
    initLineChart()
    initBarChart()
    initMapChart()

    window.addEventListener('resize', () => {
        charts.forEach(c => c.resize())
    })
})

onBeforeUnmount(() => {
    charts.forEach(c => c.dispose())
})
</script>

<style scoped>
.dashboard-container {
    width: 100%;
    height: 100vh;
    background-color: #030d24;
    background-image:
        linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.header {
    height: 80px;
    background: url('data:image/svg+xml;utf8,<svg width="100%" height="80" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L100,0 L120,M M..." fill="none"/></svg>') no-repeat center top;
    /* Simulating the geometric header background */
    position: relative;
    border-top: 4px solid #00f0ff;
}

.header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
    height: 60px;
    background: linear-gradient(180deg, #09407a 0%, #030d24 100%);
    border: 2px solid #00f0ff;
    border-top: none;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5) inset;
    z-index: 1;
}

.header-title {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 4px;
    color: #e0f7fa;
    text-shadow: 0 0 10px #00f0ff;
    z-index: 2;
}

.dashboard-body {
    flex: 1;
    display: flex;
    padding: 10px 20px 20px;
    gap: 20px;
    overflow: hidden;
}

.side-col {
    width: 25%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.center-col {
    width: 50%;
    display: flex;
    flex-direction: column;
    position: relative;
}

.panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(4, 25, 60, 0.5);
    border: 1px solid rgba(0, 240, 255, 0.3);
    position: relative;
}

.panel::before,
.panel::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid #00f0ff;
}

.panel::before {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
}

.panel::after {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
}

.panel-header {
    height: 36px;
    line-height: 36px;
    padding-left: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    background: linear-gradient(90deg, rgba(0, 168, 255, 0.4) 0%, transparent 100%);
    border-left: 4px solid #00f0ff;
    margin: 1px;
}

.panel-header::before {
    content: "▶";
    font-size: 12px;
    color: #00f0ff;
    margin-right: 8px;
}

.panel-content {
    flex: 1;
    padding: 10px;
    position: relative;
}

/* Indicators */
.indicators {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding-bottom: 20px;
}

.indicator-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.icon-base {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: radial-gradient(circle, #00f0ff33 0%, transparent 70%);
    border: 1px solid rgba(0, 240, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: #00f0ff;
    box-shadow: 0 10px 10px -5px rgba(0, 255, 255, 0.5);
    margin-bottom: 10px;
    transform: perspective(200px) rotateX(20deg);
}

.indicator-item .value {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
}

.indicator-item .label {
    font-size: 12px;
    color: #a0cbe8;
}

/* Management list */
.manage-list {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.manage-item {
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, rgba(0, 140, 255, 0.2), transparent);
    padding: 10px 15px;
    margin-bottom: 5px;
    border-left: 2px solid #00f0ff;
}

.manage-item .el-icon {
    font-size: 28px;
    color: #00f0ff;
    margin-right: 15px;
}

.manage-info {
    flex: 1;
}

.manage-info .label {
    font-size: 12px;
    color: #a0cbe8;
    line-height: 1.4;
}

.manage-value {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 5px #00f0ff;
}

.manage-value small {
    font-size: 12px;
    color: #a0cbe8;
    margin-left: 5px;
    font-weight: normal;
}

/* Top Stats in Center */
.top-stats {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin-bottom: 20px;
}

.stat-box {
    flex: 1;
    display: flex;
    align-items: center;
    background: rgba(4, 25, 60, 0.6);
    border: 1px solid rgba(0, 240, 255, 0.2);
    padding: 15px 10px;
    gap: 10px;
}

.stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 240, 255, 0.1);
    border: 1px solid #00f0ff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.stat-data .value {
    font-size: 18px;
    font-weight: bold;
    color: #00f0ff;
}

.stat-data .value small {
    font-size: 12px;
    color: #fff;
    margin-left: 2px;
    font-weight: normal;
}

.stat-data .label {
    font-size: 12px;
    color: #a0cbe8;
    margin-top: 4px;
}

/* Map */
.map-container {
    flex: 1;
    width: 100%;
    height: 100%;
}

/* General Stats */
.general-stats {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.general-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.g-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
    border-radius: 50%;
    background: #0b72a6;
    border-bottom: 5px solid #00f0ff;
}

.g-val {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
}

.g-val small {
    font-size: 12px;
}

.g-label {
    font-size: 12px;
    color: #a0cbe8;
    margin-top: 5px;
}
</style>
