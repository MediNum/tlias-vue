<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Remove } from '@element-plus/icons-vue';
import {
  addEmp,
  deleteEmp,
  getEmpById,
  getEmpList,
  updateEmp,
} from '@/api/emp';
import { getDeptList } from '@/api/dept';

// 职位选项（接口编码：1-5）
const jobOptions = [
  { value: 1, label: '班主任' },
  { value: 2, label: '讲师' },
  { value: 3, label: '学工主管' },
  { value: 4, label: '教研主管' },
  { value: 5, label: '咨询师' },
];

const jobText = (job) =>
  jobOptions.find((item) => item.value === job)?.label || '-';

// 部门列表（归属部门下拉框数据源）
const deptOptions = ref([]);

// ==================== 查询与分页 ====================

// 查询表单（与输入控件绑定）
const queryForm = reactive({
  name: '',
  gender: null,
  entryDateRange: [],
});

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tableData = ref([]);
const selectedIds = ref([]);

// 加载员工列表（条件分页查询）
const loadEmpList = async () => {
  const data = await getEmpList({
    name: queryForm.name.trim() || undefined,
    gender: queryForm.gender ?? undefined,
    begin: queryForm.entryDateRange?.[0] || undefined,
    end: queryForm.entryDateRange?.[1] || undefined,
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
    loadEmpList();
  }
};

// 翻页时重新加载
watch(page, () => {
  loadEmpList();
});

// 每页展示记录数变化：回到第一页（已在第一页时直接重新加载）
watch(pageSize, () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    loadEmpList();
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

// ==================== 新增 / 修改 ====================

const dialogVisible = ref(false);
const dialogTitle = ref('新增员工');
const formRef = ref(null);

// 弹窗表单数据
const form = reactive({
  id: null,
  username: '',
  name: '',
  gender: null,
  phone: '',
  image: '',
  job: null,
  salary: null,
  entryDate: '',
  deptId: null,
  exprList: [],
});

// 表单校验规则（依据需求文档的字段限制说明）
const rules = {
  username: [
    { required: true, message: '请输入员工用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z]{2,20}$/,
      message: '用户名为 2-20 个字母',
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: '请输入员工姓名', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5]{2,10}$/,
      message: '姓名为 2-10 个汉字',
      trigger: 'blur',
    },
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入员工手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号码非法', trigger: 'blur' },
  ],
};

// 重置表单数据
const resetForm = () => {
  Object.assign(form, {
    id: null,
    username: '',
    name: '',
    gender: null,
    phone: '',
    image: '',
    job: null,
    salary: null,
    entryDate: '',
    deptId: null,
    exprList: [],
  });
};

// 新增员工
const handleAdd = () => {
  dialogTitle.value = '新增员工';
  resetForm();
  dialogVisible.value = true;
};

// 修改员工（先查询详情回显）
const handleEdit = async (row) => {
  dialogTitle.value = '修改员工';
  const data = await getEmpById(row.id);
  Object.assign(form, {
    id: data.id,
    username: data.username,
    name: data.name,
    gender: data.gender,
    phone: data.phone || '',
    image: data.image || '',
    job: data.job,
    salary: data.salary,
    entryDate: data.entryDate,
    deptId: data.deptId,
    exprList: data.exprList || [],
  });
  dialogVisible.value = true;
};

// 保存（新增 / 修改）
const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await updateEmp({ ...form });
        ElMessage.success('修改员工成功');
      } else {
        await addEmp({ ...form });
        ElMessage.success('新增员工成功');
      }
      dialogVisible.value = false;
      loadEmpList();
    } catch {
      // 失败信息已由请求响应拦截器统一提示
    }
  });
};

// ==================== 头像上传 ====================

// 上传接口需要携带 token 请求头
const uploadHeaders = { token: localStorage.getItem('token') || '' };

// 上传前校验：大小不超过 2M，仅支持 PNG/JPG/JPEG
const beforeAvatarUpload = (file) => {
  const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(
    file.type,
  );
  if (!isValidType) {
    ElMessage.error('格式错误,上传失败');
    return false;
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片过大,上传失败');
    return false;
  }
  return true;
};

// 上传成功：将返回的图片地址保存到表单
const handleAvatarSuccess = (response) => {
  if (response.code === 1) {
    form.image = response.data;
    ElMessage.success('上传图片成功');
  } else {
    ElMessage.error(response.msg || '上传图片失败');
  }
};

