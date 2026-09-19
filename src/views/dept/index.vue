<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { addDept, deleteDept, getDeptList, updateDept } from '@/api/dept';

const tableData = ref([]);

// ==================== 新增 / 编辑 ====================

const dialogVisible = ref(false);
const dialogTitle = ref('新增部门');
const formRef = ref(null);

// 弹窗表单数据
const form = reactive({
  id: null,
  name: '',
});

// 部门名称唯一性校验（编辑时排除自身）
const validateNameUnique = (rule, value, callback) => {
  const exists = tableData.value.some(
    (item) => item.name === value && item.id !== form.id,
  );
  if (exists) {
    callback(new Error('部门名称已存在'));
  } else {
    callback();
  }
};

// 表单校验规则：必填、唯一、长度为 2-10 位
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    {
      min: 2,
      max: 10,
      message: '部门名称长度为 2-10 个字符',
      trigger: 'blur',
    },
    { validator: validateNameUnique, trigger: 'blur' },
  ],
};

// 新增部门
const handleAdd = () => {
  dialogTitle.value = '新增部门';
  form.id = null;
  form.name = '';
  dialogVisible.value = true;
};

// 编辑部门
const handleEdit = (row) => {
  dialogTitle.value = '编辑部门';
  form.id = row.id;
  form.name = row.name;
  dialogVisible.value = true;
};

// 保存（新增 / 修改）
const handleSave = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (form.id) {
        await updateDept({ id: form.id, name: form.name });
        ElMessage.success('修改部门成功');
      } else {
        await addDept({ name: form.name });
        ElMessage.success('新增部门成功');
      }
      dialogVisible.value = false;
      loadDeptList();
    } catch {
      // 失败信息已由请求响应拦截器统一提示
    }
  });
};

// ==================== 删除 ====================

const handleDelete = (row) => {
  ElMessageBox.confirm('您确定要删除该部门的信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteDept(row.id);
        ElMessage.success('删除部门成功');
        loadDeptList();
      } catch {
        // 失败信息已由响应拦截器统一提示
      }
    })
    .catch(() => {});
};

// ==================== 数据加载 ====================

// 加载部门列表（根据最后修改时间正序排序，新建部门自动展示在最后一行）
const loadDeptList = async () => {
  const data = await getDeptList();
  tableData.value = [...data].sort((a, b) =>
    (a.updateTime || '').localeCompare(b.updateTime || ''),
  );
};

// 时间格式化：2023-06-01T17:51:21 → 2023-06-01 17:51:21
const formatDateTime = (value) => (value ? value.replace('T', ' ') : '');

onMounted(() => {
  loadDeptList();
});
</script>

<template>
  <el-card class="page-card" shadow="never">
    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新增部门
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" stripe>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="部门名称" min-width="240" />
      <el-table-column label="最后操作时间" min-width="240">
        <template #default="{ row }">
          {{ formatDateTime(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="240" align="center">
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

    <!-- 新增 / 编辑部门弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="420px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="部门名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入部门名称，长度为2-10位"
            maxlength="10"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
