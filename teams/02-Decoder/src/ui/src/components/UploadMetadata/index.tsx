import { Modal } from 'antd';
import React, { FC } from 'react';

interface UploadMetadataProps {
  uploadMetadata: () => Promise<void>;
  visible: boolean;
  close: () => void;
}

export const UploadMetadata: FC<UploadMetadataProps> = ({
  close,
  uploadMetadata,
  visible
}) => {
  return (
    <Modal
      cancelText={'Cancel'}
      okText={'Upload'}
      onCancel={close}
      onOk={uploadMetadata}
      visible={visible}
    >
      <p>Upload metadata for best experience.</p>
    </Modal>
  );
};
