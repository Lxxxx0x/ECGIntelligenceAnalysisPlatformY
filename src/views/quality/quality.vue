<template>
    <div class="quality-management">
        <!-- 搜索栏 -->
        <div class="search-bar">
            <el-form :inline="true" :model="searchQuery" class="form-inline">
                <el-form-item label="设备名称：">
                    <el-select v-model="searchQuery.deviceId" placeholder="全部设备" clearable style="width: 180px">
                        <el-option v-for="item in dicts.deviceOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="测试类型：">
                    <el-select v-model="searchQuery.testType" placeholder="全部类型" clearable style="width: 150px">
                        <el-option v-for="item in dicts.testTypeOptions" :key="item.value" :label="item.label"
                            :value="item.label === '全部类型' ? '' : item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="测试结果：">
                    <el-select v-model="searchQuery.testResult" placeholder="全部结果" clearable style="width: 150px">
                        <el-option v-for="item in dicts.testStatusOptions" :key="item.value" :label="item.label"
                            :value="item.label === '全部状态' ? '' : item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="设备状态：">
                    <el-select v-model="searchQuery.deviceStatus" placeholder="全部状态" clearable style="width: 150px">
                        <el-option label="正常" value="正常"></el-option>
                        <el-option label="异常" value="异常"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="测试时间：">
                    <el-date-picker v-model="searchQuery.timeRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                        style="width: 260px">
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
                            <RefreshRight />
                        </el-icon>
                        重置
                    </el-button>
                    <el-button type="success" @click="handleAdd">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增质控
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 表格部分 -->
        <div class="table-container">
            <el-table :data="tableData" v-loading="loading" style="width: 100%" class="custom-table"
                max-height="calc(100vh - 200px)">
                <el-table-column prop="qcId" label="质控单号" min-width="120"></el-table-column>
                <el-table-column prop="deviceName" label="设备名称" min-width="160"></el-table-column>
                <el-table-column prop="deptName" label="所属科室" min-width="140"></el-table-column>
                <el-table-column prop="testTime" label="测试时间" width="180"></el-table-column>
                <el-table-column prop="testType" label="测试类型" width="120"></el-table-column>
                <el-table-column prop="testUserName" label="测试人员" width="120"></el-table-column>
                <el-table-column prop="deviceStatus" label="设备状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.deviceStatus === '正常' ? 'success' : 'danger'" plain size="small">
                            {{ row.deviceStatus }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="testResult" label="测试结果" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.testResult === '通过' ? 'primary' : 'warning'" :plain="true" size="small"
                            :class="row.testResult === '通过' ? 'tag-primary-plain' : 'tag-warning-plain'">
                            {{ row.testResult }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip></el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="handleView(row)">查看详情</el-button>
                        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 查看详情对话框 -->
        <el-dialog v-model="detailVisible" title="质控详情" width="800px">
            <el-descriptions :column="2" border v-loading="detailLoading">
                <el-descriptions-item label="质控单号">{{ currentDetail.qcId }}</el-descriptions-item>
                <el-descriptions-item label="设备名称">{{ currentDetail.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="所属科室">{{ currentDetail.deptName }}</el-descriptions-item>
                <el-descriptions-item label="测试人员">{{ currentDetail.testUserName }}</el-descriptions-item>
                <el-descriptions-item label="测试类型">{{ currentDetail.testType }}</el-descriptions-item>
                <el-descriptions-item label="测试时间">{{ currentDetail.testTime }}</el-descriptions-item>
                <el-descriptions-item label="设备状态">
                    <el-tag :type="currentDetail.deviceStatus === '正常' ? 'success' : 'danger'" size="small">
                        {{ currentDetail.deviceStatus }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="测试结果">
                    <el-tag :type="currentDetail.testResult === '通过' ? 'success' : 'danger'" size="small">
                        {{ currentDetail.testResult }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ currentDetail.updateTime }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ currentDetail.remark }}</el-descriptions-item>
            </el-descriptions>

            <!-- 子表 indicatorDetails -->
            <div style="margin-top: 20px;">
                <h4>指标明细</h4>
                <el-table :data="currentDetail.indicatorDetails" border style="width: 100%" v-loading="detailLoading"
                    class="custom-table" header-cell-class-name="table-header-gray">
                    <el-table-column prop="indicatorName" label="指标名称"></el-table-column>
                    <el-table-column prop="indicatorValue" label="指标值"></el-table-column>
                    <el-table-column prop="result" label="结果">
                        <template #default="{ row }">
                            <span
                                :style="{ color: ['通过', '正常'].includes(row.result) ? '#67C23A' : (['未通过', '异常'].includes(row.result) ? '#F56C6C' : '#333') }">
                                {{ row.result }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="detailVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="formVisible" :title="isEdit ? '编辑质控' : '新增质控'" width="600px">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
                <template v-if="!isEdit">
                    <el-form-item label="选择设备" prop="deviceId">
                        <el-select v-model="formData.deviceId" placeholder="请选择设备" style="width: 100%;">
                            <el-option v-for="item in dicts.deviceOptions.filter(opt => opt.value !== '')"
                                :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="测试类型" prop="testType">
                        <el-select v-model="formData.testType" placeholder="请选择测试类型" style="width: 100%;">
                            <el-option v-for="item in dicts.testTypeOptions.filter(opt => opt.value !== '')"
                                :key="item.value" :label="item.label" :value="item.label"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="测试工号" prop="testUserId">
                        <el-input v-model.number="formData.testUserId" placeholder="请输入测试人员ID (例如: 1305)"></el-input>
                    </el-form-item>
                    <el-form-item label="测试时间" prop="testTime">
                        <el-date-picker v-model="formData.testTime" type="datetime" placeholder="选择日期时间"
                            value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </template>

                <el-form-item label="设备状态" prop="deviceStatus">
                    <el-radio-group v-model="formData.deviceStatus">
                        <el-radio label="正常">正常</el-radio>
                        <el-radio label="异常">异常</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="测试结果" prop="testResult">
                    <el-radio-group v-model="formData.testResult">
                        <el-radio label="通过">通过</el-radio>
                        <el-radio label="未通过">未通过</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="formData.remark" type="textarea" rows="3" placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="formVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
    apiQualityControlPage,
    apiQualityControlDicts,
    apiQualityControlAdd,
    apiQualityControlEdit,
    apiQualityControlDetail
} from '@/apis/quality'

// 字典数据
const dicts = reactive({
    deviceOptions: [],
    testStatusOptions: [],
    testTypeOptions: []
})

// 搜索条件
const searchQuery = reactive({
    deviceId: '',
    timeRange: [],
    testType: '',
    testResult: '',
    deviceStatus: ''
})

// 表格及分页数据
const tableData = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 查询方法
const handleSearch = () => {
    pageNum.value = 1
    fetchData()
}

// 重置方法
const handleReset = () => {
    searchQuery.deviceId = ''
    searchQuery.timeRange = []
    searchQuery.testType = ''
    searchQuery.testResult = ''
    searchQuery.deviceStatus = ''
    pageNum.value = 1
    fetchData()
}

// 获取字典数据
const fetchDicts = async () => {
    try {
        const res = await apiQualityControlDicts()
        const responseData = res.data || res
        // 确保深层 data 被解析
        const data = responseData.data || responseData
        if (data) {
            dicts.deviceOptions = data.deviceOptions || []
            dicts.testStatusOptions = data.testStatusOptions || []
            dicts.testTypeOptions = data.testTypeOptions || []
        }
    } catch (error) {
        console.error('获取字典数据失败', error)
    }
}

// 获取数据
const fetchData = async () => {
    loading.value = true
    try {
        let startTime = undefined
        let endTime = undefined
        if (searchQuery.timeRange && searchQuery.timeRange.length === 2) {
            startTime = searchQuery.timeRange[0]
            endTime = searchQuery.timeRange[1]
        }

        const params = {
            deviceId: searchQuery.deviceId || undefined,
            testType: searchQuery.testType || undefined,
            testResult: searchQuery.testResult || undefined,
            deviceStatus: searchQuery.deviceStatus || undefined,
            startTime,
            endTime,
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }

        const res = await apiQualityControlPage(params)
        // 兼容不同接口返回格式结构
        const responseData = res.data || res
        tableData.value = responseData.records || responseData.rows || []
        total.value = responseData.total || 0
    } catch (error) {
        console.error('获取质控数据失败', error)
    } finally {
        loading.value = false
    }
}

// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val
    fetchData()
}

const handleCurrentChange = (val) => {
    pageNum.value = val
    fetchData()
}

onMounted(async () => {
    await fetchDicts()
    fetchData()
})

// --- 新增与编辑逻辑 ---
const formVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

const formData = reactive({
    qcId: null,
    deviceId: '',
    testType: '',
    testUserId: '',
    testTime: '',
    deviceStatus: '正常',
    testResult: '通过',
    remark: ''
})

const formRules = {
    deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
    testType: [{ required: true, message: '请选择测试类型', trigger: 'change' }],
    testUserId: [{ required: true, message: '请输入测试工号', trigger: 'blur' }],
    testTime: [{ required: true, message: '请选择测试时间', trigger: 'change' }],
    deviceStatus: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
    testResult: [{ required: true, message: '请选择测试结果', trigger: 'change' }]
}

const handleAdd = () => {
    isEdit.value = false
    Object.assign(formData, {
        qcId: null,
        deviceId: '',
        testType: '',
        testUserId: '',
        testTime: '',
        deviceStatus: '正常',
        testResult: '通过',
        remark: ''
    })
    formVisible.value = true
    setTimeout(() => formRef.value?.clearValidate(), 0)
}

const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(formData, {
        qcId: row.qcId,
        deviceStatus: row.deviceStatus,
        testResult: row.testResult,
        remark: row.remark
    })
    formVisible.value = true
    setTimeout(() => formRef.value?.clearValidate(), 0)
}

const submitForm = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        try {
            if (isEdit.value) {
                await apiQualityControlEdit({
                    qcId: formData.qcId,
                    testResult: formData.testResult,
                    deviceStatus: formData.deviceStatus,
                    remark: formData.remark
                })
                ElMessage.success('编辑成功')
            } else {
                await apiQualityControlAdd({
                    deviceId: Number(formData.deviceId),
                    testType: formData.testType,
                    testUserId: Number(formData.testUserId),
                    testResult: formData.testResult,
                    deviceStatus: formData.deviceStatus,
                    testTime: formData.testTime,
                    remark: formData.remark
                })
                ElMessage.success('新增成功')
            }
            formVisible.value = false
            fetchData()
        } catch (error) {
            console.error('提交失败', error)
            ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
        } finally {
            submitLoading.value = false
        }
    })
}

