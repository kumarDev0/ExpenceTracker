import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CAT_COLORS = {
  food: "#f472b6", transport: "#60a5fa", entertainment: "#a78bfa",
  shopping: "#fb923c", health: "#34d399", other: "#facc15",
};
const CAT_ICONS = {
  food: "🍕", transport: "🚗", entertainment: "🎬",
  shopping: "🛍️", health: "💊", other: "📦",
};
const PALETTE = ["#a78bfa","#f472b6","#34d399","#fb923c","#60a5fa","#facc15","#e879f9","#2dd4bf"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DonutChart({ data, size = 130 }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign:"center", color:"#555", fontSize:12, padding:20 }}>No expenses</div>
  );
  const total = data.reduce((s, d) => s + parseFloat(d.total || 0), 0);
  if (total === 0) return <div style={{ textAlign:"center", color:"#555", fontSize:12, padding:20 }}>No expenses</div>;
  const cx = size/2, cy = size/2, r = size*0.38, ir = size*0.22;
  let cum = 0;
  const slices = data.map((d, i) => {
    const val = parseFloat(d.total || 0);
    const pct = val / total;
    const a1 = cum * 2 * Math.PI - Math.PI/2;
    cum += pct;
    const a2 = cum * 2 * Math.PI - Math.PI/2;
    const lg = pct > 0.5 ? 1 : 0;
    const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
    const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
    const ix1=cx+ir*Math.cos(a1), iy1=cy+ir*Math.sin(a1);
    const ix2=cx+ir*Math.cos(a2), iy2=cy+ir*Math.sin(a2);
    return {
      path:`M${ix1},${iy1}L${x1},${y1}A${r},${r},0,${lg},1,${x2},${y2}L${ix2},${iy2}A${ir},${ir},0,${lg},0,${ix1},${iy1}Z`,
      color: CAT_COLORS[d.category] || PALETTE[i % PALETTE.length],
      label: d.category, pct: Math.round(pct*100), total: val,
    };
  });
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s,i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={ir-1} fill="#0f0f1e" />
        <text x={cx} y={cy-5} textAnchor="middle" fill="#fff" fontSize={size*0.08} fontWeight="700">
          {"\u20B9"}{total>=1000?(total/1000).toFixed(1)+"k":Math.round(total)}
        </text>
        <text x={cx} y={cy+10} textAnchor="middle" fill="#888" fontSize={size*0.065}>total</text>
      </svg>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 10px", justifyContent:"center" }}>
        {slices.map((s,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#bbb" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:s.color, flexShrink:0 }} />
            {CAT_ICONS[s.label]||"📦"} {s.label} {s.pct}%
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyBar({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) return null;
  const max = Math.max(...monthlyData.map(m => m.total), 1);
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80, padding:"0 4px" }}>
        {monthlyData.map((m,i) => {
          const h = Math.max((m.total/max)*72, m.total>0?4:0);
          return (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              {m.total > 0 && (
                <div style={{ fontSize:8, color:"#a78bfa", fontWeight:600 }}>
                  {m.total>=1000?(m.total/1000).toFixed(1)+"k":Math.round(m.total)}
                </div>
              )}
              <div style={{
                width:"100%", height:h, borderRadius:"3px 3px 0 0",
                background: m.total>0 ? "linear-gradient(180deg,#a78bfa,#6d28d9)" : "#1e1e3a",
              }} />
              <div style={{ fontSize:8, color:"#555" }}>{MONTHS[m.month-1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserCard({ user, expenses, idx }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const userExp = expenses.filter(e => e.email === user.email);
  const total = userExp.reduce((s, e) => s + parseFloat(e.amount), 0);
  const avatarColor = PALETTE[idx % PALETTE.length];
  const now = new Date();

  const thisMonthTotal = userExp.filter(e => {
    const d = new Date(e.date);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce((s,e) => s+parseFloat(e.amount), 0);

  const thisYearTotal = userExp.filter(e =>
    new Date(e.date).getFullYear()===now.getFullYear()
  ).reduce((s,e) => s+parseFloat(e.amount), 0);

  const catMap = {};
  userExp.forEach(e => { catMap[e.category]=(catMap[e.category]||0)+parseFloat(e.amount); });
  const catData = Object.entries(catMap).map(([category,total]) => ({category,total})).sort((a,b)=>b.total-a.total);

  const monthlyMap = {};
  userExp.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear()===now.getFullYear()) {
      const m = d.getMonth()+1;
      monthlyMap[m]=(monthlyMap[m]||0)+parseFloat(e.amount);
    }
  });
  const monthlyData = Array.from({length:12},(_,i) => ({ month:i+1, total:monthlyMap[i+1]||0 }));

  const joinDate = new Date(user.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});

  return (
    <div style={{
      background:"linear-gradient(145deg,#12122a,#0f0f1e)",
      border:`1px solid ${open ? avatarColor+"44" : "#ffffff0f"}`,
      borderRadius:20, marginBottom:14, overflow:"hidden",
      boxShadow: open ? `0 8px 40px ${avatarColor}15` : "0 2px 16px #00000040",
    }}>
      <div onClick={() => setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 18px", cursor:"pointer", userSelect:"none" }}>
        <div style={{
          width:44, height:44, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${avatarColor},${avatarColor}88)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:800, color:"#fff",
          boxShadow:`0 0 16px ${avatarColor}44`,
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15, color:"#f1f5f9", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {user.name}
          </div>
          <div style={{ fontSize:11, color:"#555", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {user.email}
          </div>
          <div style={{ fontSize:10, color:"#444", marginTop:1 }}>Joined {joinDate}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:16, fontWeight:800, color:avatarColor }}>
            {"\u20B9"}{total>=1000?(total/1000).toFixed(1)+"k":Math.round(total)}
          </div>
          <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{userExp.length} expenses</div>
        </div>
        <div style={{ color:avatarColor, fontSize:16, transform:open?"rotate(180deg)":"none", transition:"transform 0.3s", flexShrink:0, marginLeft:4 }}>▾</div>
      </div>

      {open && (
        <div style={{ borderTop:"1px solid #ffffff0a" }}>
          <div style={{ display:"flex", gap:6, padding:"12px 18px 0", flexWrap:"wrap" }}>
            {["overview","expenses","monthly"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:"6px 14px", borderRadius:10, fontSize:12, fontWeight:600,
                cursor:"pointer", border:"none",
                background: tab===t ? avatarColor : "#ffffff0a",
                color: tab===t ? "#fff" : "#777",
              }}>
                {t==="overview"?"📊 Overview":t==="expenses"?"💸 Expenses":"📅 Monthly"}
              </button>
            ))}
          </div>

          <div style={{ padding:"16px 18px 20px" }}>
            {tab==="overview" && (
              <div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
                  {[
                    {icon:"📅", label:"This Month", value:`\u20B9${Math.round(thisMonthTotal)}`, color:"#a78bfa"},
                    {icon:"📆", label:"This Year", value:`\u20B9${thisYearTotal>=1000?(thisYearTotal/1000).toFixed(1)+"k":Math.round(thisYearTotal)}`, color:"#34d399"},
                    {icon:"🧾", label:"All Expenses", value:userExp.length, color:"#f472b6"},
                  ].map((s,i) => (
                    <div key={i} style={{ background:"#ffffff08", borderRadius:12, padding:"12px 14px", border:`1px solid ${s.color}30`, flex:1, minWidth:90 }}>
                      <div style={{ fontSize:16 }}>{s.icon}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:s.color, marginTop:4 }}>{s.value}</div>
                      <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {catData.length > 0 ? (
                  <>
                    <div style={{ fontSize:11, color:"#555", fontWeight:700, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>Spending by category</div>
                    <DonutChart data={catData} size={140} />
                    <div style={{ marginTop:16 }}>
                      {catData.map((c,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                          <div style={{ fontSize:16 }}>{CAT_ICONS[c.category]||"📦"}</div>
                          <div style={{ flex:1, fontSize:13, color:"#ddd", textTransform:"capitalize" }}>{c.category}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:CAT_COLORS[c.category]||"#a78bfa" }}>
                            {"\u20B9"}{Math.round(c.total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign:"center", color:"#444", padding:"20px 0", fontSize:13 }}>No expenses yet</div>
                )}
              </div>
            )}

            {tab==="expenses" && (
              <div>
                {userExp.length===0 ? (
                  <div style={{ textAlign:"center", color:"#444", padding:"20px 0", fontSize:13 }}>No expenses added yet</div>
                ) : (
                  [...userExp].sort((a,b) => new Date(b.date)-new Date(a.date)).map((e,i) => {
                    const dateStr = new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
                    const c = CAT_COLORS[e.category]||"#a78bfa";
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#ffffff06", borderRadius:12, marginBottom:8, border:`1px solid ${c}15` }}>
                        <div style={{ fontSize:20, flexShrink:0 }}>{CAT_ICONS[e.category]||"📦"}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.title}</div>
                          <div style={{ display:"flex", gap:6, marginTop:3, flexWrap:"wrap" }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:8, background:c+"22", color:c, fontWeight:600 }}>{e.category}</span>
                            <span style={{ fontSize:10, color:"#555" }}>📅 {dateStr}</span>
                          </div>
                        </div>
                        <div style={{ fontSize:15, fontWeight:800, color:c, flexShrink:0 }}>{"\u20B9"}{Math.round(parseFloat(e.amount))}</div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {tab==="monthly" && (
              <div>
                <div style={{ fontSize:11, color:"#555", fontWeight:700, marginBottom:12, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  {now.getFullYear()} — Monthly Spending
                </div>
                <MonthlyBar monthlyData={monthlyData} />
                <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
                  {monthlyData.filter(m=>m.total>0).sort((a,b)=>b.total-a.total).map((m,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#ffffff06", borderRadius:10 }}>
                      <span style={{ fontSize:13, color:"#aaa" }}>{MONTHS[m.month-1]} {now.getFullYear()}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:"#a78bfa" }}>{"\u20B9"}{Math.round(m.total)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14, padding:"14px 16px", background:"linear-gradient(135deg,#4c1d9522,#1e1b4b)", borderRadius:14, border:"1px solid #a78bfa22", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"#888", fontSize:13 }}>Yearly Total {now.getFullYear()}</span>
                  <span style={{ color:"#a78bfa", fontWeight:800, fontSize:16 }}>{"\u20B9"}{Math.round(thisYearTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      const [sR,uR,eR] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/expenses"),
      ]);
      setStats(sR.data);
      setUsers(uR.data.users);
      setExpenses(eR.data.expenses);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status===403) setError("Access denied — Admin only");
      else setError("Server error, try again");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 30000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses.filter(e => {
    const d=new Date(e.date), n=new Date();
    return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
  }).reduce((s,e)=>s+parseFloat(e.amount),0);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a16", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:44, height:44, border:"3px solid #2d1b69", borderTop:"3px solid #a78bfa", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <div style={{ color:"#a78bfa", fontSize:14 }}>Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#0a0a16", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
      <div style={{ fontSize:48 }}>🔒</div>
      <div style={{ color:"#f472b6", fontSize:15 }}>{error}</div>
      <button onClick={()=>navigate("/")} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", border:"none", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700 }}>
        Go Back
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0a0a16 0%,#100a24 50%,#0a0a16 100%)", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:"#f1f5f9" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#4c1d95;border-radius:2px}`}</style>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 14px 60px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div>
            <div style={{ fontSize:11, color:"#7c3aed", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>Admin Panel</div>
            <h1 style={{ margin:"4px 0 0", fontSize:"clamp(22px,5vw,30px)", fontWeight:900, background:"linear-gradient(135deg,#a78bfa,#f472b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Dashboard 🛡️
            </h1>
          </div>
          <button onClick={fetchAll} style={{ background:"#ffffff0a", border:"1px solid #ffffff15", color:"#a78bfa", padding:"8px 14px", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:700 }}>
            ↻ Refresh
          </button>
        </div>

        {lastUpdated && (
          <div style={{ fontSize:10, color:"#444", marginBottom:20 }}>
            Updated: {lastUpdated.toLocaleTimeString("en-IN")} · Auto-refreshes every 30s
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          {[
            {icon:"👥", label:"Total Users", value:stats?.totalUsers, color:"#a78bfa"},
            {icon:"💸", label:"Total Expenses", value:stats?.totalExpenses, color:"#f472b6"},
            {icon:"💰", label:"Total Amount", value:`\u20B9${parseFloat(stats?.totalAmount||0)>=1000?(parseFloat(stats?.totalAmount||0)/1000).toFixed(1)+"k":Math.round(parseFloat(stats?.totalAmount||0))}`, color:"#34d399"},
            {icon:"📅", label:"This Month", value:`\u20B9${totalThisMonth>=1000?(totalThisMonth/1000).toFixed(1)+"k":Math.round(totalThisMonth)}`, color:"#fb923c"},
          ].map((s,i) => (
            <div key={i} style={{ flex:1, minWidth:90, background:"#ffffff08", border:`1px solid ${s.color}25`, borderRadius:16, padding:"14px 16px" }}>
              <div style={{ fontSize:20 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:900, color:s.color, lineHeight:1, marginTop:6 }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#555", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="🔍  Search users..."
          style={{ width:"100%", padding:"12px 16px", borderRadius:14, background:"#ffffff08", border:"1px solid #ffffff15", color:"#e2e8f0", fontSize:14, outline:"none", marginBottom:14 }}
        />

        <div style={{ fontSize:12, color:"#555", marginBottom:14, fontWeight:600 }}>
          {filtered.length} user{filtered.length!==1?"s":""} — tap to expand
        </div>

        {filtered.map((user,idx) => (
          <UserCard key={user.id} user={user} expenses={expenses} idx={idx} />
        ))}

        {filtered.length===0 && (
          <div style={{ textAlign:"center", color:"#444", padding:"40px 0", fontSize:14 }}>No users found</div>
        )}
      </div>
    </div>
  );
}