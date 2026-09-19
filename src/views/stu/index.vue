<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Remove } from '@element-plus/icons-vue';
import {
  addStudent,
  deleteStudent,
  getStudentById,
  getStudentList,
  handleViolation,
  updateStudent,
} from '@/api/stu';
import { getAllClazzList } from '@/api/clazz';

// 学历选项（接口编码：1-6）
const degreeOptions = [
  { value: 1, label: '初中' },
  { value: 2, label: '高中' },
  { value: 3, label: '大专' },
  { value: 4, label: '本科' },
  { value: 5, label: '硕士' },
  { value: 6, label: '博士' },
];

// 班级列表（所属班级下拉框数据源）
const clazzOptions = ref([]);

// 学历文本
const degreeText = (degree) =>
  degreeOptions.find((item) => item.value === degree)?.label || '-';

// ==================== 查询与分页 ====================

// 查询表单（与输入控件绑定）
const queryForm = reactive({
  name: '',
  degree: null,
  clazzId: null,
});

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);

// 加载学员列表（条件分页查询）
const loadStudentList = async () => {
  const data = await getStudentList({
    name: queryForm.name.trim() || undefined,
    degree: queryForm.degree ?? undefined,
    clazzId: queryForm.clazzId ?? undefined,
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
    loadStudentList();
  }
};

// 翻页时重新加载
watch(page, () => {
  loadStudentList();
});

// 每页展示记录数变化：回到第一页（已在第一页时直接重新加载）
watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    loadStudentList();
  }
});

// 序号：按分页连续展示
const indexMethod = (index) => (page.value - 1) * pageSize.value + index + 1;

// 时间格式化：2023-06-01T17:51:21 → 2023-06-01 17:51:21
const formatDateTime = (value) => (value ? value.replace('T', ' ') : '');

// 表格多选变化
const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map((row) => row.id);
};

// ==================== 添加 / 编辑 ====================

const dialogVisible = ref(false);
const dialogTitle = ref('添加学员');
const formRef = ref(null);

// 弹窗表单数据
const form = reactive({
  id: null,
  name: '',
  no: '',
  gender: null,
  phone: '',
  idCard: '',
  isCollege: null,
  address: '',
  degree: null,
  graduationDate: '',
  clazzId: null,
});

// 表单校验规则（依据需求文档的字段限制说明）
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,10}$/,
      message: '姓名长度为 2-10 个汉字或字母',
      trigger: 'blur',
    },
  ],
  no: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{10}$/,
      message: '学号为 10 位数字或字母',
      trigger: 'blur',
    },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  isCollege: [
    { required: true, message: '请选择是否院校学员', trigger: 'change' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号码非法', trigger: 'blur' },
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '身份证号非法', trigger: 'blur' },
  ],
  address: [
    { max: 100, message: '联系地址不能超过 100 个字符', trigger: 'blur' },
  ],
  degree: [{ required: true, message: '请选择最高学历', trigger: 'change' }],
  clazzId: [{ required: true, message: '请选择所属班级', trigger: 'change' }],
};

// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    no: '',
    gender: null,
    phone: '',
    idCard: '',
    isCollege: null,
    address: '',
    degree: null,
    graduationDate: '',
    clazzId: null,
  });
};

// 添加学员
const handleAdd = () => {
  dialogTitle.value = '添加学员';
  resetForm();
  dialogVisible.value = true;
};

// 编辑学员（先查询详情回显）
const handleEdit = async (row) => {
  dialogTitle.value = '编辑学员';
  const data = await getStudentById(row.id);
  Object.assign(form, {
    id: data.id,
    name: data.name,
    no: data.no,
    gender: data.gender,
    phone: data.phone,
    idCard: data.idCard,
    isCollege: data.isCollege,
    address: data.address,
    degree: data.degree,
    graduationDate: data.graduationDate,
    clazzId: data.clazzId,
  });
  dialogVisible.value = true;
};

// 保存（添加 / 修改）
const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await updateStudent({ ...form });
        ElMessage.success('修改学员成功');
      } else {
        await addStudent({ ...form });
        ElMessage.success('添加学员成功');
      }
      dialogVisible.value = false;
      loadStudentList();
    } catch {
      // 失败信息已由请求响应拦截器统一提示
    }
  });
};

// ==================== 违纪处理 ====================

const violationVisible = ref(false);
const violationFormRef = ref(null);
const violationForm = reactive({
  id: null,
  name: '',
  score: null,
});

// 违纪扣分校验
const violationRules = {
  score: [
    { required: true, message: '请输入扣除分数', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      message: '扣除分数必须为大于 0 的数字',
      trigger: 'blur',
    },
  ],
};

// 打开违纪处理弹窗
const handleViolationClick = (row) => {
  violationForm.id = row.id;
  violationForm.name = row.name;
  violationForm.score = null;
  violationVisible.value = true;
};

