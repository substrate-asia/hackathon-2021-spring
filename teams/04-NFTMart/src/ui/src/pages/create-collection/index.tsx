import React, { FC, useCallback } from 'react';

import {
  Container,
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Center,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, FormikProps } from 'formik';
import * as Yup from 'yup';
import { globalStore } from 'rekv';

import Upload from '../../components/upload';

import Layout from '../../layouts/common';
import colors from '../../themes/colors';

import { createClass } from '../../api/polka';
import { useMyAssetsQuery } from '../../api/query';

const schema = Yup.object().shape({
  name: Yup.string().max(50, 'Too Long!').required('Required'),
  description: Yup.string().max(200, 'Too Long!').required('Required'),
  // bannerUrl: Yup.string().required('Required'),
  url: Yup.string().max(200, 'Too Long!').required('Required'),
  externalUrl: Yup.string().max(200, 'Too Long!').required('Required'),
});

const formLabelLayout = {
  flex: '0 0 240px',
  height: '48px',
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

const CreateCollection: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const { account } = globalStore.useState('account');
  const { refetch: refetchAssets } = useMyAssetsQuery(account.address);

  const create = useCallback((formValue, cb) => {
    createClass({ address: account.address, metadata: formValue, cb });
  }, []);

  return (
    <Layout title="title.create-collections">
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
            borderBottom="1px solid #E9E9F0"
            pl="20px"
            fontWeight="600"
            fontSize="16px"
            lineHeight="47px"
            color={colors.text.black}
          >
            {t('create.collection.title')}
          </Box>
          <Container p="0 20px">
            <Formik
              initialValues={{
                name: '',
                // bannerUrl: '',
                description: '',
                url: '',
                externalUrl: '',
              }}
              onSubmit={(values, formActions) => {
                create(values, {
                  success: () => {
                    toast({
                      title: 'success',
                      status: 'success',
                      position: 'top',
                      duration: 3000,
                    });
                    formActions.setSubmitting(false);
                    formActions.resetForm();
                    refetchAssets();
                  },
                  error: (err: any) => {
                    toast({
                      title: 'success',
                      status: 'error',
                      position: 'top',
                      duration: 3000,
                      description: err,
                    });
                    formActions.setSubmitting(false);
                    refetchAssets();
                  },
                });
              }}
              validationSchema={schema}
            >
              {(props: FormikProps<any>) => {
                return (
                  <Form>
                    <Field name="name">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { name: string }; touched: { name: string } };
                      }) => {
                        return (
                          <FormControl isInvalid={!!(form.errors.name && form.touched.name)}>
                            <Flex>
                              <FormLabel {...formLabelLayout} htmlFor="name">
                                {t('create.name')}
                              </FormLabel>
                              <Input
                                id="name"
                                placeholder={t('create.name.placeholder')}
                                {...formInputLayout}
                                {...field}
                              />
                            </Flex>
                            <FormErrorMessage pl="240px">{form.errors.name}</FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Field name="url">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { url: string }; touched: { url: string } };
                      }) => {
                        return (
                          <FormControl isInvalid={!!(form.errors.url && form.touched.url)}>
                            <Flex>
                              <FormLabel
                                {...formLabelLayout}
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
                                  onChange={(v) => {
                                    props.setFieldValue('url', v);
                                  }}
                                />
                              </FormLabel>
                            </Flex>
                            <FormErrorMessage pl="240px">{form.errors.url}</FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    {/* <Field name="url">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { url: string }; touched: { url: string } };
                      }) => {
                        return (
                          <FormControl isInvalid={!!(form.errors.url && form.touched.url)}>
                            <Flex>
                              <FormLabel {...formLabelLayout} htmlFor="url">
                                {t('create.url')}
                              </FormLabel>
                              <Input
                                id="url"
                                placeholder={t('create.url.placeholder')}
                                {...field}
                                {...formInputLayout}
                              />
                            </Flex>
                            <FormErrorMessage pl="240px">{form.errors.url}</FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field> */}
                    <Field name="externalUrl">
                      {({
                        field,
                        form,
                      }: {
                        field: Record<string, unknown>;
                        form: { errors: { externalUrl: string }; touched: { externalUrl: string } };
                      }) => {
                        return (
                          <FormControl
                            isInvalid={!!(form.errors.externalUrl && form.touched.externalUrl)}
                          >
                            <Flex>
                              <FormLabel {...formLabelLayout} htmlFor="externalUrl">
                                {t('create.link')}
                              </FormLabel>
                              <Input
                                id="externalUrl"
                                placeholder={t('create.link.placeholder')}
                                {...formInputLayout}
                                {...field}
                              />
                            </Flex>
                            <FormErrorMessage pl="240px">
                              {form.errors.externalUrl}
                            </FormErrorMessage>
                          </FormControl>
                        );
                      }}
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
                            <FormLabel {...formLabelLayout} height="96px" htmlFor="description">
                              {t('create.intro')}
                            </FormLabel>
                            <Textarea
                              _placeholder={{ color: colors.text.lightGray }}
                              id="description"
                              placeholder={t('create.intro.placeholder')}
                              height="96px"
                              resize="none"
                              {...formInputLayout}
                              {...field}
                            />
                          </Flex>
                          <FormErrorMessage pl="240px">{form.errors.description}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Center mt="20px">
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
                    </Center>
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
