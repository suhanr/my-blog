import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized',{status:401})
  const form=await request.formData(); const id=String(form.get('id')||''); const status=String(form.get('status')||'PENDING')
  if (!id || !['APPROVED','PENDING','SPAM','TRASH'].includes(status)) return new Response('Invalid request',{status:400})
  const now=new Date().toISOString()
  await db.prepare(`UPDATE comments SET status=?,deleted_at=? WHERE id=?`).bind(status,status==='TRASH'?now:null,id).run()
  return Response.redirect(new URL('/admin/comments/',request.url),303)
}
