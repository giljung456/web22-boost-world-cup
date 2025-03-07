import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import styled from 'styled-components';
import RankingItem from './RankingItem';
import SearchBar from '../SearchBar';
import Pagination from '../Pagination';
import { usePaginationAsync, useThrottle, useApiRequest, useModal } from '../../hooks';
import { getCandidateList } from '../../apis/ranking';
import { getWorldcupMetadata } from '../../apis/worldcups';
import { RankingData, WorldcupMetaData } from '../../types/Datas';
import { PAGINATION_LIMIT } from '../../constants/number';
import Loader from '../Loader';

interface Props {
  worldcupId: string;
}
const RankingModal = lazy(() => import('../RankingModal'));
const BackDrop = lazy(() => import('../BackDrop'));

function RankingList({ worldcupId }: Props): JSX.Element {
  const [inputWord, setInputWord] = useState('');
  const [totalCnt, setTotalCnt] = useState<number>(0);
  const candidateRef = useRef<number | null>(null);
  const [candidateList, currentPage, offset, lastPage, onPageChange] = usePaginationAsync<RankingData>(
    totalCnt,
    PAGINATION_LIMIT,
    getCandidateList,
    [inputWord, worldcupId],
    [totalCnt],
  );
  const [modalOn, onToggleModal, setModalOn] = useModal();
  const onGetWorldcupMetadataSuccess = ({ totalCnt }: WorldcupMetaData) => setTotalCnt(totalCnt);
  const getWorldcupMetaDataDispatcher = useApiRequest(getWorldcupMetadata, onGetWorldcupMetadataSuccess);
  const throttledGetWorldcupMetaData = useThrottle(
    () => getWorldcupMetaDataDispatcher({ type: 'REQUEST', requestProps: [worldcupId, inputWord] }),
    500,
  );
  const onShowRankingDetail = useCallback(
    (event: React.MouseEvent<Element>) => {
      setModalOn(true);
      const candidateName = event.currentTarget.children[2].innerHTML;
      candidateRef.current = candidateList.findIndex((v) => v.name === candidateName);
    },
    [candidateList],
  );

  const getInfoAcc = useCallback((candidate: RankingData) => {
    return {
      id: candidate.id,
      name: candidate.name,
      male: Number(candidate.male),
      female: Number(candidate.female),
      teens: Number(candidate.teens),
      twenties: Number(candidate.twenties),
      thirties: Number(candidate.thirties),
      forties: Number(candidate.forties),
      fifties: Number(candidate.fifties),
      etc: Number(candidate.etc),
    };
  }, []);

  const onSubmit = useCallback((event: React.MouseEvent<HTMLElement>): void => {
    event.preventDefault();
    setInputWord('');
  }, []);

  const onSearchWordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInputWord(inputValue);
  }, []);

  useEffect(() => {
    throttledGetWorldcupMetaData();
  }, [inputWord]);

  return (
    <>
      <Navigation>
        <SearchBar onSubmit={onSubmit} onSearchWordChange={onSearchWordChange} searchWord={inputWord} />
      </Navigation>
      <Caption>
        <LeftCaption>
          <span>순위</span>
          <span>이미지</span>
          <p>이름</p>
          <div />
        </LeftCaption>
        <RightCaption>
          <div>
            <p>우승비율</p>
            <span>(최종 우승 횟수 / 전체 게임 수)</span>
          </div>
          <div>
            <p>승률</p>
            <span>(승리 횟수 / 전체 1:1 대결 수)</span>
          </div>
        </RightCaption>
      </Caption>
      <RankingItemContainer>
        {candidateList.map((candidate, index) => {
          return (
            <RankingItem
              key={candidate.id}
              id={offset + index + 1}
              imgKey={candidate.imgKey}
              name={candidate.name}
              victoryRatio={candidate.victoryRatio}
              winRatio={candidate.winRatio}
              onClick={onShowRankingDetail}
            />
          );
        })}
        <Pagination lastPage={lastPage} currentPage={currentPage} onPageChange={onPageChange} />
      </RankingItemContainer>
      {modalOn && (
        <Suspense fallback={<Loader />}>
          <BackDrop modalOn={modalOn} onToggleModal={onToggleModal}>
            <RankingModal info={getInfoAcc(candidateList[candidateRef.current as number])} />
          </BackDrop>
        </Suspense>
      )}
    </>
  );
}
const Navigation = styled.div`
  position: absolute;
  right: 3vw;
  top: -80px;
  width: 230px;
  display: flex;
`;
const Caption = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  font-size: 1.8em;
  font-weight: bold;
  padding: 10px 0 30px 0;
`;
const LeftCaption = styled.div`
  width: 40%;
  display: flex;
  justify-content: space-evenly;
  p {
    width: 150px;
    padding-left: 30px;
  }
`;
const RightCaption = styled.div`
  width: 60%;
  display: flex;
  justify-content: space-around;
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    span {
      padding-top: 10px;
      font-weight: 400;
      font-size: 0.5em;
    }
  }
`;

const RankingItemContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default RankingList;