// 上传失败
const handleAvatarError = () => {
  ElMessage.error('上传图片失败');
};

// ==================== 工作经历 ====================

// 添加一行工作经历
const addExpr = () => {
  form.exprList.push({ begin: '', end: '', company: '', job: '' });
};

// 删除一行工作经历
const removeExpr = (index) => {
  form.exprList.splice(index, 1);
};

// ==================== 删除 ====================

const handleDelete = (row) => {
  ElMessageBox.confirm('您确定要删除该员工信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteEmp(row.id);
        ElMessage.success('删除员工成功');
        // 当前页删空时回退到上一页
        if (tableData.value.length === 1 && page.value > 1) {
          page.value -= 1;
        } else {
          loadEmpList();
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
    ElMessage.warning('请先选择要删除的员工');
    return;
  }
  ElMessageBox.confirm(
    `您确定要删除选中的 ${selectedIds.value.length} 位员工吗？`,
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
        await deleteEmp(selectedIds.value.join(','));
        ElMessage.success('批量删除员工成功');
        selectedIds.value = [];
        // 当前页删空时回退到上一页
        if (tableData.value.length === selectedCount && page.value > 1) {
          page.value -= 1;
        } else {
          loadEmpList();
        }
      } catch {
        // 失败信息已由响应拦截器统一提示
      }
    })
    .catch(() => {});
};

// ==================== 初始化 ====================

onMounted(async () => {
  // 加载归属部门下拉数据
  deptOptions.value = await getDeptList();
  // 加载员工列表
  loadEmpList();
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
            placeholder="请输入员工姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-select
            v-model="queryForm.gender"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option :value="1" label="男" />
            <el-option :value="2" label="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职时间">
          <el-date-picker
            v-model="queryForm.entryDateRange"
            type="daterange"
            range-separator="到"
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
      <div class="toolbar-buttons">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增员工
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
      <el-table-column label="性别" min-width="70" align="center">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="头像" min-width="90" align="center">
        <template #default="{ row }">
          <el-avatar :size="50" :src="row.image">
            {{ row.name ? row.name.charAt(0) : '' }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column
        prop="deptName"
        label="所属部门"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column label="职位" min-width="110" align="center">
        <template #default="{ row }">{{ jobText(row.job) }}</template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" min-width="120" />
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

    <!-- 新增 / 修改员工弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="头像" prop="image">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            图片大小不超过2M，仅能上传PNG、JPEG、JPG等图片，建议上传 200*200 或
            300*300 尺寸的照片
          </div>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入员工用户名，2-20个字"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入员工姓名，2-10个字"
          />
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
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入员工手机号" />
        </el-form-item>
        <el-form-item label="职位" prop="job">
          <el-select
            v-model="form.job"
            placeholder="请选择职位"
            style="width: 100%"
          >
            <el-option
              v-for="item in jobOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input v-model.number="form.salary" placeholder="请输入员工薪资" />
        </el-form-item>
        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            placeholder="请选择入职日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="归属部门" prop="deptId">
          <el-select
            v-model="form.deptId"
            placeholder="请选择归属部门"
            style="width: 100%"
          >
            <el-option
              v-for="item in deptOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作经历">
          <div class="expr-list">
            <div
              v-for="(expr, index) in form.exprList"
              :key="index"
              class="expr-item"
            >
              <el-date-picker
                v-model="expr.begin"
                type="date"
                placeholder="开始时间"
                value-format="YYYY-MM-DD"
                style="width: 130px"
              />
              <span class="expr-sep">-</span>
              <el-date-picker
                v-model="expr.end"
                type="date"
                placeholder="结束时间"
                value-format="YYYY-MM-DD"
                style="width: 130px"
              />
              <el-input
                v-model="expr.company"
                placeholder="公司"
                maxlength="50"
                style="width: 140px"
              />
              <el-input
                v-model="expr.job"
                placeholder="职位"
                maxlength="50"
                style="width: 110px"
              />
              <el-button link type="danger" @click="removeExpr(index)">
                删除
              </el-button>
            </div>
            <el-button @click="addExpr">添加工作经历</el-button>
          </div>
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

.avatar-uploader :deep(.el-upload) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  overflow: hidden;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  color: #8c939d;
  font-size: 28px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.expr-list {
  width: 100%;
}

.expr-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.expr-sep {
  color: #909399;
}
</style>
