/** Real settings handler + SQL, isolated PostgreSQL. Never uses production credentials.
 * node scripts/test-event-layouts.mjs
 * node scripts/test-event-layouts.mjs --serve (local browser fixture on port 4191)
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { PGlite } from "@electric-sql/pglite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pg = await PGlite.create();
await pg.exec("CREATE TABLE site_settings (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());");
function sqlAdapter(db) {
  const tag = async (parts, ...values) => {
    const statement = parts.reduce((result, part, index) => result + part + (index < values.length ? `$${index + 1}` : ""), "");
    return (await db.query(statement, values)).rows;
  };
  tag.json = value => JSON.stringify(value);
  return tag;
}
globalThis.__EVENT_LAYOUT_SQL = sqlAdapter(pg);
const built = await build({absWorkingDir:root,stdin:{contents:'export { default as handler } from "./server/api-handlers/settings.ts"; export * from "./src/data/eventLayouts.ts";',resolveDir:root,loader:"ts"},bundle:true,platform:"node",format:"esm",write:false,plugins:[{name:"isolated-db-auth",setup(b){
  b.onResolve({filter:/(?:^|\/)db\.js$/},()=>({path:"db",namespace:"fixture"}));
  b.onResolve({filter:/(?:^|\/)adminAuth\.js$/},()=>({path:"auth",namespace:"fixture"}));
  b.onLoad({filter:/.*/,namespace:"fixture"},args=>({loader:"js",contents:args.path==="db"?'export function getDb(){return globalThis.__EVENT_LAYOUT_SQL;} export function isDbConfigured(){return true;}':`export async function ensureAdmin(req){if(req.headers['x-event-fixture-admin']!=='true'){const e=new Error('Sesión requerida');e.name='UnauthorizedError';throw e;}return {user:{id:'fixture-admin',name:'Prueba local',email:'admin@example.invalid',role:'admin'}};}`}));
}}]});
const bundlePath=path.join(root,"output/event-layout-test-bundle.mjs");
fs.mkdirSync(path.dirname(bundlePath),{recursive:true});fs.writeFileSync(bundlePath,built.outputFiles[0].text);
const app = await import(pathToFileURL(bundlePath).href);
async function request(method, body, authenticated = false, key = null) {
  const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []);
  req.method=method;req.url="/api/route?path=settings"+(key?"&key="+key:"");req.headers=authenticated?{"x-event-fixture-admin":"true"}:{};
  let text="";const res={statusCode:200,setHeader(){},end(value=""){text+=value;}};
  await app.handler(req,res);
  return {status:res.statusCode,data:JSON.parse(text)};
}
const key=app.EVENT_LAYOUT_KEY;
let count=0;
assert.equal((await request("GET",null,false,key)).data.value,null);count++;
assert.equal(app.parseEventLayoutSetting(null).layout,"simple");count++;
assert.equal((await request("PUT",{key,value:{version:1,layout:"editorial"}})).status,401);count++;
assert.equal((await request("PUT",{key,value:{version:1,layout:"unknown"}},true)).status,400);count++;
assert.equal((await request("PUT",{key,value:{version:1,layout:"simple",extra:true}},true)).status,400);count++;
let revision="";
for(const layout of app.EVENT_LAYOUTS){
  const saved=await request("PUT",{key,value:{version:1,layout},baseUpdatedAt:revision},true);
  assert.equal(saved.status,200,JSON.stringify(saved));
  const stored=await request("GET",null,false,key);assert.equal(stored.data.value.layout,layout);assert.ok(stored.data.updated_at);revision=stored.data.updated_at;count++;
  assert.equal((await request("GET")).data[key].layout,layout);count++;
}
assert.equal((await request("PUT",{key,value:{version:1,layout:"simple"},baseUpdatedAt:"2020-01-01T00:00:00Z"},true)).status,409);count++;
assert.equal((await request("GET",null,false,key)).data.value.layout,"sections");count++;
assert.equal(app.sameEventLayoutRevision(new Date("2026-10-20T12:00:00.125Z"),"2026-10-20T12:00:00.125Z"),true);count++;
assert.equal(app.sameEventLayoutRevision(new Date("2026-10-20T12:00:00.125Z"),"2026-10-20T12:00:00.000Z"),false);count++;
assert.equal((await pg.query("SELECT count(*)::int AS n FROM admin_audit_log WHERE resource_id=$1",[key])).rows[0].n,3);count++;
await request("PUT",{key,value:{version:1,layout:"simple"},baseUpdatedAt:revision},true);
console.log(`${count} checks passed: authenticated publishing, all 3 formats, public reads, invalid payloads, stale revisions and audit trail.`);
if(!process.argv.includes("--serve")){await pg.close();process.exit(0);}
const publicSettings=await(await fetch("https://www.regulatel.org/api/route?path=settings")).json();delete publicSettings[key];
const fixtureEvents=JSON.parse(fs.readFileSync(path.join(root,"src/data/semanaRegulatelResources.ts"),"utf8").split("= ")[1].replace(/;\s*$/,""));
const send=(res,data,status=200)=>{res.writeHead(status,{"Content-Type":"application/json"});res.end(JSON.stringify(data));};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,"http://127.0.0.1:4191");
 if(url.pathname.startsWith("/api/")){
  const route=url.searchParams.get("path")??url.pathname.replace(/^\/api\//,"");
  if(route==="settings"){
   if(req.method==="GET"&&!url.searchParams.has("key")){const local=await request("GET");return send(res,{...publicSettings,...local.data});}
   if(req.headers.cookie?.includes("event-layout-fixture=admin"))req.headers["x-event-fixture-admin"]="true";
   return await app.handler(req,res);
  }
  if(route==="admin/session")return send(res,{authenticated:true,configured:true,bootstrapRequired:false,user:{id:"fixture-admin",name:"Prueba local",email:"admin@example.invalid",role:"admin"}});
  if(route==="events")return send(res,fixtureEvents);
  if(route.startsWith("events/")){const event=fixtureEvents.find(e=>e.id===route.slice(7));return send(res,event??{error:"No encontrado"},event?200:404);}
  if(route==="uploads")return send(res,{usedBytes:0,limitBytes:1073741824,remainingBytes:1073741824,fileCount:0,percent:0});
  if(route==="news"||route==="documents")return send(res,[]);
  if(req.method!=="GET")return send(res,{error:"Fixture does not forward writes"},405);
  const response=await fetch("https://www.regulatel.org"+url.pathname+url.search);return send(res,await response.json(),response.status);
 }
 if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405).end();return;}
 const dist=path.join(root,"dist");const file=path.resolve(dist,"."+decodeURIComponent(url.pathname));
 if(!file.startsWith(dist+path.sep)&&file!==dist){res.writeHead(400).end();return;}
 res.setHeader("Set-Cookie","event-layout-fixture=admin; Path=/; HttpOnly; SameSite=Strict");
 if(fs.existsSync(file)&&fs.statSync(file).isFile()){res.setHeader("Content-Type",({".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".pdf":"application/pdf",".jpeg":"image/jpeg",".jpg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml"})[path.extname(file)]??"application/octet-stream");fs.createReadStream(file).pipe(res);return;}
 res.setHeader("Content-Type","text/html");fs.createReadStream(path.join(dist,"index.html")).pipe(res);
}catch(e){send(res,{error:e.message},500);}}).listen(4191,"127.0.0.1",()=>console.log("Isolated admin fixture: http://127.0.0.1:4191/admin/content/formato-eventos"));
