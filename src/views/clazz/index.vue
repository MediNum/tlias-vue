<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import {
  addClazz,
  deleteClazz,
  getClazzById,
  getClazzList,
  updateClazz,
} from '@/api/clazz';
import { getAllEmpList } from '@/api/emp';

// 学科选项（接口编码：1:java, 2:前端, 3:大数据, 4:Python, 5:Go, 6:嵌入式）
const subjectOptions = [
  { value: 1, label: 'Java' },
  { value: 2, label: '前端' },
  { value: 3, label: '大数据' },
  { value: 4, label: 'Python' },
  { value: 5, label: 'Go' },
  { value: 6, label: '嵌入式' },
];

// 员工列表（班主任下拉框数据源）
const employeeOptions = ref([]);

// ==================== 查询与分页 ====================

// 查询表单（与输入控件绑定）
const queryForm = reactive({
  name: '',
  endDateRange: [],
});

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);

// 加载班级列表（条件分页查询）
const loadClazzList = async () => {
  const data = await getClazzList({
    name: queryForm.name.trim() || undefined,
    begin: queryForm.endDateRange?.[0] || undefined,
    end: queryForm.endDateRange?.[1] || undefined,
    page: page.value,
    pageSize: pageSize.value,
  });
  tableData.value = data.rows;
  total.value = data.total;
};

// 点击查询：回到第一页并重新加载
const handleQuery = () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    loadClazzList();
  }
};

// 翻页时重新加载
watch(page, () => {
  loadClazzList();
});

// 每页展示记录数变化：回到第一页（已在第一页时直接重新加载）
watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    loadClazzList();
  }
});

// 序号：按分页连续展示
const indexMethod = (index) => (page.value - 1) * pageSize.value + index + 1;

// 状态：优先使用后端返回的 status，后端未返回时按日期兜底计算
const getStatus = (row) => {
  if (row.status) return row.status;
  const now = new Date();
  const pad = (num) => String(num).padStart(2, '0');
  const ymd = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map(pad)
    .join('-');
  if (ymd < row.beginDate) return '未开班';
  if (ymd > row.endDate) return '已结课';
  return '已开班';
};

// 状态标签颜色映射
const statusTagType = (status) => {
  if (status === '未开班') return 'warning';
  if (status === '已开班') return 'success';
  return 'info';
};

// 时间格式化：2023-06-01T17:51:21 → 2023-06-01 17:51:21
const formatDateTime = (value) => (value ? value.replace('T', ' ') : '');

// ==================== 新增 / 修改 ====================

const dialogVisible = ref(false);
const dialogTitle = ref('新增班级');
const formRef = ref(null);

// 弹窗表单数据
const form = reactive({
  id: null,
  name: '',
  room: '',
  beginDate: '',
  endDate: '',
  masterId: null,
  subject: null,
});

// 表单校验规则（依据接口文档的字段要求）
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 4, max: 30, message: '班级名称长度为 4-30 个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
      message: '班级名称非法',
      trigger: 'blur',
    },
  ],
  room: [
    { required: true, message: '请输入班级教室', trigger: 'blur' },
    { min: 1, max: 20, message: '班级教室长度为 1-20 个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/,
      message: '班级教室非法',
      trigger: 'blur',
    },
  ],
  beginDate: [{ required: true, message: '请选择开课时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结课时间', trigger: 'change' }],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
};

// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    room: '',
    beginDate: '',
    endDate: '',
    masterId: null,
    subject: null,
  });
};

// 新增班级
const handleAdd = () => {
  dialogTitle.value = '新增班级';
  resetForm();
  dialogVisible.value = true;
};

// 修改班级（先查询详情回显）
const handleEdit = async (row) => {
  dialogTitle.value = '修改班级';
  const data = await getClazzById(row.id);
  Object.assign(form, {
    id: data.id,
    name: data.name,
    room: data.room,
    beginDate: data.beginDate,
    endDate: data.endDate,
    masterId: data.masterId,
    subject: data.subject,
  });
  dialogVisible.value = true;
};

// 保存（新增 / 修改）
const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await updateClazz({ ...form });
        ElMessage.success('修改班级成功');
      } else {
        await addClazz({ ...form });
        ElMessage.success('新增班级成功');
      }
      dialogVisible.value = false;
      loadClazzList();
    } catch {
      // 失败信息已由请求响应拦截器统一提示
    }
  });
};

// ==================== 删除 ====================

const handleDelete = (row) => {
  ElMessageBox.confirm('您确定要删除该班级的信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteClazz(row.id);
        ElMessage.success('删除班级成功');
        // 当前页删空时回退到上一页
        if (tableData.value.length === 1 && page.value > 1) {
          page.value -= 1;
        } else {
          loadClazzList();
        }
      } catch {
        // 失败信息（如班级下有学生）已由响应拦截器统一提示
      }
    })
    .catch(() => {});
};

// ==================== 初始化 ====================

onMounted(async () => {
  // 加载班主任下拉数据（全部员工）
  employeeOptions.value = await getAllEmpList();
  // 加载班级列表
  loadClazzList();
});
</script>

<template>
  <el-card class="page-card" shadow="never">
    <!-- 查询区 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="班级名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入班级名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="结课时间">
          <el-date-picker
            v-model="queryForm.endDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增班级
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
        :index="indexMethod"
      />
      <el-table-column
        prop="name"
        label="班级名称"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column prop="room" label="班级教室" min-width="100" />
      <el-table-column prop="masterName" label="班主任" min-width="100" />
      <el-table-column prop="beginDate" label="开课时间" min-width="120" />
      <el-table-column prop="endDate" label="结课时间" min-width="120" />
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTagType(getStatus(row))">
            {{ getStatus(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后操作时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
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

    <!-- 新增 / 修改班级弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="班级名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入班级名称，如：西安黑马JavaEE就业100期"
          />
        </el-form-item>
        <el-form-item label="班级教室" prop="room">
          <el-input v-model="form.room" placeholder="请填写班级教室" />
        </el-form-item>
        <el-form-item label="开课时间" prop="beginDate">
          <el-date-picker
            v-model="form.beginDate"
            type="date"
            placeholder="选择开课时间，如：2025-01-01"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结课时间" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结课时间，如：2025-01-01"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="班主任" prop="masterId">
          <el-select
            v-model="form.masterId"
            placeholder="请选择班主任"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="emp in employeeOptions"
              :key="emp.id"
              :label="emp.name"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学科" prop="subject">
          <el-select
            v-model="form.subject"
            placeholder="请选择学科"
            style="width: 100%"
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

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
