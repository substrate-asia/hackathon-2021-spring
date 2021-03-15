import React, { FC, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Button,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputRightAddon,
  Stack,
  Checkbox,
  Radio,
  RadioGroup,
  Heading,
  AlertIcon,
  Alert,
  Text,
  Box,
  Center,
  useToast,
} from '@chakra-ui/react';
import { Field, FieldProps, Form, Formik } from 'formik';
import * as yup from 'yup';
import { globalStore } from 'rekv';
import { useTranslation } from 'react-i18next';

import NFormControl from '../../components/formControl';
import colors from '../../themes/colors';
import NSelect from '../../components/nSelect';
import { createOrder } from '../../api/polka';

const ErrorMessage: FC<{ message: string }> = ({ message }) => (
  <Alert status="error" color="white" backgroundColor={colors.failure}>
    <AlertIcon color="white" />
    {message}
  </Alert>
);

export interface SalesSettingModalProps {
  open: boolean;
  onAfterConfirm: (success: boolean) => void;
  onClose: () => void;
  categories: string[];
  classId: string;
  tokenId: string;
}

// TODO: Translation messages
const SalesSettingSchema = yup.object().shape({
  price: yup
    .number()
    .moreThan(
      1,
      // 'number should more than 1 MFT'
    )
    // 'price is required'
    .required(),
  // expiration: yup.number(),
  category: yup.number().required(),
  pledge: yup.number().moreThan(200).required(),
});

const SalesSettingModal: FC<SalesSettingModalProps> = ({
  open,
  onClose,
  onAfterConfirm: onConfirm,
  categories = null,
  classId,
  tokenId,
}) => {
  const [expirationOpen, setExpirationOpen] = useState(false);
  const { t } = useTranslation();
  const { account } = globalStore.useState('account');
  const toast = useToast();

  // FIXME: Add types
  const handleSubmit = (values: any, actions: any) => {
    const orderParams = {
      address: account.address,
      categoryId: values.category,
      deposit: values.pledge,
      price: values.price,
      classId,
      tokenId,
      cb: {
        success: () => {
          toast({
            title: 'success',
            status: 'success',
            position: 'top',
            duration: 3000,
          });
          actions.setSubmitting(false);
          actions.resetForm();
          onClose();
          onConfirm(true);
        },
        error: (error: string) => {
          toast({
            title: 'success',
            status: 'error',
            position: 'top',
            duration: 3000,
            description: error,
          });
          actions.setSubmitting(false);
          onClose();
          onConfirm(false);
        },
      },
    };
    // TODO: update types
    createOrder(orderParams as any);
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h3" size="md">
            {t('detail.modal.sales-setting.title')}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />

        <Formik
          initialValues={{
            price: undefined,
            // expiration: undefined,
            category: undefined,
            pledge: undefined,
          }}
          onSubmit={handleSubmit}
          validationSchema={SalesSettingSchema}
        >
          {/* TODO: Add invalid feedback and styles in each field */}
          {({ isSubmitting, errors, touched, values }) => {
            const error = Object.values(errors)[0];
            const errorNode =
              error && Object.values(touched).length ? <ErrorMessage message={error} /> : null;

            return (
              <Form>
                {errorNode}

                <ModalBody paddingBottom={6}>
                  <Stack spacing={8}>
                    <Field name="price">
                      {({ field }: FieldProps) => (
                        <NFormControl
                          name="price"
                          title={t('detail.modal.sales-setting.price')}
                          subtitle={t('detail.modal.sales-setting.price.subtitle')}
                          // isInvalid={}
                        >
                          <InputGroup size="sm">
                            <Input
                              {...field}
                              id="price"
                              type="number"
                              height="auto"
                              onChange={field.onChange}
                              value={field.value}
                            />
                            <InputRightAddon
                              color={colors.text.gray}
                              userSelect="none"
                              children="NMT"
                              height="auto"
                            />
                          </InputGroup>
                        </NFormControl>
                      )}
                    </Field>

                    {/* <NFormControl title="expiration" subtitle="expiration.subtitle">
                      <Checkbox
                        color={colors.text.gray}
                        onChange={() => setExpirationOpen((check) => !check)}
                      >
                        expiration date
                      </Checkbox>
                    </NFormControl> */}

                    {expirationOpen && (
                      <Field name="expiration">
                        {({ field, form }: FieldProps) => (
                          <Stack direction="row" spacing={5}>
                            {/* TODO: translation */}
                            <NSelect
                              options={[{ title: '不修改', value: 0 }]}
                              onSelect={(val) => form.setFieldValue('expiration', val)}
                              suffix
                            />
                            <Center>
                              <Stack direction="row">
                                <Text color={colors.text.gray}>expiration time</Text>
                                <Text fontWeight="bold">2021-03-12 12:23</Text>
                              </Stack>
                            </Center>
                          </Stack>
                        )}
                      </Field>
                    )}

                    <Field name="category">
                      {({ field, form }: FieldProps) => (
                        <NFormControl
                          name="category"
                          title={t('detail.modal.sales-setting.category')}
                          subtitle={t('detail.modal.sales-setting.category.subtitle')}
                          direction="vertical"
                        >
                          <RadioGroup
                            color={colors.text.gray}
                            // {...field}
                            // value={field.value}
                            // Chakra treat value as string actually
                            onChange={(value: string) => {
                              const [_, id] = value.split(':');
                              form.setFieldValue('category', Number(id));
                            }}
                          >
                            <Stack direction="row" spacing={6}>
                              {/* <Radio value={1}>Hashmasks</Radio>
                              <Radio value={2}>CryptoPunks</Radio>
                              <Radio value={3}>SperRare</Radio>
                              <Radio value={4}>Raible</Radio> */}
                              {categories &&
                                categories.map((cat, idx) => {
                                  const isSelected = field.value === idx;
                                  return (
                                    <Radio
                                      key={cat}
                                      value={`id:${idx}`}
                                      isChecked={field.value === idx}
                                    >
                                      {t(`type.${cat}`)}
                                    </Radio>
                                  );
                                })}
                            </Stack>
                          </RadioGroup>
                        </NFormControl>
                      )}
                    </Field>

                    <Field name="pledge">
                      {({ field }: FieldProps) => (
                        <NFormControl
                          title={t('detail.modal.sales-setting.pledge')}
                          subtitle={t('detail.modal.sales-setting.pledge.subtitle')}
                        >
                          <InputGroup size="sm" marginLeft={4}>
                            <Input {...field} type="number" height="auto" value={values.pledge} />
                            <InputRightAddon
                              color={colors.text.gray}
                              userSelect="none"
                              children="NMT"
                              height="auto"
                            />
                          </InputGroup>
                        </NFormControl>
                      )}
                    </Field>
                  </Stack>
                </ModalBody>

                <ModalFooter display="flex" justifyContent="center">
                  <Button variant="primary" type="submit" isLoading={isSubmitting}>
                    Confirm
                  </Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default SalesSettingModal;
