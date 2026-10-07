// 소개 · 요즘 하는 일 · 기억에 남는 작업

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
  headline: '안녕하세요, 발송 서버를 만드는 6년차 백엔드 개발자 김현우입니다.',
  subHeadline:
    '공공기관 안내문을 SKT PASS, 카카오, KT 문자로 보내는 서버를 개발하고 운영합니다. 건당 요금이 나가는 일이라 한 건이라도 중복되면 바로 손해가 납니다. 그래서 트랜잭션과 동시성, 건수가 맞는지를 가장 신경 씁니다. 회사에서 하는 일과 직접 만든 것들을 이곳에 정리해 둡니다.',
  // 각 문단을 의미 단위 줄(line)로 분리
  intro: [
    [
      'Java와 Spring Boot로 서버를 만들고, Tibero·Oracle 프로시저가 함께 도는 서비스를 운영합니다.',
      '요즘은 SKT PASS 전자고지 발송 서버에 시간을 가장 많이 쓰고, 카카오 전자문서 서버와 KT 청구서 배치도 계속 고치고 있습니다.',
    ],
    [
      '운영 중이라 멈출 수 없는 서버를 고치는 일을 좋아합니다.',
      '테스트를 먼저 만들어 두고 조금씩 커밋하면서 정리하는 게 결국 가장 빠르다는 걸 여러 번 경험했습니다.',
    ],
    [
      '튜닝으로 더 줄지 않으면, 같은 일을 더 빨리 하려 하기보다 그 일을 어디서 처리할지부터 다시 봅니다.',
      '회사 밖에서는 필요한 도구를 직접 만들어 Maven Central과 npm에 올리고 있고, 요즘은 Kotlin을 공부하고 있습니다.',
    ],
  ],
  company: 'GIBIS',
  companyDesc: 'KT 전자고지 파트너사 · 대리',
  tenure: '2021.08 ~ 재직 중',
  domain: 'SKT PASS · 카카오 전자문서 · KT 문자',
}

export const links: ProfileLink[] = [
  { label: 'Email', value: 'gntj3200@gmail.com', href: 'mailto:gntj3200@gmail.com', icon: 'mail' },
  { label: 'GitHub', value: 'github.com/black-astro', href: 'https://github.com/black-astro', icon: 'github' },
]

// 기억에 남는 작업 — 홈 화면 카드
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
      '운영/개발, 채널, 발송/결과 조합마다 따로 있던 스케줄러 8개를 2개로 합쳤습니다. 먼저 매퍼 바인딩 테스트, 실제 DB에서 SQL을 돌려 보는 테스트, 기동 테스트를 만들어 두고 단계마다 커밋했습니다. 단위 테스트는 6개에서 16개로 늘었습니다.',
  },
  {
    metric: '중복 0',
    unit: '건',
    label: '건당 과금 발송에서 중복 없애기',
    detail:
      '여러 워커가 같은 건을 동시에 가져가지 않도록 상태 변경을 조건부 UPDATE로 처리했습니다. 외부 API 호출은 트랜잭션 밖으로 뺐고, 같은 작업이 동시에 들어오던 부분은 공정 락으로 채번부터 커밋까지 순서대로 처리하게 했습니다. 발송-결과 대사 기준입니다.',
  },
  {
    metric: '2~3만 건',
    unit: '/ 2.5~3분',
    label: '아침에 몰리는 발송을 초당 제한에 맞추기',
    detail:
      '카카오 API는 1초에 200건까지만 받습니다. 다음에 보내도 되는 시각만 기억하는 방식으로 발송 속도 조절 기능을 직접 만들었고, 아침에 한꺼번에 생기는 2~3만 건을 제한을 넘기지 않고 2.5~3분에 나눠 보냅니다.',
  },
  {
    metric: '4시간 50분 → 31분',
    unit: '',
    label: '튜닝으로 안 줄어서 처리 위치를 바꾼 배치',
    detail:
      'KT 청구서 배치에서 적재 50분, 중복제거 프로시저 4시간이 걸리던 구간입니다. 중복 판정을 적재 전에 로컬 SQLite에서 하도록 바꿔 약 31분으로 줄였습니다. 운영과 같은 규모의 데이터(DB 753만 행)로 개발 환경에서 측정했습니다.',
  },
  {
    metric: '19.9초 → 81ms',
    unit: '',
    label: '프로시저와 인덱스',
    detail:
      '회사 서비스 대부분이 Java 백엔드와 Tibero·Oracle 프로시저로 돌아갑니다. PL/SQL 프로시저 5종을 직접 작성하고 튜닝했고, 2만 건 UPDATE는 인덱스 하나를 추가해 19.9초에서 81ms로 줄였습니다.',
  },
  {
    metric: '0.0.2',
    unit: 'Maven Central',
    label: '직접 만들어 쓰는 Spring Boot Starter',
    detail:
      'easy-quartz는 어노테이션 하나로 스케줄 5종과 Quartz/Spring 두 엔진을 함께 쓸 수 있게 만든 개인 프로젝트입니다. Job 단위 잠금, 지수 백오프 재시도, Micrometer 메트릭, JDBC JobStore 클러스터링을 지원합니다.',
  },
]
