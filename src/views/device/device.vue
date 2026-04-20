<template>
    <div class="device-management">
        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-form :inline="true" :model="searchQuery" class="form-inline">
                <el-form-item label="设备名称">
                    <el-input v-model="searchQuery.deviceName" placeholder="设备名称" clearable @keyup.enter="handleSearch"
                        @clear="handleSearch"></el-input>
                </el-form-item>
                <el-form-item label="设备类型">
                    <el-select v-model="searchQuery.deviceType" placeholder="全部类型" clearable style="width: 150px"
                        @change="handleSearch">
                        <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备病区">
                    <el-select v-model="searchQuery.ward" placeholder="全部病区" clearable style="width: 150px"
                        @change="handleSearch">
                        <el-option v-for="item in wardOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="采购时间">
                    <el-date-picker v-model="searchQuery.purchaseDateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                        @change="handleSearch">
                    </el-date-picker>
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
                    <el-button type="success" @click="handleAdd">
                        新增设备
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格部分 -->
        <div class="table-container">
            <el-table v-loading="loading" :data="tableData" border style="width: 100%" max-height="calc(100vh - 200px)">
                <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
                <el-table-column prop="deviceCode" label="设备编号" width="140" align="center"></el-table-column>
                <el-table-column prop="deviceName" label="设备名称" min-width="150" align="center"
                    show-overflow-tooltip></el-table-column>
                <el-table-column prop="deviceTypeText" label="设备类型" min-width="120" align="center"></el-table-column>
                <el-table-column prop="deviceModel" label="设备型号" min-width="120" align="center"></el-table-column>
                <el-table-column prop="wardName" label="归属病区" min-width="130" align="center"
                    show-overflow-tooltip></el-table-column>
                <el-table-column prop="manufacturer" label="厂商" min-width="140" align="center"
                    show-overflow-tooltip></el-table-column>
                <el-table-column prop="installDate" label="安装日期" width="130" align="center"></el-table-column>
                <el-table-column prop="lastMaintainTime" label="上次维护时间" width="130" align="center"></el-table-column>
                <el-table-column prop="nextMaintainTime" label="下次维护时间" width="130" align="center"></el-table-column>
                <el-table-column prop="deviceStatusText" label="当前状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.deviceStatus)" plain size="small">
                            {{ row.deviceStatusText }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">查看</el-button>
                        <el-popconfirm title="确定删除该设备吗?" @confirm="handleDelete(row)">
                            <template #reference>
                                <el-button type="danger" link>删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrapper" style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 详情弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" destroy-on-close class="detail-dialog">
            <div class="detail-content" v-loading="detailLoading" v-if="currentDetail">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-card shadow="never" class="info-card">
                            <template #header>
                                <div class="card-header">
                                    <span>基本信息</span>
                                </div>
                            </template>
                            <div class="info-list">
                                <div class="info-item"><span class="label">设备编号：</span><span class="value">{{
                                        currentDetail.basicInfo?.deviceCode }}</span></div>
                                <div class="info-item"><span class="label">设备名称：</span><span class="value">{{
                                        currentDetail.basicInfo?.deviceName }}</span></div>
                                <div class="info-item"><span class="label">类型：</span><span class="value">{{
                                        currentDetail.basicInfo?.deviceTypeText }}</span></div>
                                <div class="info-item"><span class="label">型号：</span><span class="value">{{
                                        currentDetail.basicInfo?.deviceModel }}</span></div>
                                <div class="info-item">
                                    <span class="label">厂商：</span>
                                    <span class="value"><el-tag size="small" color="#f4f4f5"
                                            style="color: #409eff; border-color: #d9ecff;">{{
                                            currentDetail.basicInfo?.manufacturer }}</el-tag></span>
                                </div>
                                <div class="info-item">
                                    <span class="label">状态：</span>
                                    <span class="value">
                                        <el-tag :type="getStatusType(currentDetail.basicInfo?.deviceStatus)"
                                            size="small" plain>{{ currentDetail.basicInfo?.deviceStatusText }}</el-tag>
                                    </span>
                                </div>
                                <div class="info-item"><span class="label">所属病区：</span><span class="value">{{
                                        currentDetail.basicInfo?.wardName }}</span></div>
                                <div class="info-item"><span class="label">安装日期：</span><span class="value">{{
                                        currentDetail.basicInfo?.installDate }}</span></div>
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
                                        class="value text-primary">{{
                                        currentDetail.usageStat?.todayMeasureCount }} 次</span></div>
                                <div class="stat-item"><span class="label">本周测量：</span><span
                                        class="value text-primary">{{
                                        currentDetail.usageStat?.weekMeasureCount }} 次</span></div>
                                <div class="stat-item"><span class="label">本月测量：</span><span
                                        class="value text-primary">{{
                                        currentDetail.usageStat?.monthMeasureCount }} 次</span></div>
                                <div class="stat-item bar-item">
                                    <div class="bar-header"><span class="label">设备在线率：</span><span class="value">{{
                                            currentDetail.usageStat?.onlineRate }}%</span></div>
                                    <el-progress :percentage="Number(currentDetail.usageStat?.onlineRate) || 0"
                                        color="#67c23a" :show-text="false" :stroke-width="8"></el-progress>
                                </div>
                                <div class="stat-item bar-item">
                                    <div class="bar-header"><span class="label">错误率：</span><span class="value">{{
                                            currentDetail.usageStat?.errorRate }}%</span></div>
                                    <el-progress :percentage="Number(currentDetail.usageStat?.errorRate) || 0"
                                        color="#f56c6c" :show-text="false" :stroke-width="8"></el-progress>
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
                                <el-tag v-for="(tag, index) in currentDetail.deptTags" :key="index" class="dept-tag"
                                    color="#fcf9ff"
                                    style="color: #8c5cf3; border-color: #f3e8ff; margin-right: 8px; margin-bottom: 8px;">
                                    {{ tag }}
                                </el-tag>
                                <div v-if="!currentDetail.deptTags || currentDetail.deptTags.length === 0"
                                    style="color: #999; font-size: 13px;">暂无科室标签</div>
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
                            <el-table :data="currentDetail.currentPatients" style="width: 100%" class="patient-table">
                                <el-table-column prop="patientName" label="患者姓名" width="90"></el-table-column>
                                <el-table-column prop="wardBed" label="床位/病区" width="140"
                                    show-overflow-tooltip></el-table-column>
                                <el-table-column prop="monitorStatus" label="状态" width="80">
                                    <template #default="{ row }">
                                        <el-tag type="danger" size="small" plain v-if="row.monitorStatus === '预警'">{{
                                            row.monitorStatus }}</el-tag>
                                        <el-tag type="success" size="small" plain
                                            v-else-if="row.monitorStatus === '监测中'">{{ row.monitorStatus }}</el-tag>
                                        <el-tag type="warning" size="small" plain v-else color="#fffce6"
                                            style="color: #ff9900; border-color: #ffe6ba;">{{ row.monitorStatus
                                            }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="updateTime" label="更新时间">
                                    <template #default="{ row }">
                                        {{ row.updateTime ? row.updateTime.replace('T', ' ') : '-' }}
                                    </template>
                                </el-table-column>
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

        <!-- 新增设备弹窗 -->
        <el-dialog v-model="addDialogVisible" title="新增设备" width="600px" destroy-on-close>
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
                <el-form-item label="设备名称" prop="deviceName">
                    <el-input v-model="addForm.deviceName" placeholder="请输入设备名称"></el-input>
                </el-form-item>
                <el-form-item label="设备类型" prop="deviceType">
                    <el-select v-model="addForm.deviceType" placeholder="请选择设备类型" style="width: 100%;">
                        <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label"
                            :value="Number(item.value) || item.value" v-show="item.value !== ''" />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备型号" prop="deviceModel">
                    <el-input v-model="addForm.deviceModel" placeholder="请输入设备型号"></el-input>
                </el-form-item>
                <el-form-item label="厂商" prop="manufacturer">
                    <el-input v-model="addForm.manufacturer" placeholder="请输入厂商名称"></el-input>
                </el-form-item>
                <el-form-item label="供应商" prop="supplier">
                    <el-input v-model="addForm.supplier" placeholder="请输入供应商"></el-input>
                </el-form-item>
                <el-form-item label="安装日期" prop="installDate">
                    <el-date-picker v-model="addForm.installDate" type="date" placeholder="选择日期"
                        value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="绑定病区" prop="bindDeptId">
                    <el-select v-model="addForm.bindDeptId" placeholder="请选择绑定病区" style="width: 100%;">
                        <el-option v-for="item in wardOptions" :key="item.value" :label="item.label"
                            :value="Number(item.value) || item.value" v-show="item.value !== ''" />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备状态" prop="deviceStatus">
                    <el-radio-group v-model="addForm.deviceStatus">
                        <el-radio :label="1">正常</el-radio>
                        <el-radio :label="0">异常</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="上次维护时间" prop="lastMaintainTime">
                    <el-date-picker v-model="addForm.lastMaintainTime" type="date" placeholder="选择日期"
                        value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="下次维护时间" prop="nextMaintainTime">
                    <el-date-picker v-model="addForm.nextMaintainTime" type="date" placeholder="选择日期"
                        value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAddDevice" :loading="addLoading">确定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { Search, Refresh, User } from '@element-plus/icons-vue'
import { apiDevicePage, apiDeviceDicts, apiDeviceAdd, apiDeviceDelete, apiDeviceDetail } from '@/apis/device'
import { ElMessage } from 'element-plus'

// 搜索条件
const searchQuery = reactive({
    deviceName: '',
    deviceType: '',
    ward: '',
    purchaseDateRange: []
})

// 字典数据
const deviceTypeOptions = ref([])
const wardOptions = ref([])

// 表格数据
const tableData = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取字典项
const getDicts = async () => {
    try {
        const res = await apiDeviceDicts();
        if (res.code === 0 && res.data) {
            deviceTypeOptions.value = res.data.deviceTypeOptions || [];
            wardOptions.value = res.data.wardOptions || [];
        }
    } catch (error) {
        console.error('获取设备字典失败:', error);
    }
}

// 获取列表数据
const fetchDevices = async () => {
    loading.value = true;
    try {
        let purchaseDateStart = undefined;
        let purchaseDateEnd = undefined;
        if (searchQuery.purchaseDateRange && searchQuery.purchaseDateRange.length === 2) {
            purchaseDateStart = searchQuery.purchaseDateRange[0];
            purchaseDateEnd = searchQuery.purchaseDateRange[1];
        }

        const params = {
            deviceName: searchQuery.deviceName || undefined,
            deviceType: searchQuery.deviceType || undefined,
            ward: searchQuery.ward || undefined,
            purchaseDateStart,
            purchaseDateEnd,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        };

        const res = await apiDevicePage(params);
        if (res.code === 0 && res.data) {
            tableData.value = res.data.records || [];
            total.value = res.data.total || 0;
        }
    } catch (error) {
        console.error('获取设备列表失败:', error);
    } finally {
        loading.value = false;
    }
}

// 查询方法
const handleSearch = () => {
    pageNum.value = 1;
    fetchDevices();
}

// 重置方法
const handleReset = () => {
    searchQuery.deviceName = '';
    searchQuery.deviceType = '';
    searchQuery.ward = '';
    searchQuery.purchaseDateRange = [];
    handleSearch();
}

const handleSizeChange = (val) => {
    pageSize.value = val;
    pageNum.value = 1;
    fetchDevices();
}

const handleCurrentChange = (val) => {
    pageNum.value = val;
    fetchDevices();
}

// 帮助函数匹配状态颜色: 正常等
const getStatusType = (status) => {
    if (status === 1 || status === '正常') return 'success';
    if (status === 0 || status === '异常') return 'danger';
    return 'warning';
}

// 弹窗及数据
const dialogVisible = ref(false)
const detailLoading = ref(false)
const currentDetail = ref(null)
const dialogTitle = ref('设备使用详情')

// 新增设备弹窗相关
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref(null)
const addForm = reactive({
    deviceName: "",
    deviceType: "",
    deviceModel: "",
    manufacturer: "",
    supplier: "",
    installDate: "",
    bindDeptId: "",
    lastMaintainTime: "",
    nextMaintainTime: "",
    deviceStatus: 1
})

const addRules = {
    deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    deviceModel: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
    manufacturer: [{ required: true, message: '请输入厂商', trigger: 'blur' }],
    bindDeptId: [{ required: true, message: '请选择绑定病区', trigger: 'change' }],
    deviceStatus: [{ required: true, message: '请选择状态', trigger: 'change' }],
    installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }],
}

