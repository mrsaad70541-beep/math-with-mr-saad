const DATA = {"grades": [{"id": "g1", "title": "الصف الأول الإعدادي", "lessons": [{"title": "التناسب", "label": "الوحدة ٠١ · الدرس ٠١", "videos": [{"n": "المهارة ١: النسبة وكتابتها", "yt": "-BnSb8hf3N0"}]}]}, {"id": "g2", "title": "الصف الثاني الإعدادي", "lessons": [{"title": "الأعداد الحقيقية", "label": "الوحدة ٠١ · الدرس ٠١", "videos": [{"n": "المهارة ١: العدد غير النسبي", "yt": "eZueLMQsqnM"}, {"n": "المهارة ٢: إيجاد قيمة تقريبية لعدد غير نسبي", "yt": "gJb0S6RuExs"}]}]}, {"id": "g3", "title": "الصف الثالث الإعدادي", "lessons": [{"title": "قوى القوى", "label": "الوحدة ٠١ · الدرس ٠١", "quiz": "g3l1", "videos": [{"n": "المهارة ١: قوة القوة", "yt": "RK9T0qs1v1Q"}, {"n": "المهارة ٢: الإشارة", "yt": "yZO75JAatXk"}, {"n": "المهارة ٣: حاصل الضرب والقسمة", "yt": "fNgbJLtwVlg"}]}]}], "qudurat": {"title": "القدرات الكمي", "subtitle": "المنهج السعودي", "groups": []}, "leh": {"title": "ليه؟", "subtitle": "رياضيات عامة", "groups": []}};

const QUDURAT_CHAPTERS = [
  "الباب الأول: الحساب",
  "الباب الثاني: الجبر",
  "الباب الثالث: مسائل حياتية",
  "الباب الرابع: الهندسة",
  "الباب الخامس: الإحصاء",
  "الباب السادس: مسائل حياتية"
];

const LEH_CATS = [
  "الحيل الرياضية",
  "الألغاز والتحديات",
  "الأخطاء الرياضية الشائعة",
  "أسرار الأعداد",
  "الهندسة الممتعة",
  "الرياضيات في الحياة",
  "طرق الحل غير التقليدية",
  "الظواهر والنظريات الرياضية"
];

const QUIZSETS = {
  g3l1: {
    title: 'اختبار درس قوى القوى',
    skill: 'قوى القوى',
    questions: [
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٥</span><sup>٢</sup></span>)</span><sup>٣</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">٥</span><sup>٥</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>٦</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>٨</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>٩</sup></span>'], a: 1, exT: 'قوة القوة: نضرب الأسس', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٥</span><sup>٢</sup></span>)</span><sup>٣</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٢×٣</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٦</sup></span></span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٢</span><sup>٣</sup></span> × <span class="pw"><span class="bs">٢</span><sup>٤</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">٢</span><sup>٧</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>١٢</sup></span>', '<span class="pw"><span class="bs">٤</span><sup>٧</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>١</sup></span>'], a: 0, exT: 'حاصل الضرب لنفس الأساس: نجمع الأسس', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٢</span><sup>٣</sup></span> × <span class="pw"><span class="bs">٢</span><sup>٤</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٣+٤</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٧</sup></span></span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٥</span><sup>٨</sup></span> ÷ <span class="pw"><span class="bs">٥</span><sup>٢</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">٥</span><sup>٤</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>٦</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>١٠</sup></span>', '<span class="pw"><span class="bs">٥</span><sup>١٦</sup></span>'], a: 1, exT: 'حاصل القسمة لنفس الأساس: نطرح الأسس', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٥</span><sup>٨</sup></span> ÷ <span class="pw"><span class="bs">٥</span><sup>٢</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٨−٢</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٦</sup></span></span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٢)</span><sup>٣</sup></span> = ؟</span>', o: ['٨', '−٨', '−٦', '٦'], a: 1, exT: 'الأس الفردي يحافظ على الإشارة', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٢)</span><sup>٣</sup></span> = −٨</span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٣</span><sup>٢</sup></span>)</span><sup>٤</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">٣</span><sup>٦</sup></span>', '<span class="pw"><span class="bs">٣</span><sup>٨</sup></span>', '<span class="pw"><span class="bs">٩</span><sup>٦</sup></span>', '<span class="pw"><span class="bs">٣</span><sup>١٦</sup></span>'], a: 1, exT: 'قوة القوة: نضرب الأسس', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٣</span><sup>٢</sup></span>)</span><sup>٤</sup></span> = <span class="pw"><span class="bs">٣</span><sup>٢×٤</sup></span> = <span class="pw"><span class="bs">٣</span><sup>٨</sup></span></span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٧</span><sup>٥</sup></span> ÷ <span class="pw"><span class="bs">٧</span><sup>٥</sup></span> = ؟</span>', o: ['٧', '١', '٠', '<span class="pw"><span class="bs">٧</span><sup>١٠</sup></span>'], a: 1, exT: 'نطرح الأسس، وأي عدد غير الصفر أس صفر يساوي ١', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٧</span><sup>٥</sup></span> ÷ <span class="pw"><span class="bs">٧</span><sup>٥</sup></span> = <span class="pw"><span class="bs">٧</span><sup>٥−٥</sup></span> = <span class="pw"><span class="bs">٧</span><sup>٠</sup></span> = ١</span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٣)</span><sup>٤</sup></span> = ؟</span>', o: ['−٨١', '٨١', '١٢', '−١٢'], a: 1, exT: 'الأس الزوجي يعطي ناتجًا موجبًا لأي أساس غير صفري', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٣)</span><sup>٤</sup></span> = <span class="pw"><span class="bs">٣</span><sup>٤</sup></span> = ٨١</span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>٣</sup></span> × <span class="pw"><span class="bs">أ</span><sup>٤</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">أ</span><sup>٧</sup></span>', '<span class="pw"><span class="bs">أ</span><sup>١٢</sup></span>', '<span class="pw"><span class="bs">أ</span><sup>٣٤</sup></span>', '٢<span class="pw"><span class="bs">أ</span><sup>٧</sup></span>'], a: 0, exT: 'حاصل الضرب لنفس الأساس: نجمع الأسس', exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>٣</sup></span> × <span class="pw"><span class="bs">أ</span><sup>٤</sup></span> = <span class="pw"><span class="bs">أ</span><sup>٣+٤</sup></span> = <span class="pw"><span class="bs">أ</span><sup>٧</sup></span></span>' }
    ]
  }
};

