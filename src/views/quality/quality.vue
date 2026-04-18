<template>
  <div class="quality-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchQuery" class="form-inline">
        <el-form-item label="设备名称：">
          <el-select v-model="searchQuery.deviceName" placeholder="全部设备" clearable style="width: 180px">
            <el-option label="心电图机ECG-2000" value="心电图机ECG-2000"></el-option>
            <el-option label="动态心电图仪Holter-500" value="动态心电图仪Holter-500"></el-option>
            <el-option label="床边监护仪MX700" value="床边监护仪MX700"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="测试时间：">
          <el-date-picker
            v-model="searchQuery.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态：">
          <el-select v-model="searchQuery.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="异常" value="异常"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格部分 -->
    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" class="custom-table" max-height="calc(100vh - 200px)">
        <el-table-column prop="deviceName" label="设备名称" min-width="160"></el-table-column>
        <el-table-column prop="department" label="所属病区" min-width="140"></el-table-column>
        <el-table-column prop="testTime" label="测试时间" width="180"></el-table-column>
        <el-table-column prop="testType" label="测试类型" width="120"></el-table-column>
        <el-table-column prop="tester" label="测试人员" width="120"></el-table-column>
        <el-table-column prop="deviceStatus" label="设备状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.deviceStatus === '正常' ? 'success' : 'danger'" plain size="small">
              {{ row.deviceStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="testResult" label="测试结果" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.testResult === '通过' ? 'primary' : 'warning'" 
              :plain="true" 
              size="small"
              :class="row.testResult === '通过' ? 'tag-primary-plain' : 'tag-warning-plain'"
            >
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
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'

// 搜索条件
const searchQuery = reactive({
  deviceName: '',
  timeRange: ['2026-03-15', '2026-04-14'],
  status: ''
})

// 表格数据模拟 (根据截图)
const tableData = ref([
  { deviceName: '心电图机ECG-2000', department: '心血管内科一区', testTime: '2026-04-10 10:30:00', testType: '日检', tester: '李护士', deviceStatus: '正常', testResult: '通过', remark: '各项指标正常' },
  { deviceName: '心电图机ECG-3000', department: '心血管内科二区', testTime: '2026-04-10 09:15:00', testType: '日检', tester: '王护士', deviceStatus: '正常', testResult: '通过', remark: '各项指标正常' },
  { deviceName: '动态心电图仪Holter-500', department: '心血管内科', testTime: '2026-04-08 14:00:00', testType: '周检', tester: '张护士', deviceStatus: '异常', testResult: '未通过', remark: '通道3信号微弱，需维护' },
  { deviceName: '远程心电监测仪RM-200', department: '居家监护', testTime: '2026-04-11 08:00:00', testType: '远程检测', tester: '系统自动', deviceStatus: '正常', testResult: '通过', remark: '通信正常' },
  { deviceName: '床边监护仪MX700', department: 'ICU', testTime: '2026-04-11 07:00:00', testType: '日检', tester: '陈护士', deviceStatus: '正常', testResult: '通过', remark: '心电模块工作正常' },
  { deviceName: '数字心电图机BeneHeart R12', department: '急诊科', testTime: '2026-04-11 08:30:00', testType: '日检', tester: '赵护士', deviceStatus: '正常', testResult: '通过', remark: '12导联采集正常' },
  { deviceName: '便携式心电仪PE-100', department: '神经内科', testTime: '2026-04-10 15:00:00', testType: '周检', tester: '刘护士', deviceStatus: '异常', testResult: '未通过', remark: '电池续航不足，需更换电池' },
  { deviceName: '床边监护仪Dash 5000', department: 'CCU', testTime: '2026-04-11 06:00:00', testType: '日检', tester: '孙护士', deviceStatus: '正常', testResult: '通过', remark: '监护功能正常' },
  { deviceName: '心电图机ECG-2000', department: '老年病科', testTime: '2026-04-09 11:00:00', testType: '周检', tester: '周护士', deviceStatus: '正常', testResult: '通过', remark: '设备运行稳定' },
  { deviceName: '远程心电监测仪RM-200', department: '居家监护', testTime: '2026-04-11 10:00:00', testType: '远程检测', tester: '系统自动', deviceStatus: '异常', testResult: '未通过', remark: '信号弱，建议检查网络' }
])

// 查询方法
const handleSearch = () => {
  console.log('搜索:', searchQuery)
}

// 重置方法
const handleReset = () => {
  searchQuery.deviceName = ''
  searchQuery.timeRange = []
  searchQuery.status = ''
}

// 操作方法
const handleView = (row) => {
  console.log('查看详情:', row)
}

const handleEdit = (row) => {
  console.log('编辑:', row)
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
