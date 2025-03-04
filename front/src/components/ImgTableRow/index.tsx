import React, { useEffect, useState, memo } from 'react';
import styled from 'styled-components';
import { ImgInfo, PreSignedData } from '../../types/Datas';
import ImgPreView from '../ImgPreView';
import TextInput from '../TextInput';
import ChangeImg from '../ImgInputs/ChangeImg';
import { getSignedURLs } from '../../apis/image';
import { deleteCandidate, patchCandidate } from '../../apis/candidate';
import { useApiRequest } from '../../hooks';
import { ImgsAction } from '../../types/Actions';

interface Props {
  imgInfo: ImgInfo;
  num: number;
  imgInfosDispatcher: React.Dispatch<ImgsAction>;
}

function ImgTableRow({ imgInfo, num, imgInfosDispatcher }: Props): JSX.Element {
  const [willUploadFile, setWillUploadFile] = useState<File | null>(null);
  const [presignedURL, setPresignedURL] = useState<string | null>(null);

  const onDeleteCandidateSuccess = () => imgInfosDispatcher({ type: 'DELETE_IMG', payload: imgInfo.key });
  const deleteCandidateDispatcher = useApiRequest(deleteCandidate, onDeleteCandidateSuccess);

  const onGetSignedURLsSuccess = (presignedDatas: PreSignedData[]) => {
    if (!willUploadFile) return;
    const { key: newKey, presignedURL } = presignedDatas[0];
    const { key: preKey } = imgInfo;
    const { name } = willUploadFile;
    setPresignedURL(presignedURL);
    patchCandidateDispatcher({ type: 'REQUEST', requestProps: [preKey, name, newKey] });
    imgInfosDispatcher({
      type: 'CHANGE_IMG',
      payload: { newKey, name, preKey },
    });
  };
  const getSignedURLsDispatcher = useApiRequest<PreSignedData[]>(getSignedURLs, onGetSignedURLsSuccess);

  const patchCandidateDispatcher = useApiRequest(patchCandidate);

  const onDeleteImg = () => {
    deleteCandidateDispatcher({ type: 'REQUEST', requestProps: [imgInfo.key] });
  };
  const onImgNameBlur: React.FocusEventHandler<HTMLInputElement> = ({ target }) => {
    if (imgInfo.name === target.value) return;
    patchCandidateDispatcher({ type: 'REQUEST', requestProps: [imgInfo.key, target.value] });
    imgInfosDispatcher({ type: 'CHANGE_IMG_NAME', payload: { key: imgInfo.key, name: target.value } });
  };
  const onImgChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    if (!target.files) return;
    const [file] = [...target.files];
    const contentTypes = [file.type];
    getSignedURLsDispatcher({ type: 'REQUEST', requestProps: [contentTypes] });
    setWillUploadFile(file);
  };

  useEffect(() => {
    setPresignedURL(null);
    setWillUploadFile(null);
  }, [imgInfo.key]);

  return (
    <Container>
      <RowItem style={{ width: '50px' }}>{num}</RowItem>
      <RowItem>
        <ImgPreView
          info={imgInfo}
          tab={2}
          willUploadFile={willUploadFile}
          presignedURL={presignedURL}
          imgInfosDispatcher={imgInfosDispatcher}
        />
      </RowItem>
      <RowItem>
        <TextInput
          name="imgName"
          onBlur={onImgNameBlur}
          width="100%"
          placeholder="이름을 입력해주세요."
          defaultValue={imgInfo.name}
        />
      </RowItem>
      <RowItem>
        <ChangeImg onChange={onImgChange} />
      </RowItem>
      <RowItem>
        <DeleteBtn type="button" onClick={onDeleteImg}>
          라인 삭제
        </DeleteBtn>
      </RowItem>
    </Container>
  );
}

const Container = styled.div`
  height: 130px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background-color: ${({ theme }) => theme.color.white};
  border-bottom: 1px solid ${({ theme }) => theme.color.black};
`;

const RowItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.fontStyle.h3};
`;

const DeleteBtn = styled.button`
  width: 100px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #ff0000;
  color: #ff0000;
  transition: background-color 0.3s, color 0.3s;
  ${({ theme }) => theme.fontStyle.button};
  &:hover {
    background-color: #ff0000;
    color: ${({ theme }) => theme.color.white};
  }
`;

export default memo(ImgTableRow);