// --- 详情逻辑 ---
const detailVisible = ref(false)
const detailLoading = ref(false)
const currentDetail = ref({})

const handleView = async (row) => {
    detailVisible.value = true
    detailLoading.value = true
    try {
        const res = await apiQualityControlDetail(row.qcId)
        currentDetail.value = res.data || res || {}
    } catch (error) {
        console.error('获取详情失败', error)
        ElMessage.error('获取详情失败')
    } finally {
        detailLoading.value = false
    }
}
</script>

<style scoped>
.quality-management {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 60px);
}

.search-bar {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.05);
}

.search-bar .el-form-item {
    margin-bottom: 0;
    margin-right: 24px;
}

.table-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.05);
}

/* 调整表格表头和行样式以符合设计图 */
.custom-table {
    --el-table-header-bg-color: #fafafa;
    --el-table-header-text-color: #333;
}

:deep(.custom-table th.el-table__cell) {
    font-weight: 600;
    padding: 12px 0;
}

:deep(.custom-table .el-table__row) {
    height: 60px;
}

/* Tag样式定制 */
:deep(.el-tag--success.is-plain) {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
    color: #67c23a;
}

:deep(.el-tag--danger.is-plain) {
    background-color: #fef0f0;
    border-color: #fde2e2;
    color: #f56c6c;
}

.tag-primary-plain {
    background-color: #ecf5ff !important;
    border-color: #d9ecff !important;
    color: #409eff !important;
}

.tag-warning-plain {
    background-color: #fdf6ec !important;
    border-color: #faecd8 !important;
    color: #e6a23c !important;
}
</style>
