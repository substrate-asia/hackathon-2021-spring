import styled from 'styled-components';

const DashBoardTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const DashBoardAmount = styled.h2`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const DashBoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.secondaryBackground};
  border-radius: 12px 12px 12px 12px;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const MenuWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 20%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0px 0px 12px 12px;
  padding: 3rem;
`;

const DepositsTabWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 12px 0px 0px 0px;
  background-color: ${(props) =>
    props.paneSelection
      ? props.theme.colors.tertiaryBackground
      : props.theme.colors.secondaryBackground};
  cursor: pointer;
`;

const StakingTabWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 0px 12px 0px 0px;
  background-color: ${(props) =>
    props.paneSelection === 1
      ? props.theme.colors.secondaryBackground
      : props.theme.colors.tertiaryBackground};
  cursor: pointer;
`;

const LoansTabWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 0px 12px 0px 0px;
  background-color: ${(props) =>
    props.paneSelection === 2
      ? props.theme.colors.secondaryBackground
      : props.theme.colors.tertiaryBackground};
  cursor: pointer;
`;

const TabName = styled.h3`
  padding: 1.5rem;
  color: ${(props) => props.theme.colors.text};
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

export {
  DashBoardAmount,
  DashBoardTitle,
  DashBoardWrapper,
  MenuWrapper,
  ContentWrapper,
  TabName,
  LoansTabWrapper,
  DepositsTabWrapper,
  StakingTabWrapper,
  IconAndTextWrapper,
  Icon
};
