<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getStudentCountData, getStudentDegreeData } from '@/api/report';

const degreeChartRef = ref(null);
const countChartRef = ref(null);
let degreeChart = null;
let countChart = null;

// 学员学历统计（饼图）
const loadDegreeChart = async () => {
  const data = await getStudentDegreeData();
  degreeChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '学员学历',
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

// 班级人数统计（柱状图）
const loadCountChart = async () => {
  const data = await getStudentCountData();
  countChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 40, right: 20, bottom: 70, left: 40 },
    xAxis: {
      type: 'category',
      data: data.clazzList,
      axisLabel: { interval: 0, rotate: 25 },
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
          color: '#67c23a',
          borderRadius: [6, 6, 0, 0],
        },
        label: { show: true, position: 'top' },
      },
    ],
  });
};

// 窗口尺寸变化时图表自适应
const handleResize = () => {
  degreeChart?.resize();
  countChart?.resize();
};

onMounted(async () => {
  degreeChart = echarts.init(degreeChartRef.value);
  countChart = echarts.init(countChartRef.value);
  window.addEventListener('resize', handleResize);
  await loadDegreeChart();
  await loadCountChart();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  degreeChart?.dispose();
  countChart?.dispose();
});
</script>

<template>
  <el-row :gutter="16">
    <el-col :xs="24" :md="12">
      <el-card class="page-card" shadow="never">
        <template #header>
          <span class="page-title">学员学历统计</span>
        </template>
        <div ref="degreeChartRef" class="chart"></div>
      </el-card>
    </el-col>
    <el-col :xs="24" :md="12">
      <el-card class="page-card" shadow="never">
        <template #header>
          <span class="page-title">班级人数统计</span>
        </template>
        <div ref="countChartRef" class="chart"></div>
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
