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

export const achievements: Achievement[] = [
  {
    metric: '~1,000만',
    unit: 'row',
    label: '회차당 DB INSERT',
    detail: '델파이 레거시 월 배치를 Java 21로 전면 재구축. 회차당 원천 약 510만 건, 최대 안내문은 명세서 100만 건이 디테일 분해로 약 1,000만 row 적재 (운영 명세 기준).',
  },
  {
    metric: '50→25',
    unit: '분',
    label: '대량 INSERT 시간',
    detail: '인덱스 UNUSABLE→BATCH 적재→REBUILD 재설계 + direct-path INSERT 분기로 약 50% 단축 (운영 실측).',
  },
  {
    metric: '5→2',
    unit: '시간',
    label: '중복제거 프로시저',
    detail: '커서 루프를 집합 기반(MERGE)으로 재설계, 청크 커밋·재개 구조로 DB 세션 제약 우회. 약 60% 단축 (운영 실측).',
  },
  {
    metric: '~2억',
    unit: 'row',
    label: '누적 StAX 적재 · 메모리 터짐(OOM) 0건',
    detail: '매월 명세서 약 100만 건(1GB+ XML)을 StAX 상태머신 + 파서 풀·단일 라이터 파이프라인으로 힙 수십 MB에만 스트리밍 파싱·적재 — 누적 파싱 약 2천만 건, 디테일 테이블 누적 약 2억 row를 운영 OOM 0건으로 처리.',
  },
  {
    metric: '3',
    unit: '채널',
    label: '전자고지 발송 백엔드',
    detail: 'PASS · 카카오 전자문서 · KT 3채널 발송 백엔드 개발. 국세청·건보공단·국민연금공단 등 공공기관 안내문 처리.',
  },
  {
    metric: 'Maven Central',
    unit: '',
    label: 'OSS 정식 배포',
    detail: 'Spring Boot 스케줄링 라이브러리 easy-quartz를 설계·구현·릴리즈 자동화까지 단독으로 정식 배포.',
  },
]
