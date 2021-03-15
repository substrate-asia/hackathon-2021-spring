import React from 'react';
import { Box, Container, FormControl, FormLabel, Input, Button, Image } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import { useTranslation } from 'react-i18next';

import colors from '../../themes/colors';
import Layout from '../../layouts/common';

const UserEdit = () => {
  const { t } = useTranslation();

  const formLableLayout = {
    width: '240px',
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

  return (
    <Layout title="title.profile">
      <Box padding={2}>
        <Container
          width="880px"
          minHeight="100vh"
          backgroundColor="#fff"
          borderBottomRadius="4px"
          m="20px auto 148px"
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
            {t('user.edit.title')}
          </Box>
          <Container p="0 20px">
            <Formik
              initialValues={{ email: '', password: '' }}
              onSubmit={() => {
                // console.log('aaa');
              }}
            >
              <Form>
                <Field name="name">
                  {({
                    field,
                    form,
                  }: {
                    field: Record<string, unknown>;
                    form: { errors: { name: string }; touched: { name: string } };
                  }) => (
                    <FormControl
                      isInvalid={!!(form.errors.name && form.touched.name)}
                      display="flex"
                      alignItems="center"
                    >
                      <FormLabel {...formLableLayout}>{t('user.edit.nickname')}</FormLabel>
                      <Input
                        _placeholder={{ color: colors.text.lightGray }}
                        id="name"
                        placeholder={t('user.edit.placeholder')}
                        {...formInputLayout}
                      />
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
                    <FormControl
                      isInvalid={!!(form.errors.name && form.touched.name)}
                      display="flex"
                      alignItems="center"
                    >
                      <FormLabel {...formLableLayout}>{t('user.edit.avator')}</FormLabel>
                      <Container
                        height="48px"
                        lineHeight="48px"
                        borderBottom="1px solid #F3F4F8"
                        display="flex"
                        alignItems="center"
                      >
                        <FormLabel htmlFor="file" width="32px" mb="0">
                          <Image
                            width="32px"
                            height="32px"
                            borderRadius="50%"
                            src="https://desk-fd.zol-img.com.cn/t_s960x600c5/g5/M00/02/02/ChMkJ1bKxg6IdZk5AAK3PMpO-zEAALHfgDer-EAArdU066.jpg"
                          />
                        </FormLabel>
                        <Input display="none" type="file" id="file" />
                      </Container>
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
                    <FormControl
                      isInvalid={!!(form.errors.name && form.touched.name)}
                      display="flex"
                      alignItems="center"
                    >
                      <FormLabel {...formLableLayout}>{t('user.edit.email')}</FormLabel>
                      <Input
                        _placeholder={{ color: colors.text.lightGray }}
                        id="name"
                        placeholder={t('user.edit.placeholder')}
                        {...formInputLayout}
                      />
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
                    <FormControl
                      isInvalid={!!(form.errors.name && form.touched.name)}
                      display="flex"
                      alignItems="center"
                    >
                      <FormLabel {...formLableLayout}>{t('user.edit.twitter')}</FormLabel>
                      <Input
                        _placeholder={{ color: colors.text.lightGray }}
                        id="name"
                        placeholder={t('user.edit.placeholder')}
                        {...formInputLayout}
                      />
                    </FormControl>
                  )}
                </Field>
                <Box textAlign="center" mt="21px">
                  <Button
                    type="submit"
                    backgroundColor={colors.primary}
                    fontSize="14px"
                    color="#fff"
                    _hover={{ backgroundColor: colors.primary }}
                    _focus={{ backgroundColor: colors.primary }}
                  >
                    {t('create.save')}
                  </Button>
                </Box>
              </Form>
            </Formik>
          </Container>
        </Container>
      </Box>
    </Layout>
  );
};

export default UserEdit;
