import React, { useCallback } from 'react';
import {
  Box,
  Container,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Formik, Form, Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { SelectControl } from 'formik-chakra-ui';

import { globalStore } from 'rekv';
import colors from '../../themes/colors';
import Layout from '../../layouts/common';
import Upload from '../../components/upload';
import { mintNft } from '../../api/polka';
import { useMyCollectionsQuery } from '../../api/query';
import { useQuery } from '../../utils/hook';

const formLableLayout = {
  height: '48px',
  flex: '0 0 240px',
  htmlFor: 'name',
  fontSize: '14px',
  color: colors.text.gray,
  borderBottom: '1px solid #F3F4F8',
  mb: '0',
  mr: '0',
  lineHeight: '47px',
};

const formInputLayout = {
  variant: 'flushed',
  size: 'lg',
  fontSize: '14px',
  borderBottomColor: '#F3F4F8',
};

const CreateCollection = () => {
  const query = useQuery();

  const collectionId = query.get('collectionId');

  const { t } = useTranslation();
  const toast = useToast();
  const { account } = globalStore.useState('account');
  const { data: classes } = useMyCollectionsQuery(account.address);
  const mint = useCallback(async (formValue: any, cb) => {
    const { classId, ...others } = formValue;
    const normalizedClassId = classId ? Number(classId) : classes?.[0].id;
    const normalizedFormData = {
      address: account.address,
      metadata: { ...others },
      classId: normalizedClassId,
      cb,
    };
    mintNft(normalizedFormData);
  }, []);

  return (
    <Layout title="title.create">
      <Box padding={2}>
        <Container
          width="880px"
          minHeight="100vh"
          backgroundColor="#fff"
          mt="20px"
          mb="148px"
          borderRadius="4px"
        >
          <Box
            height="48px"
            borderBottom=" 1px solid #E9E9F0"
            pl="20px"
            fontWeight="600"
            fontSize="16px"
            lineHeight="47px"
            color={colors.text.black}
          >
            {t('create.title')}
          </Box>
          <Container p="0 20px">
            <Formik
              initialValues={{
                classId: collectionId,
                name: '',
                url: '',
                externalUrl: '',
                description: '',
              }}
              onSubmit={(formValue, formAction) => {
                mint(formValue, {
                  success: () => {
                    toast({
                      title: 'success',
                      status: 'success',
                      position: 'top',
                      duration: 3000,
                    });
                    formAction.setSubmitting(false);
                    formAction.resetForm();
                  },
                  error: (error: string) => {
                    toast({
                      title: 'success',
                      status: 'error',
                      position: 'top',
                      duration: 3000,
                      description: error,
                    });
                    formAction.setSubmitting(false);
                  },
                });
              }}
            >
              {(props: FormikProps<any>) => {
                return (
                  <Form>
                    <Field name="classId">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { classId: string }; touched: { classId: string } };
                      }) => (
                        <FormControl isInvalid={!!(form.errors.classId && form.touched.classId)}>
                          <Flex>
                            <FormLabel {...formLableLayout}>
                              {t('create.collection.name')}
                            </FormLabel>
                            <SelectControl {...field} selectProps={formInputLayout} name="classId">
                              {classes?.length &&
                                classes.map((clazz) => (
                                  <option value={clazz.classId} color={colors.text.black}>
                                    {clazz.name}
                                  </option>
                                ))}
                            </SelectControl>
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.classId}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="name">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { name: string }; touched: { name: string } };
                      }) => (
                        <FormControl isInvalid={!!(form.errors.name && form.touched.name)}>
                          <Flex>
                            <FormLabel {...formLableLayout}>{t('create.name')}</FormLabel>
                            <Input
                              id="name"
                              placeholder={t('create.name.placeholder')}
                              _placeholder={{ color: colors.text.lightGray }}
                              {...formInputLayout}
                              {...field}
                            />
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.name}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="url">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { url: string }; touched: { url: string } };
                      }) => (
                        <FormControl isInvalid={!!(form.errors.url && form.touched.url)}>
                          <Flex>
                            <FormLabel
                              {...formLableLayout}
                              p="10px 0"
                              lineHeight="auto"
                              height="auto"
                            >
                              {t('create.img')}
                            </FormLabel>
                            <FormLabel
                              mb="0"
                              flexGrow={1}
                              htmlFor="url"
                              borderBottom="1px solid #F3F4F8"
                            >
                              <Upload
                                id="url"
                                {...field}
                                onChange={(url) => {
                                  props.setFieldValue('url', url);
                                }}
                              />
                            </FormLabel>
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.url}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="externalUrl">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { externalUrl: string }; touched: { externalUrl: string } };
                      }) => (
                        <FormControl
                          isInvalid={!!(form.errors.externalUrl && form.touched.externalUrl)}
                          display="flex"
                          alignItems="center"
                        >
                          <Flex width="100%">
                            <FormLabel {...formLableLayout} htmlFor="externalUrl">
                              {t('create.link')}
                            </FormLabel>
                            <Input id="externalUrl" {...formInputLayout} {...field} />
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.externalUrl}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name="description">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { description: string }; touched: { description: string } };
                      }) => (
                        <FormControl
                          isInvalid={!!(form.errors.description && form.touched.description)}
                        >
                          <Flex>
                            <FormLabel {...formLableLayout} height="96px" htmlFor="description">
                              {t('create.intro')}
                            </FormLabel>
                            <Textarea
                              _placeholder={{ color: colors.text.lightGray }}
                              id="description"
                              placeholder={t('create.intro.placeholder')}
                              {...formInputLayout}
                              {...field}
                              resize="none"
                              height="96px"
                            />
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.description}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Box textAlign="center" mt="21px">
                      <Button
                        type="submit"
                        backgroundColor={colors.primary}
                        fontSize="14px"
                        color="#fff"
                        isLoading={props.isSubmitting}
                        _hover={{ backgroundColor: colors.primary }}
                        _focus={{ backgroundColor: colors.primary }}
                      >
                        {t('create.save')}
                      </Button>
                    </Box>
                  </Form>
                );
              }}
            </Formik>
          </Container>
        </Container>
      </Box>
    </Layout>
  );
};

export default CreateCollection;
