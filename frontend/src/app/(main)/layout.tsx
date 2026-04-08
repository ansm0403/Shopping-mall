import Script from 'next/script';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import MaxWidthContainer from '../../components/layout/MaxWidthContainer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="afterInteractive" />
      <Header />
      <MaxWidthContainer>
        {children}
      </MaxWidthContainer>
      <Footer />
    </>
  );
}