const handleAdd = () => {
    // 重置表单
    Object.keys(addForm).forEach(key => addForm[key] = '');
    addForm.deviceStatus = 1;
    addDialogVisible.value = true;
    // 重置校验状态
    if (addFormRef.value) {
        addFormRef.value.clearValidate();
    }
}

const submitAddDevice = async () => {
    if (!addFormRef.value) return;
    await addFormRef.value.validate(async (valid) => {
        if (valid) {
            addLoading.value = true;
            try {
                const res = await apiDeviceAdd({ ...addForm });
                if (res.code === 0) {
                    ElMessage.success('新增设备成功');
                    addDialogVisible.value = false;
                    handleSearch();
                } else {
                    ElMessage.error(res.message || '新增设备失败');
                }
            } catch (error) {
                console.error('新增设备失败:', error);
                ElMessage.error('新增设备失败');
            } finally {
                addLoading.value = false;
            }
        }
    });
}

const handleDelete = async (row) => {
    if (!row.deviceId) return;
    try {
        const res = await apiDeviceDelete(row.deviceId);
        if (res.code === 0) {
            ElMessage.success('删除设备成功');
            fetchDevices();
        } else {
            ElMessage.error(res.message || '删除设备失败');
        }
    } catch (error) {
        console.error('删除设备失败:', error);
        ElMessage.error('删除设备失败');
    }
}

// 查看详情
const handleDetail = async (row) => {
    dialogTitle.value = `${row.deviceName || row.deviceModel || '设备'} - 使用详情`
    dialogVisible.value = true;
    detailLoading.value = true;
    currentDetail.value = null; // reset
    try {
        const res = await apiDeviceDetail(row.deviceId);
        if (res.code === 0 && res.data) {
            currentDetail.value = res.data;
        } else {
            ElMessage.error(res.message || '获取设备详情数据失败');
        }
    } catch (error) {
        console.error('获取设备详情失败:', error);
    } finally {
        detailLoading.value = false;
    }
}

onMounted(() => {
    getDicts();
    fetchDevices();
})
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