const CHALLENGES = [
  {
    id: 'c20261126',
    date: '٢٦ نوفمبر ٢٠٢٦',
    title: 'تحدي الأسس',
    q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٣</sup></span>)</span><sup>٢</sup></span> = ؟</span>',
    o: ['<span class="pw"><span class="bs">٢</span><sup>٥</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>٦</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>٩</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>١٢</sup></span>'],
    a: 1,
    exT: 'عند رفع قوة إلى قوة نضرب الأسس',
    exE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٣</sup></span>)</span><sup>٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٣×٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٦</sup></span></span>',
    level: 'سهل',
    cat: 'الأسس'
  }
];

const BOOK = [
  { t: 'قاعدة قوة القوة', p: 'لما ترفع قوة لقوة تانية، بنضرب الأسس في بعض.', f: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">أ</span><sup>م</sup></span>)</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م×ن</sup></span></span>', ex: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٥</span><sup>٢</sup></span>)</span><sup>٣</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٢×٣</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٦</sup></span></span>' },
  { t: 'حاصل الضرب', p: 'لو الأساس واحد وبتضرب، بنجمع الأسس.', f: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>م</sup></span> × <span class="pw"><span class="bs">أ</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م+ن</sup></span></span>', ex: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٢</span><sup>٣</sup></span> × <span class="pw"><span class="bs">٢</span><sup>٤</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٣+٤</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٧</sup></span></span>' },
  { t: 'حاصل القسمة', p: 'ولو الأساس واحد وبتقسم، بنطرح الأسس — بشرط الأساس مايساويش صفر.', f: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>م</sup></span> ÷ <span class="pw"><span class="bs">أ</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م−ن</sup></span></span><div class="econd">بشرط <span class="eq" dir="ltr">أ ≠ ٠</span></div>', ex: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٥</span><sup>٨</sup></span> ÷ <span class="pw"><span class="bs">٥</span><sup>٢</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٨−٢</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٦</sup></span></span>' },
  { t: 'الإشارة', p: 'الأس الفردي بيحافظ على إشارة العدد، والأس الزوجي بيخلي ناتج أي عدد غير صفري موجب دايمًا.', f: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٢)</span><sup>٣</sup></span> = −٨</span><span class="fsep">،</span><span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٢)</span><sup>٤</sup></span> = ١٦</span>', ex: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٣)</span><sup>٥</sup></span> = −٢٤٣</span><span class="fsep">،</span><span class="eq" dir="ltr"><span class="pw"><span class="bs">(−٣)</span><sup>٤</sup></span> = ٨١</span>' }
];

