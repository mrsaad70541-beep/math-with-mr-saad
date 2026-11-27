const DATA = {"grades": [{"id": "g1", "title": "الصف الأول الإعدادي", "lessons": [{"lid": "g1l1", "title": "التناسب", "label": "الوحدة ١ · الدرس ١", "videos": [{"vid": "v1", "n": "المهارة ١: النسبة وكتابتها", "yt": "-BnSb8hf3N0"}]}]}, {"id": "g2", "title": "الصف الثاني الإعدادي", "lessons": [{"lid": "g2l1", "title": "الأعداد الحقيقية", "label": "الوحدة ١ · الدرس ١", "videos": [{"vid": "v1", "n": "المهارة ١: العدد غير النسبي", "yt": "eZueLMQsqnM"}, {"vid": "v2", "n": "المهارة ٢: إيجاد قيمة تقريبية لعدد غير نسبي", "yt": "gJb0S6RuExs"}]}]}, {"id": "g3", "title": "الصف الثالث الإعدادي", "lessons": [{"lid": "g3l1", "title": "قوى القوى", "label": "الوحدة ١ · الدرس ١", "quiz": "g3l1", "videos": [{"vid": "v1", "n": "المهارة ١: قوة القوة", "yt": "RK9T0qs1v1Q"}, {"vid": "v2", "n": "المهارة ٢: الإشارة", "yt": "yZO75JAatXk"}, {"vid": "v3", "n": "المهارة ٣: حاصل الضرب والقسمة", "yt": "fNgbJLtwVlg"}]}]}], "qudurat": {"title": "القدرات الكمي", "subtitle": "المنهج السعودي", "groups": []}, "leh": {"title": "ليه؟", "subtitle": "رياضيات عامة", "groups": []}};

const QUDURAT_CHAPTERS = [
  "الباب الأول: الحساب",
  "الباب الثاني: الجبر",
  "الباب الثالث: مسائل حياتية",
  "الباب الرابع: الهندسة",
  "الباب الخامس: الإحصاء",
  "الباب السادس: مسائل حياتية"
];

const LEH_SAMPLE = { yt: 'aBPMV0Jkiec', n: 'سالب في سالب — الأعداد الصحيحة', t: 'نموذج تجريبي من سلسلة ليه؟', dur: '' };
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
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٥</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٩</mn></mrow></msup></math></span>'], a: 1, exT: 'قوة القوة: نضرب الأسس', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn><mo>×</mo><mn>٣</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>×</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>١٢</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٤</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>١</mn></mrow></msup></math></span>'], a: 0, exT: 'حاصل الضرب لنفس الأساس: نجمع الأسس', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>×</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn><mo>+</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٤</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>١٠</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>١٦</mn></mrow></msup></math></span>'], a: 1, exT: 'حاصل القسمة لنفس الأساس: نطرح الأسس', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn><mo>−</mo><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٢</mn><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><mn>٨</mn></math></span>', '<span class="eq"><math dir="rtl"><mo>−</mo><mn>٨</mn></math></span>', '<span class="eq"><math dir="rtl"><mo>−</mo><mn>٦</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٦</mn></math></span>'], a: 1, exT: 'الأس الفردي يحافظ على الإشارة', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٢</mn><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><mo>−</mo><mn>٨</mn></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٣</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٣</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٣</mn></mrow><mrow><mn>٨</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٩</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٣</mn></mrow><mrow><mn>١٦</mn></mrow></msup></math></span>'], a: 1, exT: 'قوة القوة: نضرب الأسس', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٣</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٣</mn></mrow><mrow><mn>٢</mn><mo>×</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٣</mn></mrow><mrow><mn>٨</mn></mrow></msup></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٧</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٧</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><mn>٧</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>١</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٠</mn></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٧</mn></mrow><mrow><mn>١٠</mn></mrow></msup></math></span>'], a: 1, exT: 'نطرح الأسس، وأي عدد غير الصفر أس صفر يساوي ١', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٧</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٧</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٧</mn></mrow><mrow><mn>٥</mn><mo>−</mo><mn>٥</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٧</mn></mrow><mrow><mn>٠</mn></mrow></msup><mo>=</mo><mn>١</mn></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٣</mn><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><mo>−</mo><mn>٨١</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٨١</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>١٢</mn></math></span>', '<span class="eq"><math dir="rtl"><mo>−</mo><mn>١٢</mn></math></span>'], a: 1, exT: 'الأس الزوجي يعطي ناتجًا موجبًا لأي أساس غير صفري', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٣</mn><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٣</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>٨١</mn></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>٣</mn></mrow></msup><mo>×</mo><msup><mrow><mi>أ</mi></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>٧</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>١٢</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>٣٤</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><mn>٢</mn><msup><mrow><mi>أ</mi></mrow><mrow><mn>٧</mn></mrow></msup></math></span>'], a: 0, exT: 'حاصل الضرب لنفس الأساس: نجمع الأسس', exE: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>٣</mn></mrow></msup><mo>×</mo><msup><mrow><mi>أ</mi></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mn>٣</mn><mo>+</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mn>٧</mn></mrow></msup></math></span>' }
    ]
  }
};

