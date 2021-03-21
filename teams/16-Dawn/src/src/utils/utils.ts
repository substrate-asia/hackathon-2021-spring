export const ApiProxyUri: string = '/nft-api';

export const categoryList: CategoryType[] = [
  {
    id: 0,
    name: 'All',
    position: 1,
  },
  {
    id: 1,
    name: '🌈 Art',
    position: 2,
  },
  {
    id: 2,
    name: '🕹 Games',
    position: 3,
  },
];

export function getImgBase64(img: any, cb: Function) {
  const fileReader = new FileReader();
  fileReader.onloadend = (e) => {
    const base64 = (e.target!.result as string) || ''; // 这里的base64就是我们所要的
    cb(base64.split('base64,')[1]);
  };
  fileReader.readAsDataURL(img);
}

export function getImgBuffer(imgBase64: string) {
  const mime = 'image/jpeg';
  const bstr = atob(imgBase64);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  /* eslint no-plusplus: */
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], 'dawn', { type: mime });
}
