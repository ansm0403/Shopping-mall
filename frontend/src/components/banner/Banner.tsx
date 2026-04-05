'use client';

import BannerSection from './BannerSection';

interface BannerContentProps {
  bannerImg: string;
  children: React.ReactNode;
}

function BannerContent({ bannerImg, children }: BannerContentProps) {
  return (
    <div
      className="flex items-center justify-center h-full text-white text-2xl font-bold bg-cover bg-center bg-no-repeat"
      style={bannerImg ? { backgroundImage: `url(${bannerImg})` } : undefined}
    >
      {children}
    </div>
  );
}

export default function Banner() {
  return (
    <BannerSection
      backgroundColor="#f8f9fa"
      backgroundImage="/images/banner/bannerbackground.png"
    >
      <div className="grid grid-cols-[2fr_1fr] grid-rows-[1fr_1.5fr] gap-4 py-8 min-h-[500px]">
        <div className="col-start-1 row-span-2 bg-[linear-gradient(135deg,#d2f9a0_0%,#dffd5b_100%)] rounded-lg overflow-hidden">
          <BannerContent bannerImg="">메인 배너</BannerContent>
        </div>

        <div className="col-start-2 row-start-1 bg-[linear-gradient(135deg,#f093fb_0%,#f5576c_100%)] rounded-lg overflow-hidden">
          <BannerContent bannerImg="">서브 배너 1</BannerContent>
        </div>

        <div className="col-start-2 row-start-2 bg-[linear-gradient(135deg,#4facfe_0%,#00f2fe_100%)] rounded-lg overflow-hidden">
          <BannerContent bannerImg="">서브 배너 2</BannerContent>
        </div>
      </div>
    </BannerSection>
  );
}
