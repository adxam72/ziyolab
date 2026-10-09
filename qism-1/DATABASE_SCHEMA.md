# Ma’lumotlar bazasi

Prisma: prisma/schema.prisma. PostgreSQL migration pgvector va vector(768) yaratadi.

Production provayder: Supabase PostgreSQL. Ikkinchi Prisma migratsiyasi 18 ilova jadvalida RLSni yoqadi, ommaviy Data API rollari huquqlarini bekor qiladi. Mavjud custom session autentifikatsiyasi saqlanadi; Supabase Auth ushbu bosqichda talab qilinmagan. DATABASE_URL va DIRECT_URL faqat server environmentda.

Faculty -> Group -> User. User: email unique, passwordHash, STUDENT/TEACHER/SUPERVISOR/ADMIN.
Session: tokenHash unique, expiresAt, userId. RateLimit: key unique, count, windowStart.
Skill -> Question(prompt/options/correctIndex/explanation).
Assessment(user,status,questionIds,answers/results JSON,completedAt).
SkillScore(user+skill unique,percent,evidenceCount). LearningTask(user+skill unique,material,done).
Material(faculty,skill,author,title,content,embeddingModel,indexedAt) -> MaterialChunk(content,vector(768)).
Assignment(group,teacher,title,description,dueAt) -> Submission(user+assignment unique,content,grade,feedback).
ResearchProject(student,supervisor,faculty,title,question,method,stage,outcome) -> ResearchComment(author,content).
PortfolioItem(user,title,description,url). ChatMessage(user,role,content,citations JSON).

Tenant scope server query qatlamida. FK/unique constraintlar. Assessment savol snapshotini saqlaydi; pasport so‘nggi natijadan tranzaksiyada yangilanadi, eski testlar tarixda. Baholanmagan ko‘nikma nol emas. RAG null embedding indekslanmagan holat; nol/tasodifiy vektor seed yo‘q. HNSW cosine index SQLda.