const CHALLENGES = [
  {
    id: 'c20261126',
    date: '٢٦ نوفمبر ٢٠٢٦',
    iso: '2026-11-26',
    title: 'تحدي الأسس',
    q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>',
    o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٥</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٩</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>١٢</mn></mrow></msup></math></span>'],
    a: 1,
    exT: 'عند رفع قوة إلى قوة نضرب الأسس',
    exE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn><mo>×</mo><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>',
    level: 'سهل',
    cat: 'الأسس'
  }
];

const BOOK = [
  { t: 'قاعدة قوة القوة', p: 'لما ترفع قوة لقوة تانية، بنضرب الأسس في بعض.', f: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>)</mo></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎×‎</mo><mi>ن</mi></mrow></msup></math></span>', ex: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn><mo>×</mo><mn>٣</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>' },
  { t: 'حاصل الضرب', p: 'لو الأساس واحد وبتضرب، بنجمع الأسس.', f: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>×</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎+‎</mo><mi>ن</mi></mrow></msup></math></span>', ex: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>×</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn><mo>+</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>' },
  { t: 'حاصل القسمة', p: 'ولو الأساس واحد وبتقسم، بنطرح الأسس — بشرط الأساس مايساويش صفر.', f: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>÷</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎−‎</mo><mi>ن</mi></mrow></msup></math></span><div class="econd">بشرط <span class="eq"><math dir="rtl"><mi>أ</mi><mo>≠</mo><mn>٠</mn></math></span></div>', ex: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٨</mn><mo>−</mo><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٦</mn></mrow></msup></math></span>' },
  { t: 'الإشارة', p: 'الأس الفردي بيحافظ على إشارة العدد، والأس الزوجي بيخلي ناتج أي عدد غير صفري موجب دايمًا.', f: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٢</mn><mo>)</mo></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><mo>−</mo><mn>٨</mn></math></span><span class="fsep">،</span><span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٢</mn><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>١٦</mn></math></span>', ex: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٣</mn><mo>)</mo></mrow><mrow><mn>٥</mn></mrow></msup><mo>=</mo><mo>−</mo><mn>٢٤٣</mn></math></span><span class="fsep">،</span><span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><mo>−</mo><mn>٣</mn><mo>)</mo></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>٨١</mn></math></span>' }
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
      { t: 'أن يتعرف الطالب قاعدة قوة القوة', e: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>)</mo></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎×‎</mo><mi>ن</mi></mrow></msup></math></span>' },
      { t: 'أن يطبق قاعدة حاصل ضرب القوى لنفس الأساس', e: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>×</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎+‎</mo><mi>ن</mi></mrow></msup></math></span>' },
      { t: 'أن يطبق قاعدة حاصل قسمة القوى لنفس الأساس', e: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi></mrow></msup><mo>÷</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>ن</mi></mrow></msup><mo>=</mo><msup><mrow><mi>أ</mi></mrow><mrow><mi>م</mi><mo>‎−‎</mo><mi>ن</mi></mrow></msup></math></span>', c: 'بشرط <span class="eq"><math dir="rtl"><mi>أ</mi><mo>≠</mo><mn>٠</mn></math></span> و <span class="eq"><math dir="rtl"><mi>م</mi><mo>≥</mo><mi>ن</mi></math></span>' },
      { t: 'أن يتعرف أن أي أساس غير صفري مرفوع للأس صفر يساوي واحدًا', e: '<span class="eq"><math dir="rtl"><msup><mrow><mi>أ</mi></mrow><mrow><mn>٠</mn></mrow></msup><mo>=</mo><mn>١</mn></math></span>', c: 'بشرط <span class="eq"><math dir="rtl"><mi>أ</mi><mo>≠</mo><mn>٠</mn></math></span>' },
      { t: 'أن يحدد إشارة ناتج القوة حسب زوجية الأس وفرديته' }
    ],
    summary: 'الدرس بيجمع قواعد التعامل مع القوى ذات الأسس الصحيحة غير السالبة: قوة القوة (ضرب الأسس)، وحاصل الضرب (جمع الأسس)، وحاصل القسمة: نطرح الأسس بشرط أن الأساس لا يساوي صفرًا وأن <span class="eq"><math dir="rtl"><mi>م</mi><mo>≥</mo><mi>ن</mi></math></span> حتى يبقى الأس غير سالب، وقاعدة الإشارة: الأس الزوجي ناتجه موجب لأي أساس غير صفري، والأس الفردي بيحافظ على إشارة الأساس.',
    skills: ['قوة القوة', 'حاصل ضرب القوى', 'حاصل قسمة القوى', 'إشارة القوة'],
    examples: [
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup></math></span>', solT: 'نضرب الأسس', solE: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn><mo>×</mo><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٦</mn></mrow></msup><mo>=</mo><mn>٦٤</mn></math></span>' },
      { q: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٧</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٤</mn></mrow></msup></math></span>', solT: 'نطرح الأسس', solE: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٥</mn></mrow><mrow><mn>٧</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٧</mn><mo>−</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٥</mn></mrow><mrow><mn>٣</mn></mrow></msup><mo>=</mo><mn>١٢٥</mn></math></span>' }
    ]
  }
};

