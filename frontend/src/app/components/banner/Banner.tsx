'use client'

import styled from '@emotion/styled'
import BannerSection from './BannerSection'

export default function Banner() {
  return (
    <BannerSection backgroundColor="#f8f9fa" backgroundImage='/images/banner/bannerbackground.png'>
      <BannerGrid>

        <MainBanner>
          <BannerContent>메인 배너</BannerContent>
        </MainBanner>

        
        <SubBannerTop>
          <BannerContent>서브 배너 1</BannerContent>
        </SubBannerTop>

        <SubBannerBottom>
          <BannerContent>서브 배너 2</BannerContent>
        </SubBannerBottom>

      </BannerGrid>
    </BannerSection>
  )
}

const BannerGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr; /* 왼쪽:오른쪽 = 2:1 비율 */
  grid-template-rows: 1fr 1.5fr;    /* 위:아래 = 1:1 비율 */
  gap: 16px;
  padding: 2rem 0;
  min-height: 500px;
`;

const MainBanner = styled.div`
  grid-column: 1;      /* 첫 번째 열 */
  grid-row: 1 / 3;     /* 1번 행부터 3번 행 전까지 (두 행 차지) */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  overflow: hidden;
`;

const SubBannerTop = styled.div`
  grid-column: 2;      /* 두 번째 열 */
  grid-row: 1;         /* 첫 번째 행 */
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 8px;
  overflow: hidden;
`;

const SubBannerBottom = styled.div`
  grid-column: 2;      /* 두 번째 열 */
  grid-row: 2;         /* 두 번째 행 */
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 8px;
  overflow: hidden;
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;