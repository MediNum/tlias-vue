import request from '@/utils/request';

// 上传图片：返回图片的访问路径
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
