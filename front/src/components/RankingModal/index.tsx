import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { InfoData, DoughnutChartData } from '../../types/Datas';
import getUUID from '../../utils/getUUID';
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';

interface Props {
  info: InfoData;
}
interface DoughnutAccData {
  rankingDatas: DoughnutChartData[];
  acc: number;
}
function RankingModal({ info }: Props): JSX.Element {
  const [doughnutInfo, setDoughnutInfo] = useState<DoughnutChartData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, name, male, female, ...age } = info;
  const getCoordCircle = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  const makeDoughnutInfo = useCallback((rankingInfoData: number[]) => {
    return rankingInfoData.reduce(
      (pre, value) => {
        const { rankingDatas: preRankingDatas, acc: preAcc } = pre;
        const id = getUUID();
        const [startX, startY] = getCoordCircle(preAcc);
        const newAcc = preAcc + value;
        const [endX, endY] = getCoordCircle(newAcc);
        const isLargeArc = value > 0.5 ? 1 : 0;
        const targetArc = 2 * Math.PI * value;
        const chartData = { id, value, startX, startY, endX, endY, isLargeArc, targetArc };
        const newRankingDatas = [...preRankingDatas, chartData];
        return { rankingDatas: newRankingDatas, acc: newAcc };
      },
      { rankingDatas: [], acc: 0 } as DoughnutAccData,
    ).rankingDatas;
  }, []);
  useEffect(() => {
    setDoughnutInfo(makeDoughnutInfo(Object.values(age)));
  }, []);
  return (
    <Modal>
      <Header>
        <span>{name}</span>
      </Header>
      {doughnutInfo.length ? (
        <Content>
          <Doughnut>
            <DoughnutChart data={doughnutInfo} />
          </Doughnut>
          <Bar>
            <BarChart data={{ male, female }} />
          </Bar>
        </Content>
      ) : (
        <EmptyModal>
          <p>기록된 랭킹 기록이 없습니다.</p>
        </EmptyModal>
      )}
    </Modal>
  );
}
const Modal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  width: 800px;
  height: 450px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding-bottom: 2em;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
`;
const Header = styled.header`
  width: 100%;
  height: 20px;
  display: flex;
  padding: 20px 40px 30px 40px;
  border-bottom: 1px solid gray;
  span {
    font-size: 1.2em;
    font-weight: bold;
  }
`;
const Content = styled.section`
  height: 100%;
  display: flex;
`;
const Doughnut = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: 90%;
  width: 50%;
`;
const Bar = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90%;
`;
const EmptyModal = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
`;
export default RankingModal;
