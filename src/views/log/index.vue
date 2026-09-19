<script setup>
import { onMounted, ref, watch } from 'vue';
import { getLogPage } from '@/api/report';

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

// 加载日志列表（分页查询）
const loadLogList = async () => {
  const data = await getLogPage({
    page: page.value,
    pageSize: pageSize.value,
  });
  tableData.value = data.rows;
  total.value = data.total;
};

// 翻页时重新加载
watch(page, () => {
  loadLogList();
});

// 每页展示记录数变化：回到第一页（已在第一页时直接重新加载）
watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    loadLogList();
  }
});

// 序号：按分页连续展示
const indexMethod = (index) => (page.value - 1) * pageSize.value + index + 1;

// 时间格式化：2023-06-01T17:51:21 → 2023-06-01 17:51:21
const formatDateTime = (value) => (value ? value.replace('T', ' ') : '');

onMounted(() => {
  loadLogList();
});
</script>

<template>
  <el-card class="page-card" shadow="never">
    <!-- 数据表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
        :index="indexMethod"
      />
      <el-table-column prop="operateEmpName" label="操作人" width="100" />
      <el-table-column label="操作时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.operateTime) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="className"
        label="类名"
        min-width="260"
        show-overflow-tooltip
      />
      <el-table-column prop="methodName" label="方法名" width="120" />
      <el-table-column
        prop="methodParams"
        label="请求参数"
        min-width="240"
        show-overflow-tooltip
      />
      <el-table-column
        prop="returnValue"
        label="返回值"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column label="耗时(ms)" width="100" align="center">
        <template #default="{ row }">{{ row.costTime }}</template>
      </el-table-column>
    </el-table>

    <!-- 分页：分页条居左，每页展示记录数紧随其右侧 -->
    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, prev, pager, next, jumper"
      />
      <div class="page-size-box">
        <span class="page-size-label">每页展示记录数</span>
        <el-select v-model="pageSize" style="width: 100px">
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
          <el-option :value="100" label="100" />
        </el-select>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  margin-top: 16px;
}

.page-size-box {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.page-size-label {
  margin-right: 8px;
  color: #606266;
  font-size: 14px;
}
</style>
