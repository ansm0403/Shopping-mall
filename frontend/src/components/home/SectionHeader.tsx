import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  /** "더보기" 링크 경로 (없으면 버튼 미표시) */
  href?: string;
  /** 부제목 또는 설명 */
  description?: string;
}

export default function SectionHeader({ title, href, description }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
        {description && (
          <p className="text-sm text-secondary-500 mt-0.5">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
        >
          더보기
          <span aria-hidden>›</span>
        </Link>
      )}
    </div>
  );
}