// 提交违纪处理
const handleViolationSubmit = () => {
  violationFormRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      await handleViolation(violationForm.id, violationForm.score);
      ElMessage.success('违纪处理成功');
      violationVisible.value = false;
      loadStudentList();
    } catch {
      // 失败信息已由请求响应拦截器统一提示
    }
  });
};

// ==================== 删除 ====================

const handleDelete = (row) => {
  ElMessageBox.confirm('您确定要删除该学员的信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteStudent(row.id);
        ElMessage.success('删除学员成功');
        // 当前页删空时回退到上一页
        if (tableData.value.length === 1 && page.value > 1) {
          page.value -= 1;
        } else {
          loadStudentList();
        }
      } catch {
        // 失败信息已由响应拦截器统一提示
      }
    })
    .catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择要删除的学员');
    return;
  }
  ElMessageBox.confirm(
    `您确定要删除选中的 ${selectedIds.value.length} 位学员吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        const selectedCount = selectedIds.value.length;
        await deleteStudent(selectedIds.value.join(','));
        ElMessage.success('批量删除学员成功');
        selectedIds.value = [];
        // 当前页删空时回退到上一页
        if (tableData.value.length === selectedCount && page.value > 1) {
          page.value -= 1;
        } else {
          loadStudentList();
        }
      } catch {
        // 失败信息已由响应拦截器统一提示
      }
    })
    .catch(() => {});
};

// ==================== 初始化 ====================

onMounted(async () => {
  // 加载所属班级下拉数据
  clazzOptions.value = await getAllClazzList();
  // 加载学员列表
  loadStudentList();
});
</script>

<template>
  <el-card class="page-card" shadow="never">
    <!-- 查询区 -->
    <div class="search-bar">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="姓名">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="最高学历">
          <el-select
            v-model="queryForm.degree"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in degreeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级">
          <el-select
            v-model="queryForm.clazzId"
            placeholder="请选择"
            clearable
            filterable
            style="width: 220px"
          >
            <el-option
              v-for="item in clazzOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
      <div class="toolbar-buttons">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          添加学员
        </el-button>
        <el-button
          type="danger"
          :icon="Remove"
          :disabled="!selectedIds.length"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="name" label="姓名" min-width="110" />
      <el-table-column prop="no" label="学号" min-width="130" />
      <el-table-column
        prop="clazzName"
        label="班级"
        min-width="190"
        show-overflow-tooltip
      />
      <el-table-column label="性别" min-width="70" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column label="最高学历" min-width="100" align="center">
        <template #default="{ row }">{{ degreeText(row.degree) }}</template>
      </el-table-column>
      <el-table-column
        prop="violationCount"
        label="违纪次数"
        min-width="90"
        align="center"
      />
      <el-table-column
        prop="violationScore"
        label="违纪扣分"
        min-width="90"
        align="center"
      />
      <el-table-column label="最后操作时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="warning" @click="handleViolationClick(row)">
            违纪
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

    <!-- 添加 / 编辑学员弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="学号" prop="no">
          <el-input v-model="form.no" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="form.gender"
            placeholder="请选择性别"
            style="width: 100%"
          >
            <el-option :value="1" label="男" />
            <el-option :value="2" label="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否院校学员" prop="isCollege">
          <el-select
            v-model="form.isCollege"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option :value="1" label="是" />
            <el-option :value="0" label="否" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="联系地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入联系地址" />
        </el-form-item>
        <el-form-item label="最高学历" prop="degree">
          <el-select
            v-model="form.degree"
            placeholder="请选择最高学历"
            style="width: 100%"
          >
            <el-option
              v-for="item in degreeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="毕业时间" prop="graduationDate">
          <el-date-picker
            v-model="form.graduationDate"
            type="date"
            placeholder="请选择毕业时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="所属班级" prop="clazzId">
          <el-select
            v-model="form.clazzId"
            placeholder="请选择所属班级"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in clazzOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 学员违纪处理弹窗 -->
    <el-dialog
      v-model="violationVisible"
      title="学员违纪处理"
      width="420px"
      destroy-on-close
    >
      <el-form
        ref="violationFormRef"
        :model="violationForm"
        :rules="violationRules"
        label-width="90px"
      >
        <el-form-item label="学员">
          <span>{{ violationForm.name }}</span>
        </el-form-item>
        <el-form-item label="扣除分数" prop="score">
          <el-input-number
            v-model="violationForm.score"
            :min="1"
            :step="1"
            placeholder="请输入扣除分数"
            style="width: 160px"
          />
          <el-button class="clear-button" @click="violationForm.score = null">
            清空
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="violationVisible = false">取消</el-button>
        <el-button type="primary" @click="handleViolationSubmit">
          确定
        </el-button>
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

.toolbar-buttons {
  display: flex;
  align-items: center;
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

.clear-button {
  margin-left: 8px;
}
</style>
