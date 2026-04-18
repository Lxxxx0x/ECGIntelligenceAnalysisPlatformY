<template>
    <div class="device-management">
        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-form :inline="true" :model="searchQuery" class="form-inline">
                <el-form-item label="设备编号">
                    <el-input v-model="searchQuery.deviceNo" placeholder="设备号/科室" clearable></el-input>
                </el-form-item>
                <el-form-item label="设备状态">
                    <el-select v-model="searchQuery.status" placeholder="请选择状态" clearable style="width: 150px">
                        <el-option label="正常" value="正常"></el-option>
                        <el-option label="异常" value="异常"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon>
                            <Search />
                        </el-icon>
                        查询
                    </el-button>
                    <el-button @click="handleReset">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格部分 -->
        <div class="table-container">
            <el-table :data="tableData" border style="width: 100%" max-height="calc(100vh - 200px)">
                <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                <el-table-column prop="deviceNo" label="设备编号" width="120" align="center"></el-table-column>
                <el-table-column prop="model" label="设备型号" min-width="140" align="center"></el-table-column>
                <el-table-column prop="department" label="归属科室" min-width="120" align="center"></el-table-column>
                <el-table-column prop="lastCalibration" label="上次校准时间" width="200" align="center"></el-table-column>
                <el-table-column prop="nextCalibration" label="下次校准时间" width="180" align="center"></el-table-column>
                <el-table-column prop="passRate" label="数据合格率" width="120" align="center"></el-table-column>
                <el-table-column prop="status" label="当前状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '正常' ? 'success' : 'danger'" plain size="small">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="240" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">查看</el-button>
                        <el-button type="primary" link @click="handleDetail(row)">编辑</el-button>
                        <el-button type="primary" link @click="handleDetail(row)">记录</el-button>
                        <el-button type="primary" link @click="handleDetail(row)">维护</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 详情弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close class="detail-dialog">
            <div class="detail-content">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-card shadow="never" class="info-card">
                            <template #header>
                                <div class="card-header">
                                    <span>基本信息</span>
                                </div>
                            </template>
                            <div class="info-list">
                                <div class="info-item"><span class="label">设备编号：</span><span
                                        class="value">PHILIPS-ECG-2000-001</span></div>
                                <div class="info-item"><span class="label">设备名称：</span><span class="value">静态心电图机</span>
                                </div>
                                <div class="info-item"><span class="label">型号：</span><span class="value">ECG-2000</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">厂商：</span>
                                    <span class="value"><el-tag size="small" color="#f4f4f5"
                                            style="color: #409eff; border-color: #d9ecff;">飞利浦</el-tag></span>
                                </div>
                                <div class="info-item">
                                    <span class="label">状态：</span>
                                    <span class="value"><el-tag type="success" size="small" plain>正常</el-tag></span>
                                </div>
                                <div class="info-item"><span class="label">所属病区：</span><span
                                        class="value">心血管内科一区</span></div>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="12">
                        <el-card shadow="never" class="info-card">
                            <template #header>
                                <div class="card-header">
                                    <span>使用统计</span>
                                </div>
                            </template>
                            <div class="stat-list">
                                <div class="stat-item"><span class="label">今日测量：</span><span
                                        class="value text-primary">23
                                        次</span></div>
                                <div class="stat-item"><span class="label">本周测量：</span><span
                                        class="value text-primary">156
                                        次</span></div>
                                <div class="stat-item"><span class="label">本月测量：</span><span
                                        class="value text-primary">624
                                        次</span></div>
                                <div class="stat-item bar-item">
                                    <div class="bar-header"><span class="label">设备在线率：</span><span
                                            class="value">98.5%</span>
                                    </div>
                                    <el-progress :percentage="98.5" color="#67c23a" :show-text="false"
                                        :stroke-width="8"></el-progress>
                                </div>
                                <div class="stat-item bar-item">
                                    <div class="bar-header"><span class="label">错误率：</span><span
                                            class="value">1.2%</span></div>
                                    <el-progress :percentage="1.2" color="#f56c6c" :show-text="false"
                                        :stroke-width="8"></el-progress>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>

                <el-row :gutter="20" style="margin-top: 20px;">
                    <el-col :span="12">
                        <el-card shadow="never" class="info-card">
                            <template #header>
                                <div class="card-header" style="display: flex; align-items: center;">
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                    <span style="margin-left: 8px;">使用科室</span>
                                </div>
                            </template>
                            <div class="tags-container">
                                <el-tag class="dept-tag" color="#fcf9ff"
                                    style="color: #8c5cf3; border-color: #f3e8ff; margin-right: 8px;">心血管内科一区</el-tag>
                                <el-tag class="dept-tag" color="#fcf9ff"
                                    style="color: #8c5cf3; border-color: #f3e8ff; margin-right: 8px;">急诊科</el-tag>
                                <el-tag class="dept-tag" color="#fcf9ff"
                                    style="color: #8c5cf3; border-color: #f3e8ff;">CCU</el-tag>
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="12">
                        <el-card shadow="never" class="info-card">
                            <template #header>
                                <div class="card-header" style="display: flex; align-items: center;">
                                    <svg viewBox="0 0 1024 1024" width="1em" height="1em"
                                        style="margin-right: 8px; fill: currentColor;">
                                        <path
                                            d="M725.333333 192c-89.6 0-168.533333 44.8-213.333333 115.2C467.2 236.8 388.266667 192 298.666667 192 157.866667 192 42.666667 307.2 42.666667 448c0 253.866667 469.333333 512 469.333333 512s469.333333-256 469.333333-512c0-140.8-115.2-256-256-256z"
                                            fill="" p-id="1255"></path>
                                    </svg>
                                    <span>当前使用患者</span>
                                </div>
                            </template>
                            <el-table :data="patientData" style="width: 100%" class="patient-table">
                                <el-table-column prop="name" label="患者姓名" width="90"></el-table-column>
                                <el-table-column prop="bed" label="床位" width="60"></el-table-column>
                                <el-table-column prop="status" label="状态" width="80">
                                    <template #default="{ row }">
                                        <el-tag type="success" size="small" plain v-if="row.status === '监测中'">{{
                                            row.status }}</el-tag>
                                        <el-tag type="warning" size="small" plain v-else color="#fffce6"
                                            style="color: #ff9900; border-color: #ffe6ba;">{{ row.status }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="lastMeasure" label="最近测量"></el-table-column>
                            </el-table>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">关 闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Search, Refresh, User } from '@element-plus/icons-vue'

// 搜索条件
const searchQuery = reactive({
    deviceNo: '',
    status: ''
})

// 表格数据模拟
const tableData = ref([
    { deviceNo: 'ECG020', model: '普外科心电仪', department: '感染科', lastCalibration: '2026-04-15 12:00:22', nextCalibration: '2026-05-15', passRate: '98%', status: '正常' },
    { deviceNo: 'ECG019', model: '骨科心电仪', department: '血液科', lastCalibration: '2026-04-15 12:00:22', nextCalibration: '2026-05-15', passRate: '98%', status: '正常' },
    { deviceNo: 'ECG018', model: '内分泌心电仪', department: '疼痛科', lastCalibration: '2026-04-15 12:00:22', nextCalibration: '2026-05-15', passRate: '98%', status: '正常' },
    { deviceNo: 'ECG017', model: '肾内科心电仪', department: '康复科', lastCalibration: '2026-04-15 12:00:22', nextCalibration: '2026-05-15', passRate: '98%', status: '正常' },
    { deviceNo: 'ECG016', model: '呼吸科心电仪', department: '肿瘤科', lastCalibration: '2026-04-15 12:00:22', nextCalibration: '2026-05-15', passRate: '98%', status: '正常' }
])

// 查询方法
const handleSearch = () => {
    console.log('搜索:', searchQuery)
}

// 重置方法
const handleReset = () => {
    searchQuery.deviceNo = ''
    searchQuery.status = ''
}

// 弹窗及弹窗数据
const dialogVisible = ref(false)
const dialogTitle = ref('静态心电图机 - 使用详情')

const patientData = ref([
    { name: '张三', bed: '01', status: '监测中', lastMeasure: '2026-04-11 14:30:00' },
    { name: '王五', bed: '03', status: '监测中', lastMeasure: '2026-04-11 14:25:00' },
    { name: '李四', bed: '05', status: '离线', lastMeasure: '2026-04-10 16:15:00' }
])

// 记录详情
const handleDetail = (row) => {
    console.log('查看详情:', row)
    // 更新弹窗标题
    dialogTitle.value = `${row.model || '静态心电图机'} - 使用详情`
    dialogVisible.value = true
}
</script>

<style scoped>
.device-management {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 60px);
}

