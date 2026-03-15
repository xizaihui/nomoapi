// 审计模块常量
export const RISK_LEVELS = {
  0: { label: '正常', color: 'green', badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  1: { label: '可疑', color: 'yellow', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  2: { label: '危险', color: 'orange', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  3: { label: '高危', color: 'red', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
};

export const CATEGORIES = {
  prohibited: { label: '违禁内容', icon: '🚫', desc: '黄赌毒、血腥暴力、仇恨言论' },
  political:  { label: '政治敏感', icon: '🏛️', desc: '政治事件、敏感人物、政治立场' },
  secret:     { label: '商业机密', icon: '🔒', desc: '公司核心文件、商业秘密、内部资料' },
  credential: { label: '凭证泄露', icon: '🔑', desc: '密码、API Key、私钥、数据库连接串' },
  infra:      { label: '基础设施', icon: '🖥️', desc: '服务器地址、生产环境配置、运维权限' },
  custom:     { label: '自定义规则', icon: '⚙️', desc: '公司自定义关键词和匹配规则' },
};

export const RULE_TYPES = {
  keyword: { label: '关键词匹配', desc: '包含任一关键词即命中' },
  regex:   { label: '正则匹配', desc: '正则表达式匹配' },
};
