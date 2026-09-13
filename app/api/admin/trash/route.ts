import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request:Request){if(!(await isAdmin(request)))return new Response('Unauthorized',{status:401});const f=await request.formData();const type=String(f.get('type')||'');const id=String(f.get('id')||'');const action=String(f.get('action')||'restore');if(!id||!['post','comment','category','tag','media'].includes(type)||!['restore','empty'].includes(action))return new Response('Invalid request',{status:400});
 const now=new Date().toISOString()
 if(type==='post') await db.prepare(`UPDATE posts SET deleted_at=NULL,status='DRAFT',updated_at=? WHERE id=?`).bind(now,id).run()
 if(type==='comment') await db.prepare(`UPDATE comments SET deleted_at=NULL,status='PENDING' WHERE id=?`).bind(id).run()
 if(type==='category') await db.prepare(`UPDATE categories SET deleted_at=NULL WHERE id=?`).bind(id).run()
 if(type==='tag') await db.prepare(`UPDATE tags SET deleted_at=NULL WHERE id=?`).bind(id).run()
 if(type==='media') await db.prepare(`UPDATE media_assets SET deleted_at=NULL WHERE id=?`).bind(id).run()
 return Response.redirect(new URL('/admin/trash/',request.url),303)}
