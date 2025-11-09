-- ============================================
-- Supabase 数据库完整设置脚本
-- ============================================
-- 使用方法：在 Supabase 控制台的 SQL Editor 中执行此脚本
-- ============================================

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS itineraries CASCADE;

-- 2. 创建行程表
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  payload JSONB NOT NULL
);

-- 3. 添加索引（提高查询性能）
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itineraries_created_at ON itineraries(created_at DESC);
CREATE INDEX idx_itineraries_user_created ON itineraries(user_id, created_at DESC);

-- 4. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器（自动更新 updated_at）
CREATE TRIGGER update_itineraries_updated_at
    BEFORE UPDATE ON itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 启用行级安全 (RLS)
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- 7. 删除所有现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can insert their own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can update their own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Users can delete their own itineraries" ON itineraries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON itineraries;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON itineraries;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON itineraries;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON itineraries;

-- 8. 创建新的 RLS 策略

-- 策略 1: 用户只能查看自己的行程
CREATE POLICY "Users can view their own itineraries"
    ON itineraries
    FOR SELECT
    USING (auth.uid() = user_id);

-- 策略 2: 用户只能插入自己的行程（user_id 必须等于当前用户 ID）
CREATE POLICY "Users can insert their own itineraries"
    ON itineraries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 策略 3: 用户只能更新自己的行程
CREATE POLICY "Users can update their own itineraries"
    ON itineraries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 策略 4: 用户只能删除自己的行程
CREATE POLICY "Users can delete their own itineraries"
    ON itineraries
    FOR DELETE
    USING (auth.uid() = user_id);

-- 9. 验证设置
-- 执行以下查询验证表结构：
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'itineraries';

-- 10. 验证策略
-- 执行以下查询验证策略：
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'itineraries';

-- ============================================
-- 完成！
-- ============================================
-- 现在你的数据库已经配置完成，可以安全地使用 RLS 策略
-- 每个用户只能访问和修改自己的行程数据
-- ============================================

