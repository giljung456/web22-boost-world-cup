import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getWorldcupList } from '../../utils/api/keywords';

interface Props {
  onClickTag: (keyword: string) => void;
}
function Keywords({ onClickTag }: Props): JSX.Element {
  const settings = {
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    variableWidth: true,
    draggable: false,
    speed: 300,
  };

  const [tagList, setTagList] = useState<Array<string>>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const getTagList = async () => {
    const data = await getWorldcupList();
    setTagList(data);
  };
  const onClickKeyword = (event: React.SyntheticEvent<HTMLDivElement>) => {
    const element = event.target as HTMLElement;
    setSelectedTag(element.innerText);
    onClickTag(element.innerText);
  };

  useEffect(() => {
    getTagList();
  }, []);

  return (
    <TagContainer {...settings}>
      {tagList.map((tag) => (
        <div key={tagList.indexOf(tag)} onClick={onClickKeyword} onKeyDown={onClickKeyword} aria-hidden="true">
          <TagName selected={selectedTag === tag}>{tag}</TagName>
        </div>
      ))}
    </TagContainer>
  );
}
const TagContainer = styled(Slider)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
  width: 80%;

  .slick-slide {
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 1em;
    background-color: ${({ theme }) => theme.color.pink};
    white-space: noWrap;
    padding: 1em;
    border-radius: 12px;
    cursor: pointer;
    transition: all 300ms ease-in;
    &:hover {
      background-color: ${({ theme }) => theme.color.pink};
    }
  }
  .slick-prev {
    left: 3% 
    z-index: 10;
  }
  .slick-next {
    right: 3% 
    z-index: 10;
  }
  .slick-prev:before {
    color: ${({ theme }) => theme.color.pink};
  }
  .slick-next:before {
    color: ${({ theme }) => theme.color.pink};
  }
`;

const TagName = styled.h3<{ selected: boolean }>`
  color: ${(props) => (props.selected ? '#524847' : 'white')};
  font-weight: ${(props) => (props.selected ? 'bold' : '400')};
  &:hover {
    color: ${({ theme }) => theme.color.gray[2]};
  }
`;
export default Keywords;
