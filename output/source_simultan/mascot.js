// mascot: 9 poses; each is scaled so its face matches and placed so the mouth lands on the same screen point
const MA={x:831,y:1668};
(function(){$('#mas').innerHTML=Object.entries(MAS).map(([k,v])=>{const i=MI[k],s=i.s,wd=(i.W||900)*s,mx=(i.x+i.w/2)*s,my=(i.y+i.h/2)*s;
  let lf=MA.x-mx;const ov=lf+wd-1068;if(ov>0)lf-=ov;
  return `<div class="pz" id="${k}" style="left:${lf.toFixed(1)}px;top:${(MA.y-my).toFixed(1)}px;width:${wd.toFixed(1)}px"><img src="${v}" style="display:block;width:100%"><div class="mo" id="mo_${k}" style="left:${(i.x*s).toFixed(2)}px;top:${(i.y*s).toFixed(2)}px;width:${(i.w*s).toFixed(2)}px;height:${(i.h*s).toFixed(2)}px;background-image:url(${MO[k]});transform-origin:50% ${((i.top+(i.h-2*i.top)*.18)*s).toFixed(1)}px"></div></div>`}).join('')})();
function MOUTH(t,pose){const f=Math.max(0,Math.min(LIP.o.length-1,Math.round(t*60)));const o=LIP.o[f],w=LIP.w[f];
  const mn=pose==='m_think'?.3:pose==='m_warn'?.22:.13;
  $('#mo_'+pose).style.transform=`scale(${(.9+.16*w-.06*o).toFixed(3)},${(mn+(1-mn)*o).toFixed(3)})`;return o}
function MASC(t){let pose=PT[0][1],t0=-1;for(const [a,p] of PT)if(t>=a){pose=p;t0=a}
  Object.keys(MAS).forEach(n=>$('#'+n).style.display=n===pose?'block':'none');const lo=MOUTH(t,pose);
  const ch=P(t,t0-.05,t0+.3),e=ch>0?bk(ch,1.4):1;const m=$('#mas');m.style.transform=`translateY(${((1-e)*30-3*lo).toFixed(1)}px) rotate(${(1.2*Math.sin(t*1.7)).toFixed(2)}deg) scale(${(.96+.04*e).toFixed(3)})`;op(m,P(t,0,.25))}