/* ===== اكتشف مستواك (تشخيص أولي مبني على إجابات حقيقية) ===== */
const DIAG = {
  title: 'اكتشف مستواك',
  note: 'تشخيص أولي من ٦ أسئلة على ٣ مهارات — مؤشر يعتمد على إجاباتك هنا فقط، وليس قياسًا شاملًا لمستواك.',
  questions: [
    { skill: 'النسبة والتناسب', lesson: '#/g/g1/l/0', q: 'النسبة <span class="eq"><math dir="rtl"><mn>٣</mn><mo>:</mo><mn>٥</mn></math></span> تكافئ النسبة؟', o: ['<span class="eq"><math dir="rtl"><mn>٦</mn><mo>:</mo><mn>١٠</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٥</mn><mo>:</mo><mn>٣</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٩</mn><mo>:</mo><mn>٢٠</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٣</mn><mo>:</mo><mn>١٠</mn></math></span>'], a: 0, ex: 'ضرب الطرفين في ٢: <span class="eq"><math dir="rtl"><mn>٣</mn><mo>:</mo><mn>٥</mn><mo>=</mo><mn>٦</mn><mo>:</mo><mn>١٠</mn></math></span>' },
    { skill: 'النسبة والتناسب', lesson: '#/g/g1/l/0', q: 'إذا كان <span class="eq"><math dir="rtl"><mn>٢</mn><mo>/</mo><mn>٥</mn><mo>=</mo><mi>س</mi><mo>/</mo><mn>١٥</mn></math></span> فإن س = ؟', o: ['<span class="eq"><math dir="rtl"><mn>٣</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٥</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٦</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>١٠</mn></math></span>'], a: 2, ex: 'المقام ضُرب في ٣، إذن البسط يُضرب في ٣: س = <span class="eq"><math dir="rtl"><mn>٢</mn><mo>×</mo><mn>٣</mn><mo>=</mo><mn>٦</mn></math></span>' },
    { skill: 'الأعداد الحقيقية', lesson: '#/g/g2/l/0', q: 'أي الأعداد التالية غير نسبي؟', o: ['<span class="eq"><math dir="rtl"><msqrt><mn>٩</mn></msqrt></math></span>', '<span class="eq"><math dir="rtl"><msqrt><mn>٥</mn></msqrt></math></span>', '<span class="eq"><math dir="rtl"><mn>٠٫٥</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٢</mn><mo>/</mo><mn>٣</mn></math></span>'], a: 1, ex: '<span class="eq"><math dir="rtl"><msqrt><mn>٩</mn></msqrt><mo>=</mo><mn>٣</mn></math></span> نسبي، أما <span class="eq"><math dir="rtl"><msqrt><mn>٥</mn></msqrt></math></span> فلا يُكتب كسرًا — عدد غير نسبي' },
    { skill: 'الأعداد الحقيقية', lesson: '#/g/g2/l/0', q: '<span class="eq"><math dir="rtl"><msqrt><mn>١٦</mn></msqrt><mo>+</mo><msqrt><mn>٩</mn></msqrt><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><mn>٥</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٧</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>١٢</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٢٥</mn></math></span>'], a: 1, ex: '<span class="eq"><math dir="rtl"><msqrt><mn>١٦</mn></msqrt><mo>=</mo><mn>٤</mn></math></span> و<span class="eq"><math dir="rtl"><msqrt><mn>٩</mn></msqrt><mo>=</mo><mn>٣</mn></math></span>، والمجموع ٧' },
    { skill: 'قوى القوى', lesson: '#/g/g3/l/0', q: '<span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>١٠</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٤</mn></mrow><mrow><mn>٧</mn></mrow></msup></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٢</mn></mrow><mrow><mn>٣</mn></mrow></msup></math></span>'], a: 1, ex: 'قوة القوة: نضرب الأسس — <span class="eq"><math dir="rtl"><msup><mrow><mo>(</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٥</mn></mrow></msup><mo>)</mo></mrow><mrow><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>٥</mn><mo>×</mo><mn>٢</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٢</mn></mrow><mrow><mn>١٠</mn></mrow></msup></math></span>' },
    { skill: 'قوى القوى', lesson: '#/g/g3/l/0', q: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٩</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>÷</mo><msup><mrow><mn>٩</mn></mrow><mrow><mn>٤</mn></mrow></msup><mo>=</mo><mn>؟</mn></math></span>', o: ['<span class="eq"><math dir="rtl"><mn>٩</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>١</mn></math></span>', '<span class="eq"><math dir="rtl"><mn>٠</mn></math></span>', '<span class="eq"><math dir="rtl"><msup><mrow><mn>٩</mn></mrow><mrow><mn>٨</mn></mrow></msup></math></span>'], a: 1, ex: '<span class="eq"><math dir="rtl"><msup><mrow><mn>٩</mn></mrow><mrow><mn>٤</mn><mo>−</mo><mn>٤</mn></mrow></msup><mo>=</mo><msup><mrow><mn>٩</mn></mrow><mrow><mn>٠</mn></mrow></msup><mo>=</mo><mn>١</mn></math></span> — أي أساس غير صفري أس صفر يساوي ١' }
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
