import Banner from "./components/banner/Banner";
import MaxWidthContainer from "./components/layout/MaxWidthContainer";
import Products from "./components/product/Products";

export default function Index() {
  return (
    <>
      {/* 배너 - 배경 100% 너비, 내용 1200px */}
      <Banner />

      {/* 일반 컨텐츠 - 1200px 너비 */}
      <MaxWidthContainer>
        <div style={{ padding: '2rem 0' }}>
          <h2>상품 목록</h2>
          
        </div>
        <Products />
      </MaxWidthContainer>
    </>
  );
}

