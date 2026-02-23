-- 역대 회장 테이블 생성
CREATE TABLE IF NOT EXISTS past_presidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,           -- 대수 (예: 제1대, 제2대)
  name TEXT NOT NULL,            -- 이름
  title TEXT,                    -- 직함 (예: TORCH 초대 회장)
  photo TEXT,                    -- 프로필 사진 (base64 또는 URL)
  year_start TEXT,               -- 재임 시작 연도 (예: 2018)
  year_end TEXT,                 -- 재임 종료 연도 (예: 2019)
  order_num INTEGER DEFAULT 0,   -- 표시 순서
  active INTEGER DEFAULT 1,      -- 활성화 여부 (1=활성, 0=비활성)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_past_presidents_order ON past_presidents(order_num);
CREATE INDEX IF NOT EXISTS idx_past_presidents_active ON past_presidents(active);
