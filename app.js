const ids=["annualTarget","caseValue","weeks","currentLeads","intakeQual","consultRate","cesQual","closeRate","qualMinutes","unanswered","attempts","attemptMinutes","docHours","monitorHours","intakeAdmin","productiveHours","coverageFloor","automationPct","cesCapacity","consultMinutes","cesFollow","cesAdmin","marketingHours","marketingProductive","managerSpan","managerAdmin"];
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const defaultWeights=[8,8,9,9,9,8,8,8,8,8,9,8];
const $=id=>document.getElementById(id), n=id=>Math.max(0,Number($(id).value)||0), p=id=>Math.min(1,n(id)/100);
const fmt=x=>Number.isFinite(x)?x.toLocaleString(undefined,{maximumFractionDigits:1}):"—";
const money=x=>Number.isFinite(x)?x.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}):"—";
function initSeason(){const saved=JSON.parse(localStorage.getItem("capacityWeights")||"null")||defaultWeights; $("seasonGrid").innerHTML=months.map((m,i)=>`<label>${m} weight (%)<input class="weight" data-i="${i}" type="number" min="0" step=".1" value="${saved[i]}"></label>`).join(""); document.querySelectorAll(".weight").forEach(x=>x.addEventListener("input",()=>{save();calc()}));}
function save(){const state={};ids.forEach(id=>state[id]=$(id).value);localStorage.setItem("capacityState",JSON.stringify(state));localStorage.setItem("capacityWeights",JSON.stringify([...document.querySelectorAll(".weight")].map(x=>Number(x.value)||0)));}
function load(){const s=JSON.parse(localStorage.getItem("capacityState")||"null");if(s)ids.forEach(id=>{if(s[id]!=null)$(id).value=s[id]});}
function card(label,val,sub=""){return `<article><span>${label}</span><strong>${val}</strong>${sub?`<small>${sub}</small>`:""}</article>`}
function calc(){
 const target=n("annualTarget"), value=Math.max(1,n("caseValue")), weeks=Math.max(1,n("weeks")), leads=n("currentLeads");
 const iq=p("intakeQual"), cr=p("consultRate"), cq=p("cesQual"), close=p("closeRate"), funnel=iq*cr*cq*close;
 const targetClients=target/value, clientsW=targetClients/weeks, leadsTarget=funnel?clientsW/funnel:0, targetConsults=leadsTarget*iq*cr;
 const q=leads*iq, consults=q*cr, legalQ=consults*cq, clients=legalQ*close;
 $("kTarget").textContent=money(target);$("kClients").textContent=fmt(targetClients);$("kLeads").textContent=fmt(leadsTarget);$("kConsults").textContent=fmt(targetConsults);
 $("funnelFlow").innerHTML=card("Incoming leads / week",fmt(leads))+card("Intake-qualified / week",fmt(q),`${fmt(iq*100)}% qualify`)+card("Consultations / week",fmt(consults),`${fmt(cr*100)}% scheduled`)+card("New clients / week",fmt(clients),`${fmt(close*100)}% of qualified consults close`);
 const auto=p("automationPct"), qualH=q*n("qualMinutes")/60, followH=n("unanswered")*n("attempts")*(1-auto)*n("attemptMinutes")/60;
 const intakeH=qualH+followH+n("docHours")+n("monitorHours")+n("intakeAdmin"), prod=Math.max(1,n("productiveHours")), intakeRaw=intakeH/prod, intakeNow=Math.max(n("coverageFloor"),Math.ceil(intakeRaw));
 const scale=leads?leadsTarget/leads:0, intakeTargetRaw=intakeRaw*scale, intakeTarget=Math.max(n("coverageFloor"),Math.ceil(intakeTargetRaw));
 $("intakeCards").innerHTML=card("Weekly workload",fmt(intakeH)+" hrs")+card("Workload-based employees",fmt(intakeRaw))+card("Practical staffing now",fmt(intakeNow))+card("Annual-target staffing",fmt(intakeTarget));
 const cesCap=Math.max(1,n("cesCapacity")), cesNow=consults/cesCap, cesTarget=targetConsults/cesCap, leadsPerCes=iq*cr?cesCap/(iq*cr):0;
 $("cesCards").innerHTML=card("Current consult demand",fmt(consults)+"/wk")+card("CES needed now",fmt(cesNow)+" → "+Math.ceil(cesNow))+card("CES needed at target",fmt(cesTarget)+" → "+Math.ceil(cesTarget))+card("Leads supported / CES",fmt(leadsPerCes)+"/wk");
 const marketingRaw=n("marketingHours")/Math.max(1,n("marketingProductive")), marketing=Math.max(1,Math.ceil(marketingRaw));
 const opNow=intakeNow+Math.ceil(cesNow)+marketing, managersNow=Math.max(1,Math.ceil(opNow/Math.max(1,n("managerSpan"))));
 const opTarget=intakeTarget+Math.ceil(cesTarget)+marketing, managersTarget=Math.max(1,Math.ceil(opTarget/Math.max(1,n("managerSpan"))));
 $("marketingCards").innerHTML=card("Marketing workload ratio",fmt(marketingRaw))+card("Marketing employees",fmt(marketing))+card("Operating staff modeled",fmt(opNow))+card("Managers by span",fmt(managersNow));
 $("summaryBody").innerHTML=`<tr><td>Intake</td><td>${intakeNow}</td><td>${intakeTarget}</td><td>Lead volume, qualification, follow-up, documents, coverage</td></tr><tr><td>Client Engagement</td><td>${Math.ceil(cesNow)}</td><td>${Math.ceil(cesTarget)}</td><td>Consultations per week</td></tr><tr><td>Marketing Operations</td><td>${marketing}</td><td>${marketing}</td><td>Actual weekly workload and vendor complexity</td></tr><tr><td>Sales & Marketing Management</td><td>${managersNow}</td><td>${managersTarget}</td><td>Direct-report span and management complexity</td></tr>`;
 const weights=[...document.querySelectorAll(".weight")].map(x=>Math.max(0,Number(x.value)||0)), total=weights.reduce((a,b)=>a+b,0);$("weightTotal").textContent=fmt(total)+"%";$("weightTotal").style.color=Math.abs(total-100)<.01?"#16794b":"#b54708";
 $("seasonTable").innerHTML=months.map((m,i)=>{const share=total?weights[i]/total:0, mt=target*share;return `<tr><td>${m}</td><td>${fmt(weights[i])}%</td><td>${money(mt)}</td><td>${fmt(mt/value)}</td></tr>`}).join("");
}
ids.forEach(id=>$(id).addEventListener("input",()=>{save();calc()}));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab).classList.add("active")}));
$("reset").addEventListener("click",()=>{localStorage.removeItem("capacityState");localStorage.removeItem("capacityWeights");location.reload()});
initSeason();load();calc();