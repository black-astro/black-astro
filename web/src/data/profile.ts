// 소개 · 요즘 하는 일 · 기억에 남는 숫자

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
  years: 6,
  headline: '발송 서버를 만들고 고치면서 배운 것들을 적어 두는 곳입니다.',
  subHeadline:
    '공공기관 안내문이 SKT PASS, 카카오, KT 문자로 나가는 발송 서버를 6년째 만지고 있습니다. 건당 과금이라 한 건이 중복돼도 돈이 새는 곳이어서, 트랜잭션 경계와 동시성, 그리고 숫자가 맞는지를 가장 오래 들여다봅니다.',
  // 각 문단을 의미 단위 줄(line)로 분리
  intro: [
    [
      'Java와 Spring Boot로 서버를 만들고, Tibero·Oracle 프로시저와 함께 굴러가는 서비스를 운영합니다.',
      '요즘 가장 많은 시간을 쓰는 곳은 SKT PASS 전자고지 발송 서버이고, 카카오 전자문서 서버와 KT 청구서 배치도 계속 손보고 있습니다.',
    ],
    [
      '멈출 수 없는 서버를 고치는 일을 좋아합니다.',
      '테스트를 먼저 깔고 조금씩 커밋하면서 구조를 줄이는 쪽이 결국 제일 빠르다는 걸 몇 번 겪었습니다.',
    ],
    [
      '튜닝이 막히면 같은 일을 더 빨리 하려 하기보다 그 일을 어디서 할지를 다시 봅니다.',
      '회사 밖에서는 필요한 도구를 직접 만들어 Maven Central과 npm에 올리고, 요즘은 Kotlin으로 옮겨 가는 연습을 하고 있습니다.',
    ],
  ],
  company: 'GIBIS',
  companyDesc: 'KT 전자고지 파트너사 · 대리',
  tenure: '2021.08 ~ 지금',
  domain: 'SKT PASS · 카카오 전자문서 · KT 문자',
}

export const links: ProfileLink[] = [
  { label: 'Email', value: 'gntj3200@gmail.com', href: 'mailto:gntj3200@gmail.com', icon: 'mail' },
  { label: 'GitHub', value: 'github.com/black-astro', href: 'https://github.com/black-astro', icon: 'github' },
]

// 기억에 남는 숫자 — 홈 화면 카드
export interface Achievement {
  metric: string
  unit: string
  label: string
  detail: string
}

export const achievements: Achievement[] = [
  {
    metric: '1,042 → 260',
    unit: '줄',
    label: '운영 중인 PASS 발송 서버 정리',
    detail:
      '운영/개발, 채널, 발송/결과 조합마다 복제돼 있던 스케줄러 8개를 2개로 합쳤습니다. 매퍼 바인딩 테스트, 실 DB SQL 스모크 테스트, 기동 테스트를 먼저 만들어 두고 단계마다 커밋했고, 단위 테스트는 6개에서 16개가 됐습니다.',
  },
  {
    metric: '중복 0',
    unit: '건',
    label: '건당 과금 발송의 중복 처리',
    detail:
      '여러 워커가 같은 건을 집지 못하게 상태 전이를 조건부 UPDATE로 처리했습니다. 외부 API 호출은 트랜잭션 밖으로 빼고, 같은 구축 작업을 동시에 부르던 경로는 공정 락으로 채번부터 커밋까지 줄 세웠습니다. 발송-결과 대사 기준입니다.',
  },
  {
    metric: '2~3만 건',
    unit: '/ 2.5~3분',
    label: '아침 버스트를 초당 상한 아래로',
    detail:
      '카카오 API는 초당 200문서까지만 받습니다. "다음에 보내도 되는 시각" 하나만 들고 있는 예약 방식 페이서를 직접 만들어, 아침에 한꺼번에 생기는 물량을 상한을 넘기지 않고 고르게 흘려보냅니다.',
  },
  {
    metric: '4시간 50분 → 31분',
    unit: '',
    label: '튜닝이 막혀서 처리 위치를 옮긴 배치',
    detail:
      'KT 청구서 배치의 적재 50분과 중복제거 프로시저 4시간을, 중복 판정을 적재 이전의 로컬 SQLite로 옮겨 약 31분으로 줄였습니다. 운영과 같은 규모 데이터(DB 753만 행)로 개발 환경에서 잰 값입니다.',
  },
  {
    metric: '19.9초 → 81ms',
    unit: '',
    label: '프로시저와 인덱스',
    detail:
      '서비스 대부분이 Java 백엔드와 Tibero·Oracle 프로시저로 돌아갑니다. PL/SQL 프로시저 5종을 직접 쓰고 다듬었고, 2만 건 UPDATE는 인덱스 하나로 19.9초에서 81ms가 됐습니다.',
  },
  {
    metric: '0.0.2',
    unit: 'Maven Central',
    label: '직접 만들어 쓰는 Spring Boot Starter',
    detail:
      'easy-quartz는 어노테이션 하나로 5종 스케줄과 Quartz/Spring 두 엔진을 묶는 개인 프로젝트입니다. Job 단위 잠금, 지수 백오프 재시도, Micrometer 메트릭, JDBC JobStore 클러스터링까지 넣었습니다.',
  },
]
