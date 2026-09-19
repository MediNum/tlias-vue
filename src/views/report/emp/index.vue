<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getEmpGenderData, getEmpJobData } from '@/api/report';

const genderChartRef = ref(null);
const jobChartRef = ref(null);
let genderChart = null;
let jobChart = null;

// 员工性别统计（饼图）
const loadGenderChart = async () => {
  const data = await getEmpGenderData();
  genderChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '员工性别',
        type: 'pie',
        radius: ['32%', '62%'],
        center: ['50%', '46%'],
        data,
        itemStyle: {
          borderColor: '#fff',
          borderRadius: 6,
          borderWidth: 2,
        },
        label: { formatter: '{b}: {c} 人' },
      },
    ],
  });
};

// 员工职位人数统计（柱状图）
const loadJobChart = async () => {
  const data = await getEmpJobData();
  jobChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 40, right: 20, bottom: 30, left: 40 },
    xAxis: {
      type: 'category',
      data: data.jobList,
      axisLabel: { interval: 0 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: data.dataList,
        barWidth: '45%',
        itemStyle: {
          color: '#409eff',
          borderRadius: [6, 6, 0, 0],
        },
        label: { show: true, position: 'top' },
      },
    ],
  });
};

// 窗口尺寸变化时图表自适应
const handleResize = () => {
  genderChart?.resize();
  jobChart?.resize();
};

onMounted(async () => {
  genderChart = echarts.init(genderChartRef.value);
  jobChart = echarts.init(jobChartRef.value);
  window.addEventListener('resize', handleResize);
  await loadGenderChart();
  await loadJobChart();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  genderChart?.dispose();
  jobChart?.dispose();
});
</script>

<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="12">
      <el-card class="page-card" shadow="never">
        <template #header>
          <span class="page-title">员工性别统计</span>
        </template>
        <div ref="genderChartRef" class="chart"></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :md="12">
      <el-card class="page-card" shadow="never">
        <template #header>
          <span class="page-title">员工职位统计</span>
        </template>
        <div ref="jobChartRef" class="chart"></div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.page-title {
  font-weight: 600;
}

.chart {
  height: 420px;
}
</style>