.search-bar {
    background-color: #fff;
    padding: 18px 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.search-bar .el-form-item {
    margin-bottom: 0;
}

.table-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

:deep(.el-table th.el-table__cell) {
    background-color: #fafafa !important;
    color: #606266;
    font-weight: 500;
}

:deep(.el-tag--success.is-plain) {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
}

/* 详情弹窗样式 */
.detail-dialog :deep(.el-dialog__body) {
    padding: 10px 20px 20px;
    background-color: #f7f8fa;
}

.info-card {
    border: none;
    border-radius: 8px;
    height: 100%;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.05) !important;
}

.info-card :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: bold;
    font-size: 15px;
    color: #222;
}

.info-card :deep(.el-card__body) {
    padding: 20px;
    background-color: #f7f8fa;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.info-item {
    display: flex;
    font-size: 14px;
    line-height: 1.5;
}

.info-item .label {
    width: 80px;
    color: #555;
    text-align: left;
}

.info-item .value {
    color: #333;
    font-weight: 500;
}

.stat-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    align-items: center;
}

.stat-item .label {
    color: #555;
}

.stat-item .value {
    font-weight: bold;
    color: #333;
}

.text-primary {
    color: #1890ff !important;
}

.bar-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 4px;
}

.bar-header {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.patient-table {
    --el-table-header-bg-color: #fafafa;
    border-radius: 4px;
    overflow: hidden;
}

.patient-table :deep(th.el-table__cell) {
    font-weight: 500;
    color: #333;
}

.patient-table :deep(.el-table__row) {
    background-color: #f7f8fa;
}
</style>