/* ===== مكتبة الملفات (structure; files added here when publication is approved) =====
   LIB_FILES schema: {id, title, desc, grade, subject, cat, url, thumb?, added, allowDownload} */
const LIB_CATS = [
  { id: 'worksheets', n: 'أوراق العمل' },
  { id: 'exams', n: 'الاختبارات' },
  { id: 'summaries', n: 'الملخصات' },
  { id: 'final-reviews', n: 'المراجعات النهائية' },
  { id: 'educational', n: 'الملفات التعليمية' },
  { id: 'books', n: 'الكتب المصرح بنشرها' },
  { id: 'activities', n: 'الأنشطة الصفية' },
  { id: 'aids', n: 'الوسائل التعليمية' },
  { id: 'figures', n: 'الرسومات الرياضية' }
];
const LIB_FILES = [];

/* ===== بيانات الدروس (تُضاف لكل درس؛ تُعرض العناصر المتوفرة فقط) ===== */
const LESSON_META = {
  'g3/0': {
    objectives: [
      { t: 'أن يتعرف الطالب قاعدة قوة القوة', e: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">أ</span><sup>م</sup></span>)</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م×ن</sup></span></span>' },
      { t: 'أن يطبق قاعدة حاصل ضرب القوى لنفس الأساس', e: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>م</sup></span> × <span class="pw"><span class="bs">أ</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م+ن</sup></span></span>' },
      { t: 'أن يطبق قاعدة حاصل قسمة القوى لنفس الأساس', e: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>م</sup></span> ÷ <span class="pw"><span class="bs">أ</span><sup>ن</sup></span> = <span class="pw"><span class="bs">أ</span><sup>م−ن</sup></span></span>', c: 'بشرط <span class="eq" dir="ltr">أ ≠ ٠</span> و <span class="eq" dir="ltr">م ≥ ن</span>' },
      { t: 'أن يتعرف أن أي أساس غير صفري مرفوع للأس صفر يساوي واحدًا', e: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">أ</span><sup>٠</sup></span> = ١</span>', c: 'بشرط <span class="eq" dir="ltr">أ ≠ ٠</span>' },
      { t: 'أن يحدد إشارة ناتج القوة حسب زوجية الأس وفرديته' }
    ],
    summary: 'الدرس بيجمع قواعد التعامل مع القوى ذات الأسس الصحيحة غير السالبة: قوة القوة (ضرب الأسس)، وحاصل الضرب (جمع الأسس)، وحاصل القسمة: نطرح الأسس بشرط أن الأساس لا يساوي صفرًا وأن <span class="eq" dir="ltr">م ≥ ن</span> حتى يبقى الأس غير سالب، وقاعدة الإشارة: الأس الزوجي ناتجه موجب لأي أساس غير صفري، والأس الفردي بيحافظ على إشارة الأساس.',
    skills: ['قوة القوة', 'حاصل ضرب القوى', 'حاصل قسمة القوى', 'إشارة القوة'],
    examples: [
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٣</sup></span>)</span><sup>٢</sup></span></span>', solT: 'نضرب الأسس', solE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٣</sup></span>)</span><sup>٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٣×٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٦</sup></span> = ٦٤</span>' },
      { q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٥</span><sup>٧</sup></span> ÷ <span class="pw"><span class="bs">٥</span><sup>٤</sup></span></span>', solT: 'نطرح الأسس', solE: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٥</span><sup>٧</sup></span> ÷ <span class="pw"><span class="bs">٥</span><sup>٤</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٧−٤</sup></span> = <span class="pw"><span class="bs">٥</span><sup>٣</sup></span> = ١٢٥</span>' }
    ]
  }
};

/* ===== اكتشف مستواك (تشخيص أولي مبني على إجابات حقيقية) ===== */
const DIAG = {
  title: 'اكتشف مستواك',
  note: 'تشخيص أولي من ٦ أسئلة على ٣ مهارات — مؤشر يعتمد على إجاباتك هنا فقط، وليس قياسًا شاملًا لمستواك.',
  questions: [
    { skill: 'النسبة والتناسب', lesson: '#/g/g1/l/0', q: 'النسبة <span class="eq" dir="ltr">٣ : ٥</span> تكافئ النسبة؟', o: ['<span class="eq" dir="ltr">٦ : ١٠</span>', '<span class="eq" dir="ltr">٥ : ٣</span>', '<span class="eq" dir="ltr">٩ : ٢٠</span>', '<span class="eq" dir="ltr">٣ : ١٠</span>'], a: 0, ex: 'ضرب الطرفين في ٢: <span class="eq" dir="ltr">٣ : ٥ = ٦ : ١٠</span>' },
    { skill: 'النسبة والتناسب', lesson: '#/g/g1/l/0', q: 'إذا كان <span class="eq" dir="ltr">٢/٥ = س/١٥</span> فإن س = ؟', o: ['٣', '٥', '٦', '١٠'], a: 2, ex: 'المقام ضُرب في ٣، إذن البسط يُضرب في ٣: س = <span class="eq" dir="ltr">٢ × ٣ = ٦</span>' },
    { skill: 'الأعداد الحقيقية', lesson: '#/g/g2/l/0', q: 'أي الأعداد التالية غير نسبي؟', o: ['<span class="eq" dir="ltr">√٩</span>', '<span class="eq" dir="ltr">√٥</span>', '<span class="eq" dir="ltr">٠٫٥</span>', '<span class="eq" dir="ltr">٢/٣</span>'], a: 1, ex: '<span class="eq" dir="ltr">√٩ = ٣</span> نسبي، أما <span class="eq" dir="ltr">√٥</span> فلا يُكتب كسرًا — عدد غير نسبي' },
    { skill: 'الأعداد الحقيقية', lesson: '#/g/g2/l/0', q: '<span class="eq" dir="ltr">√١٦ + √٩ = ؟</span>', o: ['٥', '٧', '١٢', '٢٥'], a: 1, ex: '<span class="eq" dir="ltr">√١٦ = ٤</span> و<span class="eq" dir="ltr">√٩ = ٣</span>، والمجموع ٧' },
    { skill: 'قوى القوى', lesson: '#/g/g3/l/0', q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٥</sup></span>)</span><sup>٢</sup></span> = ؟</span>', o: ['<span class="pw"><span class="bs">٢</span><sup>٧</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>١٠</sup></span>', '<span class="pw"><span class="bs">٤</span><sup>٧</sup></span>', '<span class="pw"><span class="bs">٢</span><sup>٣</sup></span>'], a: 1, ex: 'قوة القوة: نضرب الأسس — <span class="eq" dir="ltr"><span class="pw"><span class="bs">(<span class="pw"><span class="bs">٢</span><sup>٥</sup></span>)</span><sup>٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>٥×٢</sup></span> = <span class="pw"><span class="bs">٢</span><sup>١٠</sup></span></span>' },
    { skill: 'قوى القوى', lesson: '#/g/g3/l/0', q: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٩</span><sup>٤</sup></span> ÷ <span class="pw"><span class="bs">٩</span><sup>٤</sup></span> = ؟</span>', o: ['٩', '١', '٠', '<span class="pw"><span class="bs">٩</span><sup>٨</sup></span>'], a: 1, ex: '<span class="eq" dir="ltr"><span class="pw"><span class="bs">٩</span><sup>٤−٤</sup></span> = <span class="pw"><span class="bs">٩</span><sup>٠</sup></span> = ١</span> — أي أساس غير صفري أس صفر يساوي ١' }
  ]
};

/* ===== الإنجازات (محلية، مرتبطة بالتعلم الحقيقي) ===== */
const ACHIEVEMENTS = [
  { id: 'lesson', n: 'إكمال درس', desc: 'أكملت اختبار أحد الدروس حتى النهاية' },
  { id: 'master', n: 'إتقان مهارة', desc: 'حصلت على العلامة الكاملة في اختبار درس' },
  { id: 'improve', n: 'تحسين الأداء', desc: 'حسّنت نتيجتك في اختبار أعِدته' },
  { id: 'fix', n: 'تصحيح الأخطاء', desc: 'أجبت دون أخطاء في مهارة سبق أن أخطأت فيها' },
  { id: 'challenge', n: 'حل تحدي اليوم', desc: 'حللت تحدي اليوم حلًّا صحيحًا' },
  { id: 'cert', n: 'شهادة إتمام الوحدة', desc: 'أتقنت مهارة الدرس وحللت تحدي اليوم' }
];
