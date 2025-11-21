import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId', 'isRevoked'])
@Index(['expiresAt'])
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: number;

  // 토큰 해시값 저장 (원본 저장 X)
  @Column({ length: 500 })
  tokenHash: string;

  // Refresh Token의 만료 시각. 이 시간이 지나면 토큰 무효.
  @Column()
  expiresAt: Date;

  // 강제 로그아웃, 탈취 의심 등으로 인해 토큰이 취소(Revoked) 되었는지 여부.
  // 혹은 로그아웃 시 해당 속성을 false 로 만들어 사용하지 못하도록
  @Column({ default: false })
  isRevoked: boolean;

  // 토큰이 취소되었다면 그 시각 기록.
  @Column({ nullable: true })
  revokedAt: Date;

  // 토큰이 발급된 기기의 브라우저/앱 정보.
  @Column({ nullable: true })
  userAgent: string;

  // 토큰 발급 당시의 IP 주소.
  @Column({ nullable: true })
  ipAddress: string;

  // 토큰을 발급받은 디바이스의 고유 식별자 (디바이스별 세션 관리 가능).
  @Column({ nullable: true })
  deviceId: string; // 디바이스 식별자

  // 토큰이 최초로 발급된 시각.
  @CreateDateColumn()
  createdAt: Date;

  // 이 Refresh Token으로 마지막으로 재발급 요청을 보낸 시각 → 토큰 회전(RTR) 구현에 중요.
  @Column({ nullable: true })
  lastUsedAt: Date;
}
