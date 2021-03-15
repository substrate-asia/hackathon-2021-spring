import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ReactJson from 'react-json-view';

import Card from '../../components/card';

const AboutCard: FC<{ about: string }> = ({ about }) => {
  const { t } = useTranslation();
  return (
    <Card title={t('detail.title.class')}>
      <ReactJson
        name={false}
        src={about}
        indentWidth={1}
        collapseStringsAfterLength={100}
        enableClipboard={false}
        displayDataTypes={false}
      />
    </Card>
  );
};

export default AboutCard;
