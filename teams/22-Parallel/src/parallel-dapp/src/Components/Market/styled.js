import styled from 'styled-components';

const TableWrapper = styled.div`
  width: 100%;
  border-radius: 12px 12px 12px 12px;
  margin-top: 1rem;
  padding: 3rem;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const IconAndTextWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Icon = styled.img`
  weight: 32px;
  height: 32px;
`;

export { TableWrapper, IconAndTextWrapper, Icon };
