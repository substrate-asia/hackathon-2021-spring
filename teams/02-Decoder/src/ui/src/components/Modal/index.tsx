import React, { ReactNode } from 'react';
import { Modal as AModal } from 'antd';
import { Button } from '@/components/Button';
import { useTranslation } from '@/components';

interface Props {
  onCancel?: () => void;
  onOk?: () => void;
  title?: string;
  visible?: boolean;
  children?: ReactNode;
  className?: string;
}

export const Modal: React.FC<Props> = ({
  onCancel,
  onOk,
  title,
  visible,
  children,
  className
}) => {
  const { t } = useTranslation();

  return (
    <AModal
      title={title}
      visible={visible}
      className={className}
      onCancel={onCancel}
      onOk={onOk}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      footer={[
        <Button key="back" onClick={onCancel}>
          {t('Cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={onOk}>
          {t('Confirm')}
        </Button>
      ]}
    >
      {children}
    </AModal>
  )
}
