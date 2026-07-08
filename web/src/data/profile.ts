// 인적사항 · 소개 · 핵심 성과 — 이력서/경력기술서 기반

export interface ProfileLink {
  label: string
  value: string
  href: string
  icon: string
}

export const profile = {
  name: '김현우',
  role: 'Backend Engineer',
  roleKo: '백엔드 개발자',
  years: 5,
  headline: '전자고지·대용량 발송/배치 도메인을 5년간 설계·개발·운영했습니다.',
  subHeadline:
    '매월 수백만 건의 공공·통신 고지가 지나가는 발송 파이프라인. 델파이 레거시를 Java 21로 재구축하고, 필요한 도구는 직접 만들어 Maven Central에 배포합니다.',
  // 각 문단을 의미 단위 줄(line)로 분리 — 보고서처럼 읽히도록
  intro: [
    [
      'Java·Spring 기반으로 KT 명세서 ETL 배치, PASS 전자고지 PUSH,',
      '카카오 전자문서 발송 서버를 설계부터 운영까지 담당해 온 백엔드 개발자입니다.',
    ],
    [
      '레거시 현대화가 제 경력의 축입니다 — 델파이 월 배치를 Java로 재구축하고,',
      '관리자 콘솔을 JSP→Vue2→Vue3로 전환하고, 보험사 발송 엔진을 인수해 재구축했습니다.',
    ],
    [
      '운영 사고는 원인 분석부터 복구 SQL, 재발 방지 문서화까지 마무리하고,',
      '회사 밖에서는 Spring Boot Starter를 직접 만들어 Maven Central에 배포했습니다.',
    ],
  ],
  company: 'GIBIS',
  companyDesc: 'KT 파트너사',
  tenure: '2021.08 ~ 재직 중',
  domain: 'KT 공공알림문자 · PASS · 카카오 전자문서',
}

export const links: ProfileLink[] = [
  { label: 'Email', value: 'gntj3200@gmail.com', href: 'mailto:gntj3200@gmail.com', icon: 'mail' },
  { label: 'GitHub', value: 'github.com/black-astro', href: 'https://github.com/black-astro', icon: 'github' },
]

// 핵심 성과 — 이력서 상단 하이라이트
export interface Achievement {
  metric: string
  unit: string
  label: string
  detail: string
}

// 여러 프로젝트에서 방어 가능한 성과를 골고루 — 대용량 · 인증 · PASS · 카카오 · 레거시 현대화 · OSS · 인프라
export const achievements: Achievement[] = [
  {
    metric: '~2억',
    unit: 'row',
    label: '누적 StAX 스트리밍 적재 · 메모리 터짐(OOM) 0건',
    detail: 'KT_BatchServer — 매월 명세서 약 100만 건(1GB+ XML)을 StAX 상태머신 + 파서 풀·단일 라이터로 힙 수십 MB에만 스트리밍 적재. 누적 파싱 약 2천만 건, 디테일 테이블 약 2억 row를 메모리 터짐 없이 운영.',
  },
  {
    metric: '3',
    unit: '채널',
    label: '공공기관 전자고지 발송 백엔드',
    detail: 'PASS · 카카오 전자문서 · KT 3채널 발송 백엔드를 설계·개발·운영. 국세청·국민건강보험공단·국민연금공단 등 공공기관 안내문이 이 파이프라인을 통과.',
  },
  {
    metric: '일 180만',
    unit: '건 규모',
    label: 'PASS 전자고지 · SKT PASS지갑 공식 IF 연동',
    detail: 'KT PASS 공인알림문자 시스템 개발사로서 SKT PASS지갑 공식 IF(정의서 v1.9)를 연동. 단건/벌크 발송과 결과 회수를 구현하고, 일 발송 리미트 180만 건 규모의 상한 제어 체계로 대량 발송을 통제(구축/발송 서버 분리 설계).',
  },
  {
    metric: '3',
    unit: '체인',
    label: '멀티 SecurityFilterChain 인증 분리',
    detail: 'GibisbizCenter — 단일 백엔드에서 OpenAPI·Electron·Vue3 어드민 3종 클라이언트를 SecurityFilterChain으로 분리. JWT 발급·검증 책임을 나눠 클라이언트별 토큰 수명·인가 정책을 독립 운영.',
  },
  {
    metric: '재발 0',
    unit: '건',
    label: '운영 사고 원인분석 → 복구 → 재발 방지',
    detail: '카카오 결과 미처리 사고(SRC_KEY 공백 매칭)를 SQL로 원인 분석 → 복구 SQL로 재처리 → 재현 절차·영향 범위·복구 SQL을 문서화. 이후 결과 대사 기준 동일 사고 재발 0건.',
  },
  {
    metric: 'Maven Central',
    unit: '',
    label: 'Spring Boot Starter 정식 배포',
    detail: 'easy-quartz — 설계·구현·릴리즈 자동화까지 단독으로 Maven Central에 배포. @EasyQuartzScheduled 하나로 5종 스케줄 × 2엔진(Quartz/Spring)을 통합.',
  },
]
