import Header from '../../components/header/Header';
import MaxWidthContainer from '../../components/layout/MaxWidthContainer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MaxWidthContainer>
        {children}
      </MaxWidthContainer>
    </>
  );
}
