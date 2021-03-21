/*
 * @Description:资产分类定义
 * @Author: 龙春雨
 * @Date: 2021-03-09 16:00:22
 */
const list = [
  '二次元动漫',
  '摄影作品',
  '短视频',
  '原创音乐',
  '原创文稿',
  '设计图纸',
  '机密文件',
  '企业代码',
  '电子合同'
];
const categoryList = list.map((item, index) => {
  return {
    label: item,
    value: String(index + 1)
  };
});

const assetsType = [
  {
    label: '版权',
    value: 1
  },
  {
    label: '使用权',
    value: 2
  }
];
export { categoryList, assetsType };
